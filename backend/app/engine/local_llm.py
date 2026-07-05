import requests

OLLAMA_URL = "http://localhost:11434/api/generate"

MODEL_NAME = "gemma3:4b"


def local_generate(prompt: str):

    print("Calling Ollama...")

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
        },
        timeout=300,
    )

    print("Status:", response.status_code)

    response.raise_for_status()

    data = response.json()

    print("Received response")

    return data["response"]