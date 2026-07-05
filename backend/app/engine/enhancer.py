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
You are a prompt enhancement engine.

IMPORTANT RULES:
- You NEVER answer the user's question.
- You NEVER act like a chatbot.
- You NEVER respond conversationally.
- Your only job is rewriting text.

Tasks:
1. Fix grammar
2. Fix spelling
3. Improve clarity
4. Preserve meaning
5. Make wording cleaner
6. Return ONLY rewritten prompt

Example:
Input: hello chatgpt how are you what is ml
Output: Hello ChatGPT, how are you? What is machine learning (ML)?
"""
            },
            {
                "role": "user",
                "content": f"Rewrite this prompt only:\n{user_prompt}"
            }
        ],
        temperature=0.1,
        max_tokens=300
    )

    enhanced = (
        response
        .choices[0]
        .message
        .content
    )

    return enhanced.strip()