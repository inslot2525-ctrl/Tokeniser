import os
from groq import Groq
from app.engine.tokenizer import count_tokens

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def optimize_prompt(prompt: str):
    original_prompt = prompt
    original_tokens = count_tokens(prompt)

    system_prompt = f"""
You are a prompt optimization engine.

Your task:
1. Preserve original meaning exactly
2. Remove filler words
3. Remove politeness fluff
4. Compress wording aggressively
5. Reduce token count as much as possible
6. Keep important constraints
7. Return ONLY optimized prompt

Prompt:
{prompt}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": system_prompt
            }
        ],
        temperature=0.2
    )

    optimized_prompt = (
        response.choices[0]
        .message.content
        .strip()
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
            (saved_tokens / original_tokens) * 100,
            2
        )

    return {
        "original": original_prompt,
        "optimized": optimized_prompt,
        "original_tokens": original_tokens,
        "optimized_tokens": optimized_tokens,
        "saved_tokens": saved_tokens,
        "savings_percent": savings_percent,
    }