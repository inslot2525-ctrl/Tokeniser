from contextlib import contextmanager

from fastapi import APIRouter, Depends, Header, HTTPException

from app import config
from app.analytics.metrics import get_dashboard
from app.api.security import rate_limit, require_api_key
from app.engine import llm
from app.engine.agent import run_agent
from app.engine.jailbreak_detector import detect_prompt_risk
from app.engine.optimizer import compress_with_metrics, enhance
from app.engine.tokenizer import count_tokens
from app.models.schemas import CompressResponse, PromptRequest, TokenResponse

router = APIRouter()

guard = [Depends(require_api_key), Depends(rate_limit)]


def gemini_key(x_gemini_key: str | None = Header(default=None, max_length=200)) -> str | None:
    """The caller's own Gemini key. It is used for this request only and is
    never logged or stored."""
    return x_gemini_key.strip() if x_gemini_key else None


@contextmanager
def model_session(payload: PromptRequest, user_key: str | None):
    """Free mode: never call Gemini. AI mode: call it with the user's key."""
    if payload.mode == "free":
        with llm.session(api_key=None, allow_remote=False):
            yield
    else:
        # GEMINI_API_KEY on the server is a fallback for self-hosting; leave it
        # unset on a public deploy so users can't spend it.
        key = user_key or config.GEMINI_API_KEY
        if not key:
            raise HTTPException(
                status_code=400,
                detail="AI mode needs a Gemini API key. Add yours in Settings, or use free mode.",
            )
        with llm.session(api_key=key, allow_remote=True):
            yield


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/agent", dependencies=guard)
def agent(payload: PromptRequest, key: str | None = Depends(gemini_key)):
    """The full pipeline: risk check, compress, route, answer, check."""
    with model_session(payload, key):
        return run_agent(payload.prompt)


@router.post("/compress", response_model=CompressResponse, dependencies=guard)
def compress(payload: PromptRequest):
    """Local compression only. Never calls a model, so mode doesn't matter."""
    return compress_with_metrics(payload.prompt)


@router.post("/enhance", dependencies=guard)
def enhance_prompt(payload: PromptRequest, key: str | None = Depends(gemini_key)):
    """Grammar and clarity fixes. Needs a model (Ollama, or AI mode)."""
    with model_session(payload, key):
        return enhance(payload.prompt)


@router.post("/tokenize", response_model=TokenResponse)
def tokenize(payload: PromptRequest):
    return {"tokens": count_tokens(payload.prompt)}


@router.post("/detect-risk")
def detect_risk(payload: PromptRequest):
    return detect_prompt_risk(payload.prompt)


@router.get("/dashboard")
def dashboard():
    return get_dashboard()
