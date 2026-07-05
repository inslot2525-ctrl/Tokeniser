import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError(
        "GROQ_API_KEY not found in .env"
    )

client = Groq(api_key=api_key)


def compress_prompt(user_prompt: str):
    prompt = f"""
You are a prompt compression engine.

Rules:
1. Preserve exact intent
2. Remove filler words
3. Remove politeness fluff
4. Reduce token count aggressively
5. Keep important constraints
6. Return only compressed prompt

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
        temperature=0.2
    )

    return (
        response
        .choices[0]
        .message
        .content
        .strip()
    )