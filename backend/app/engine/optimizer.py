from app.core.gemini_client import client

from app.engine.tokenizer import count_tokens


def optimize_prompt(prompt: str):

    original_prompt = prompt

    original_tokens = count_tokens(prompt)

    system_prompt = f"""
You are a prompt optimization engine.

Rules:

1. Preserve original meaning exactly.
2. Remove filler words.
3. Remove politeness.
4. Compress aggressively.
5. Reduce token count.
6. Preserve constraints.
7. Return ONLY the optimized prompt.

Prompt:

{prompt}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=system_prompt,
    )

    optimized_prompt = response.text.strip()

    optimized_tokens = count_tokens(
        optimized_prompt
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