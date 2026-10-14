from app.engine.tokenizer import count_tokens

# A rewrite call costs about 120 tokens of instructions plus the prompt twice
# (in and out). Below this size it cannot save enough on the answering call to
# be worth running.
MIN_OPTIMIZE_TOKENS = 60


def plan_actions(prompt: str) -> dict:
    tokens = count_tokens(prompt)

    if tokens < MIN_OPTIMIZE_TOKENS:
        return {
            "optimize": False,
            "reason": f"Prompt is {tokens} tokens; a rewrite would cost more than it saves.",
        }

    return {
        "optimize": True,
        "reason": f"Prompt is {tokens} tokens; worth one rewrite pass to trim it.",
    }
