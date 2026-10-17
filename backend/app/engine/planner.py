from app import config
from app.engine import compressor
from app.engine.tokenizer import count_tokens

# An LLM rewrite call costs about 120 tokens of instructions plus the prompt
# twice (in and out). Below this size it cannot save enough on the answering
# call to be worth running.
MIN_LLM_REWRITE_TOKENS = 60


def plan_actions(prompt: str) -> dict:
    tokens = count_tokens(prompt)

    if config.COMPRESSOR == "llm":
        if tokens < MIN_LLM_REWRITE_TOKENS:
            return {
                "optimize": False,
                "reason": f"Prompt is {tokens} tokens; a rewrite would cost more than it saves.",
            }
        return {
            "optimize": True,
            "reason": f"Prompt is {tokens} tokens; worth one rewrite pass to trim it.",
        }

    # Local compression is free. Rules only remove listed filler, so they are
    # safe at any length; LLMLingua-2 joins in for longer prompts.
    if compressor.enabled() and tokens >= compressor.MIN_TOKENS:
        how = f"rules + {compressor.NAME}"
    else:
        how = "rules"
    return {
        "optimize": True,
        "reason": f"Prompt is {tokens} tokens; compressing locally with {how} (no API cost).",
    }
