import os
from google import genai

API_KEY = os.getenv("GEMINI_API_KEY")

print("GEMINI_API_KEY loaded:", API_KEY is not None)
print("MODEL_PROVIDER:", os.getenv("MODEL_PROVIDER"))

client = genai.Client(api_key=API_KEY)


def generate(prompt: str) -> str:
    print("Calling Gemini...")

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    print("Gemini call successful")

    return response.text