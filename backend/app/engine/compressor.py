from app.core.gemini_client import client


def compress_prompt(user_prompt: str) -> str:

    prompt = f"""
You are a prompt compression engine.

Rules:
1. Preserve exact intent.
2. Remove filler words.
3. Remove politeness.
4. Reduce token count aggressively.
5. Preserve all constraints.
6. Return ONLY the compressed prompt.
7. Do not explain anything.

Prompt:

{user_prompt}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    return response.text.strip()