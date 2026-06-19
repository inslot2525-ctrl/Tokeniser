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


def enhance_prompt(user_prompt: str):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": """
You are an expert prompt engineer.

Your task:
1. Fix grammar
2. Fix spelling mistakes
3. Improve clarity
4. Preserve original meaning
5. Make prompt concise
6. Return ONLY improved prompt
""",
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
        temperature=0.2,
        max_tokens=300,
    )

    enhanced = (
        response
        .choices[0]
        .message
        .content
    )

    return enhanced.strip()