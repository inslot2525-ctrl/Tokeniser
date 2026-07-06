from app.core.gemini_client import client

from app.engine.tokenizer import (
    count_tokens,
)


def smart_optimize_prompt(
    user_prompt: str,
) -> str:
    """
    Returns ONLY the optimized prompt.
    Used by the Agent.
    """

    prompt = f"""
You are an expert AI prompt optimizer.

Tasks:
1. Fix grammar.
2. Fix spelling.
3. Improve clarity.
4. Remove unnecessary words.
5. Preserve exact meaning.
6. Reduce token count.
7. Return ONLY the optimized prompt.
8. Do not explain anything.

Prompt:

{user_prompt}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    return response.text.strip()


def smart_optimize_with_metrics(
    user_prompt: str,
):
    """
    Returns optimized prompt + token statistics.
    Used by the Extension/Web UI.
    """

    optimized = smart_optimize_prompt(
        user_prompt
    )

    original_tokens = count_tokens(
        user_prompt
    )

    optimized_tokens = count_tokens(
        optimized
    )

    saved_tokens = (
        original_tokens
        - optimized_tokens
    )

    savings_percent = 0

    if original_tokens > 0:
        savings_percent = round(
            (
                saved_tokens
                / original_tokens
            ) * 100,
            2,
        )

    return {
        "original": user_prompt,
        "optimized": optimized,
        "original_tokens": original_tokens,
        "optimized_tokens": optimized_tokens,
        "saved_tokens": saved_tokens,
        "savings_percent": savings_percent,
    }