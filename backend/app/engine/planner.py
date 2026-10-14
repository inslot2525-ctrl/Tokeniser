from app.engine import compressor
from app.engine.tokenizer import count_tokens

# An LLM rewrite call costs about 120 tokens of instructions plus the prompt
# twice (in and out). Below this size it cannot save enough on the answering
# call to be worth running.
MIN_LLM_REWRITE_TOKENS = 60


def plan_actions(prompt: str) -> dict:
    tokens = count_tokens(prompt)

    if compressor.enabled():
        if tokens < compressor.MIN_TOKENS:
            return {
                "optimize": False,
                "reason": f"Prompt is {tokens} tokens; too short to compress safely.",
            }
        return {
            "optimize": True,
            "reason": f"Prompt is {tokens} tokens; compressing locally with {compressor.NAME} (no API cost).",
        }

    if tokens < MIN_LLM_REWRITE_TOKENS:
        return {
            "optimize": False,
            "reason": f"Prompt is {tokens} tokens; a rewrite would cost more than it saves.",
        }

    return {
        "optimize": True,
        "reason": f"Prompt is {tokens} tokens; worth one rewrite pass to trim it.",
    }
