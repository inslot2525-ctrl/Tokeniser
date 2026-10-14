"""Thin clients for the two model backends.

Every call returns an LLMResult so callers can account for the tokens the
pipeline itself spends, not just the tokens in the user's prompt.
"""

import logging
from dataclasses import dataclass
from functools import lru_cache

import requests

from app import config
from app.engine.tokenizer import count_tokens

log = logging.getLogger(__name__)

LOCAL = "Local"
REMOTE = "Gemini"


class LLMError(RuntimeError):
    pass


@dataclass
class LLMResult:
    text: str
    backend: str
    model: str
    input_tokens: int
    output_tokens: int


@lru_cache(maxsize=1)
def _gemini_client():
    if not config.GEMINI_API_KEY:
        raise LLMError("GEMINI_API_KEY is not set")

    from google import genai
    from google.genai import types

    return genai.Client(
        api_key=config.GEMINI_API_KEY,
        http_options=types.HttpOptions(timeout=config.LLM_TIMEOUT_SECONDS * 1000),
    )


def gemini_generate(prompt: str) -> LLMResult:
    try:
        response = _gemini_client().models.generate_content(
            model=config.GEMINI_MODEL,
            contents=prompt,
        )
    except LLMError:
        raise
    except Exception as e:
        raise LLMError(f"Gemini request failed: {e}") from e

    text = (response.text or "").strip()
    if not text:
        raise LLMError("Gemini returned an empty response")

    usage = response.usage_metadata
    return LLMResult(
        text=text,
        backend=REMOTE,
        model=config.GEMINI_MODEL,
        input_tokens=(usage and usage.prompt_token_count) or count_tokens(prompt),
        output_tokens=(usage and usage.candidates_token_count) or count_tokens(text),
    )


def ollama_generate(prompt: str) -> LLMResult:
    try:
        response = requests.post(
            config.OLLAMA_URL,
            json={"model": config.OLLAMA_MODEL, "prompt": prompt, "stream": False},
            timeout=config.LLM_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        raise LLMError(f"Ollama request failed: {e}") from e

    text = (data.get("response") or "").strip()
    if not text:
        raise LLMError("Ollama returned an empty response")

    return LLMResult(
        text=text,
        backend=LOCAL,
        model=config.OLLAMA_MODEL,
        input_tokens=data.get("prompt_eval_count") or count_tokens(prompt),
        output_tokens=data.get("eval_count") or count_tokens(text),
    )


def generate(prompt: str, backend: str) -> LLMResult:
    """Run on the requested backend. A failed local call falls back to Gemini;
    the returned result always says which backend actually answered."""
    if backend == REMOTE:
        return gemini_generate(prompt)

    try:
        return ollama_generate(prompt)
    except LLMError as e:
        if config.MODEL_PROVIDER == "ollama":
            raise
        log.warning("Local model unavailable, falling back to Gemini: %s", e)
        return gemini_generate(prompt)
