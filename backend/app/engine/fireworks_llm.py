from app.core.gemini_client import client


def remote_generate(prompt: str) -> str:

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    return response.text.strip()