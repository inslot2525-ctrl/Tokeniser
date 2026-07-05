import os
from groq import Groq

from app.engine.tokenizer import (
    count_tokens,
)

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def smart_optimize_prompt(user_prompt: str):
    prompt = f"""
You are an AI prompt optimizer.

Tasks:
1. Fix grammar
2. Fix spelling
3. Improve clarity
4. Compress wording
5. Preserve exact meaning
6. Minimize token count
7. Return only final optimized prompt

Prompt:
{user_prompt}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3
    )

    optimized = (
        response
        .choices[0]
        .message
        .content
        .strip()
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
            2
        )

    return {
        "original": user_prompt,
        "optimized": optimized,
        "original_tokens": original_tokens,
        "optimized_tokens": optimized_tokens,
        "saved_tokens": saved_tokens,
        "savings_percent": savings_percent,
    }