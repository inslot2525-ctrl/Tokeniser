import os
import traceback

from app.engine.ollama_client import (
    generate as ollama_generate,
)

from app.engine.gemini_client import (
    generate as gemini_generate,
)


MODEL_PROVIDER = os.getenv(
    "MODEL_PROVIDER",
    "auto"
).lower()


def generate(prompt: str) -> str:
    """
    Universal LLM Provider

    Supported Modes:

    MODEL_PROVIDER=ollama
        -> Always use Ollama

    MODEL_PROVIDER=gemini
        -> Always use Gemini

    MODEL_PROVIDER=auto
        -> Try Ollama first
        -> Fall back to Gemini
    """

    print("\n==============================")
    print("LLM PROVIDER")
    print("==============================")
    print(f"Mode : {MODEL_PROVIDER}")

    # --------------------------------------------------
    # GEMINI MODE
    # --------------------------------------------------

    if MODEL_PROVIDER == "gemini":

        print("Using Gemini")

        try:
            response = gemini_generate(prompt)

            print("Gemini Success")

            return response

        except Exception as e:

            print("\nGemini Error")
            print("--------------------")
            traceback.print_exc()

            raise Exception(
                f"Gemini failed : {e}"
            )

    # --------------------------------------------------
    # OLLAMA MODE
    # --------------------------------------------------

    if MODEL_PROVIDER == "ollama":

        print("Using Ollama")

        try:

            response = ollama_generate(prompt)

            print("Ollama Success")

            return response

        except Exception as e:

            print("\nOllama Error")
            print("--------------------")
            traceback.print_exc()

            raise Exception(
                f"Ollama failed : {e}"
            )

    # --------------------------------------------------
    # AUTO MODE
    # --------------------------------------------------

    print("AUTO MODE")

    try:

        print("Trying Ollama...")

        response = ollama_generate(prompt)

        print("Ollama Available")

        return response

    except Exception as ollama_error:

        print("\nOllama unavailable.")
        print("--------------------")
        print(ollama_error)

        print("\nSwitching to Gemini...")

        try:

            response = gemini_generate(prompt)

            print("Gemini Success")

            return response

        except Exception as gemini_error:

            print("\nGemini Failed")
            print("--------------------")
            traceback.print_exc()

            raise Exception(
                f"""
LLM Provider Failure

Ollama Error:
{ollama_error}

Gemini Error:
{gemini_error}
"""
            )