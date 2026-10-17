"""The /agent pipeline, in five steps:

    1. Risk check     block obvious jailbreak / exfiltration prompts
    2. Compress       rules, then LLMLingua-2 if installed (no API tokens)
    3. Route          easy -> local model, hard -> Gemini (AI mode only)
    4. Answer         if no model is available, return the compressed prompt
    5. Check          free rule checks; in AI mode a local answer that fails
                      them, or scores low with the Gemini judge, is re-answered
                      by Gemini

Every LLM call is counted, so the response reports what the pipeline itself
cost as well as what it saved.
"""

import logging

from app import config
from app.analytics.metrics import log_request
from app.engine import llm
from app.engine.answer_checks import check_answer
from app.engine.complexity import analyze_prompt
from app.engine.jailbreak_detector import detect_prompt_risk
from app.engine.optimizer import compress
from app.engine.router import call_cost, choose_backend, format_cost
from app.engine.tokenizer import count_tokens
from app.engine.verifier import verify_response

log = logging.getLogger(__name__)

BLOCKED_MESSAGE = (
    "This prompt was blocked because it matches known jailbreak or "
    "data-exfiltration patterns."
)


def run_agent(prompt: str) -> dict:
    steps: list[str] = []
    original_tokens = count_tokens(prompt)

    # 1. Risk check
    risk = detect_prompt_risk(prompt)
    if risk["risk"] == "HIGH":
        log.info("Blocked prompt: %s", risk["matched_patterns"])
        return _finish(prompt, prompt, ["Blocked by risk detector"], risk=risk,
                       route="Blocked", response=BLOCKED_MESSAGE)
    if risk["risk"] == "MEDIUM":
        steps.append(f"Risk flagged ({risk['attack_type']}), continuing")

    # 2. Compress
    compressed = compress(prompt)
    current = compressed.text
    if count_tokens(current) < original_tokens:
        labels = sorted({r["label"] for r in compressed.removed})
        removed = f" (removed {', '.join(labels)})" if labels else ""
        steps.append(f"Prompt compressed with {compressed.method}{removed}")
    else:
        steps.append("Nothing to compress")

    # 3. Route, 4. Answer
    analysis = analyze_prompt(current)
    try:
        answer = llm.generate(current, choose_backend(analysis))
    except llm.ModelUnavailable:
        # Free mode with no local model: the compressed prompt is the result.
        steps.append(f"No model available to answer; recommended route is {analysis['recommended_route']}")
        return _finish(prompt, current, steps, risk=risk, analysis=analysis, route="Not answered")
    steps.append(f"Answered by {answer.model} ({answer.backend})")

    # 5. Check
    answers, judge_call, verification, checks = _check_and_escalate(prompt, current, answer, steps)
    final = answers[-1]

    return _finish(
        prompt, current, steps, risk=risk, analysis=analysis,
        route=final.backend, model=final.model, response=final.text,
        checks=checks, verification=verification,
        pipeline_calls=[judge_call] if judge_call else [], answer_calls=answers,
    )


def _check_and_escalate(prompt, current, answer, steps):
    """Rule checks run on every answer, against the ORIGINAL prompt so that no
    constraint is hidden by compression. In AI mode a local answer is also
    judged by Gemini; a failed check or a low score means Gemini re-answers.

    Returns (every answer produced, judge call or None, verdict or None, checks)."""
    answers = [answer]
    checks = check_answer(prompt, answer.text)
    judge_call, verification = None, None

    if answer.backend == llm.LOCAL and not llm.remote_available():
        steps.append("Answer not judged: the LLM judge needs AI mode")

    elif answer.backend == llm.LOCAL:
        if not checks["passed"]:
            # Visibly broken: skip the judge and escalate straight away.
            steps.append(f"Rule checks failed: {'; '.join(checks['issues'])}")
            reason = "Escalated to Gemini without a judge call"
        else:
            verification, judge_call = verify_response(current, answer.text)
            steps.append(f"Judge scored local answer {verification['score']}/10")
            reason = "Escalated to Gemini after low judge score"

        if not checks["passed"] or verification["score"] < config.VERIFY_THRESHOLD:
            answers.append(llm.gemini_generate(current))
            steps.append(reason)
            checks = check_answer(prompt, answers[-1].text)

    if checks["passed"]:
        steps.append("Rule checks passed")
    elif answers[-1].backend == llm.REMOTE or not llm.remote_available():
        steps.append(f"Rule checks flagged: {'; '.join(checks['issues'])}")

    return answers, judge_call, verification, checks


def _finish(prompt, current, steps, *, risk, route, analysis=None, model="-", response=None,
            checks=None, verification=None, pipeline_calls=(), answer_calls=()) -> dict:
    original, optimized = count_tokens(prompt), count_tokens(current)
    overhead = sum(c.input_tokens + c.output_tokens for c in pipeline_calls)
    cost = sum(call_cost(c) for c in [*pipeline_calls, *answer_calls])
    judge_score = verification["score"] if verification else None

    log_request(
        route=route, difficulty=analysis["difficulty"] if analysis else "-",
        original_tokens=original, optimized_tokens=optimized, overhead_tokens=overhead,
        verification_score=judge_score, cost=cost,
    )

    return {
        "mode": "ai" if llm.remote_available() else "free",
        "original_prompt": prompt,
        "processed_prompt": current,
        "steps": steps,
        "route": route,  # "Local" | "Gemini" | "Blocked" | "Not answered"
        "model": model,
        "response": response,  # None when no model answered
        "risk": risk,
        "analysis": analysis,
        "checks": checks,
        "verification": verification,
        # Judge score as a percentage; None unless the Gemini judge ran.
        "judge_score": round(judge_score * 10) if judge_score is not None else None,
        "estimated_remote_cost": format_cost(cost),
        "tokens": {
            "original": original,
            "optimized": optimized,
            "saved": original - optimized,
            "pipeline_overhead": overhead,  # tokens spent by the judge
            "net_saved": original - optimized - overhead,
        },
    }
