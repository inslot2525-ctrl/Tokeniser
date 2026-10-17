"""The /agent pipeline.

    risk check -> compress (rules, + LLMLingua-2) -> classify + route -> answer
               -> rule checks -> (AI mode: judge local answers, escalate if weak)

Every LLM call the pipeline makes is counted, so the response reports net
token savings (prompt tokens saved minus the pipeline's own overhead), not
just how much shorter the prompt got.
"""

import logging

from app import config
from app.analytics.metrics import log_request
from app.engine import llm
from app.engine.answer_checks import check_answer
from app.engine.complexity import analyze_prompt
from app.engine.jailbreak_detector import detect_prompt_risk
from app.engine.optimizer import rewrite
from app.engine.planner import plan_actions
from app.engine.router import call_cost, choose_backend, format_cost
from app.engine.tokenizer import count_tokens
from app.engine.verifier import verify_response

log = logging.getLogger(__name__)

BLOCKED_MESSAGE = (
    "This prompt was blocked because it matches known jailbreak or "
    "data-exfiltration patterns."
)


def run_agent(prompt: str) -> dict:
    original_tokens = count_tokens(prompt)
    risk = detect_prompt_risk(prompt)

    if risk["risk"] == "HIGH":
        log.info("Blocked prompt: %s", risk["matched_patterns"])
        log_request(
            route="Blocked", difficulty="-", original_tokens=original_tokens,
            optimized_tokens=original_tokens, overhead_tokens=0,
            verification_score=None, cost=0.0,
        )
        return _response(
            prompt, prompt, "Blocked by risk detector.", ["Blocked by risk detector"],
            route="Blocked", model="-", confidence=risk["confidence"], cost=0.0,
            verification=None, response=BLOCKED_MESSAGE, risk=risk, analysis=None,
            tokens=_tokens(original_tokens, original_tokens, 0), checks=None,
        )

    steps = []
    calls: list[llm.LLMResult] = []  # pipeline overhead calls, not the answer itself
    if risk["risk"] == "MEDIUM":
        steps.append(f"Risk flagged ({risk['attack_type']}), continuing")

    plan = plan_actions(prompt)
    current = prompt
    if plan["optimize"]:
        try:
            rewritten = rewrite(prompt, "optimize")
        except llm.ModelUnavailable:
            rewritten = None
            steps.append("Prompt not compressed: no compressor or model available")
        if rewritten and rewritten.call:
            calls.append(rewritten.call)
        if rewritten and count_tokens(rewritten.text) < original_tokens:
            current = rewritten.text
            labels = sorted({r["label"] for r in rewritten.removed})
            removed = f" (removed {', '.join(labels)})" if labels else ""
            steps.append(f"Prompt compressed with {rewritten.backend}{removed}")
        elif rewritten:
            steps.append("Rewrite was not shorter; kept original prompt")

    analysis = analyze_prompt(current)
    optimized_tokens = count_tokens(current)

    try:
        answer = llm.generate(current, choose_backend(analysis))
    except llm.ModelUnavailable:
        # Free mode with no local model: the optimized prompt is the result.
        steps.append(
            f"No model available to answer; recommended route is {analysis['recommended_route']}"
        )
        overhead = sum(c.input_tokens + c.output_tokens for c in calls)
        log_request(
            route="Not answered", difficulty=analysis["difficulty"],
            original_tokens=original_tokens, optimized_tokens=optimized_tokens,
            overhead_tokens=overhead, verification_score=None, cost=0.0,
        )
        return _response(
            prompt, current, plan["reason"], steps,
            route="Not answered", model="-", confidence=None, cost=0.0,
            verification=None, response=None, risk=risk, analysis=analysis,
            tokens=_tokens(original_tokens, optimized_tokens, overhead), checks=None,
        )

    steps.append(f"Answered by {answer.model} ({answer.backend})")
    answer_calls = [answer]

    # Free rule checks first, against the original prompt so no constraint is
    # lost to compression. Confidence is only reported when a judge scored it.
    checks = check_answer(prompt, answer.text)
    verification = None
    confidence = None

    if answer.backend == llm.LOCAL and llm.remote_available():
        if not checks["passed"]:
            steps.append(f"Rule checks failed: {'; '.join(checks['issues'])}")
            answer = llm.gemini_generate(current)
            answer_calls.append(answer)
            steps.append("Escalated to Gemini without a judge call")
            checks = check_answer(prompt, answer.text)
        else:
            verification, judge = verify_response(current, answer.text)
            calls.append(judge)
            confidence = round(verification["score"] * 10)
            steps.append(f"Verifier scored local answer {verification['score']}/10")

            if verification["score"] < config.VERIFY_THRESHOLD:
                answer = llm.gemini_generate(current)
                answer_calls.append(answer)
                confidence = None
                steps.append("Escalated to Gemini after low verifier score")
                checks = check_answer(prompt, answer.text)
    elif answer.backend == llm.LOCAL:
        steps.append("Answer not judged: the LLM judge needs AI mode")

    if checks["passed"]:
        steps.append("Rule checks passed")
    elif answer.backend == llm.REMOTE or not llm.remote_available():
        steps.append(f"Rule checks flagged: {'; '.join(checks['issues'])}")

    overhead = sum(c.input_tokens + c.output_tokens for c in calls)
    cost = sum(call_cost(c) for c in calls + answer_calls)

    log_request(
        route=answer.backend, difficulty=analysis["difficulty"],
        original_tokens=original_tokens, optimized_tokens=optimized_tokens,
        overhead_tokens=overhead,
        verification_score=verification["score"] if verification else None,
        cost=cost,
    )

    return _response(
        prompt, current, plan["reason"], steps,
        route=answer.backend, model=answer.model, confidence=confidence, cost=cost,
        verification=verification, response=answer.text, risk=risk, analysis=analysis,
        tokens=_tokens(original_tokens, optimized_tokens, overhead), checks=checks,
    )


def _tokens(original: int, optimized: int, overhead: int) -> dict:
    return {
        "original": original,
        "optimized": optimized,
        "saved": original - optimized,
        "pipeline_overhead": overhead,
        # Negative means the pipeline spent more tokens than it saved.
        "net_saved": original - optimized - overhead,
    }


def _response(original, processed, reason, steps, *, route, model, confidence, cost,
              verification, response, risk, analysis, tokens, checks) -> dict:
    return {
        "mode": "ai" if llm.remote_available() else "free",
        "original_prompt": original,
        "processed_prompt": processed,
        "planner_reason": reason,
        "steps": steps,
        "route": route,
        "model": model,
        "confidence": confidence,
        "estimated_remote_cost": format_cost(cost),
        "verification": verification,
        "checks": checks,
        "response": response,
        "risk": risk,
        "analysis": analysis,
        "tokens": tokens,
    }
