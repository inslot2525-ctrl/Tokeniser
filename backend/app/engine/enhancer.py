import textwrap

from app.core.gemini_client import client


SYSTEM_PROMPT = textwrap.dedent("""
You are an expert prompt engineer.

Your task is to improve prompts.

Rules:
1. Fix grammar.
2. Fix spelling.
3. Improve clarity.
4. Preserve the original meaning.
5. Remove unnecessary words.
6. Return ONLY the improved prompt.
7. Do not explain your changes.
""")


def enhance_prompt(user_prompt: str) -> str:

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"""
{SYSTEM_PROMPT}

Prompt:

{user_prompt}
""",
    )

    return response.text.strip()