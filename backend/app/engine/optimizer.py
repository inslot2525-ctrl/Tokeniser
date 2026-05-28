import re

from app.engine.rules import RULES

from app.engine.tokenizer import (
    count_tokens,
)


def clean_whitespace(text: str) -> str:
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def apply_rules(text: str) -> str:
    optimized = text.lower()

    for old, new in RULES.items():
        optimized = optimized.replace(
            old,
            new
        )

    return optimized


def optimize_prompt(prompt: str):
    original_prompt = prompt

    original_tokens = count_tokens(
        original_prompt
    )

    optimized_prompt = clean_whitespace(
        apply_rules(prompt)
    )

    optimized_tokens = count_tokens(
        optimized_prompt
    )

    saved_tokens = (
        original_tokens - optimized_tokens
    )

    savings_percent = 0

    if original_tokens > 0:
        savings_percent = round(
            (
                saved_tokens
                / original_tokens
            )
            * 100,
            2,
        )

    return {
        "original": original_prompt,
        "optimized": optimized_prompt,
        "original_tokens": original_tokens,
        "optimized_tokens": optimized_tokens,
        "saved_tokens": saved_tokens,
        "savings_percent": savings_percent,
    }