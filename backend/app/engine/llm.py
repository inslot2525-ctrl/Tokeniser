"""Thin clients for the two model backends.

Every call returns an LLMResult so callers can account for the tokens the
pipeline itself spends, not just the tokens in the user's prompt.

Which backends a request may use is set per request with `session()`:
free mode never calls Gemini, and AI mode uses the caller's own key.
"""

import logging
from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import dataclass
from functools import lru_cache

import requests
from google.genai import errors

from app import config
from app.engine.tokenizer import count_tokens

log = logging.getLogger(__name__)

LOCAL = "Local"
REMOTE = "Gemini"


class LLMError(RuntimeError):
    pass


class ModelUnavailable(LLMError):
    """No permitted backend can serve the call (free mode without Ollama,
    or AI mode without a key). Reported to the client as 503, not 502."""


class InvalidKey(LLMError):
    """Gemini rejected the caller's key. Reported to the client as 401."""


@dataclass
class LLMResult:
    text: str
    backend: str
    model: str
    input_tokens: int
    output_tokens: int


@dataclass(frozen=True)
class Session:
    api_key: str | None
    allow_remote: bool


_session: ContextVar[Session | None] = ContextVar("llm_session", default=None)


@contextmanager
def session(*, api_key: str | None, allow_remote: bool):
    """Scope a request's key and mode. Set it inside the endpoint body: FastAPI
    runs sync endpoints in a worker thread with a copy of the context."""
    token = _session.set(Session(api_key or None, allow_remote))
    try:
        yield
    finally:
        _session.reset(token)


def _current() -> Session:
    # Outside a request (scripts, eval): the server's own key, remote allowed.
    return _session.get() or Session(config.GEMINI_API_KEY or None, True)


def remote_available() -> bool:
    s = _current()
    return s.allow_remote and bool(s.api_key)


@lru_cache(maxsize=1)
def _server_client():
    return _make_client(config.GEMINI_API_KEY)


def _make_client(api_key: str):
    from google import genai
    from google.genai import types

    return genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(timeout=config.LLM_TIMEOUT_SECONDS * 1000),
    )


def _gemini_client():
    s = _current()
    if not s.allow_remote:
        raise ModelUnavailable("Gemini is not used in free mode")
    if not s.api_key:
        raise ModelUnavailable("AI mode needs a Gemini API key")
    # The server's key gets a cached client. User keys get a client per call so
    # they are never held in memory beyond the request.
    if s.api_key == config.GEMINI_API_KEY:
        return _server_client()
    return _make_client(s.api_key)


def gemini_generate(prompt: str) -> LLMResult:
    # Keep a reference for the whole call: google-genai closes a Client's HTTP
    # connection when it is garbage-collected, and a per-request client used
    # inline (`_gemini_client().models...`) is collected before the request runs.
    client = _gemini_client()
    try:
        response = client.models.generate_content(
            model=config.GEMINI_MODEL,
            contents=prompt,
        )
    except LLMError:
        raise
    except errors.ClientError as e:
        if e.code in (400, 401, 403) and "api key" in str(e).lower():
            raise InvalidKey("Gemini rejected the API key. Check it in Settings.") from e
        log.warning("Gemini request failed: %s %s", type(e).__name__, e.code)
        raise LLMError(f"Gemini request failed ({e.code})") from e
    except Exception as e:
        # Deliberately not echoing the exception: it can include request details.
        log.warning("Gemini request failed: %s", type(e).__name__)
        raise LLMError(f"Gemini request failed ({type(e).__name__})") from e

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
    """Run on the requested backend. A failed local call falls back to Gemini
    when the request allows it; the result says which backend answered."""
    if backend == REMOTE and remote_available():
        return gemini_generate(prompt)

    try:
        return ollama_generate(prompt)
    except LLMError as e:
        if config.MODEL_PROVIDER == "ollama" or not remote_available():
            raise ModelUnavailable(
                "No model available: start Ollama, or switch to AI mode with a Gemini key"
            ) from e
        log.warning("Local model unavailable, falling back to Gemini: %s", e)
        return gemini_generate(prompt)
