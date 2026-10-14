from fastapi import APIRouter, Depends

from app.analytics.metrics import get_dashboard
from app.api.security import rate_limit, require_api_key
from app.engine.agent import run_agent
from app.engine.jailbreak_detector import detect_prompt_risk
from app.engine.optimizer import rewrite_with_metrics
from app.engine.router import route_prompt
from app.engine.tokenizer import count_tokens
from app.models.schemas import OptimizationResponse, PromptRequest, TokenResponse

router = APIRouter()

# Endpoints that call an LLM are rate limited; the cheap local ones are not.
llm_guard = [Depends(require_api_key), Depends(rate_limit)]


@router.get("/")
def home():
    return {"message": "Tokeniser API running"}


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/tokenize", response_model=TokenResponse)
def tokenize(payload: PromptRequest):
    return {"tokens": count_tokens(payload.prompt)}


@router.post("/detect-risk")
def detect_risk(payload: PromptRequest):
    return detect_prompt_risk(payload.prompt)


@router.post("/optimize", response_model=OptimizationResponse, dependencies=llm_guard)
def optimize(payload: PromptRequest):
    return rewrite_with_metrics(payload.prompt, "compress")


@router.post("/smart-optimize", response_model=OptimizationResponse, dependencies=llm_guard)
def smart_optimize(payload: PromptRequest):
    return rewrite_with_metrics(payload.prompt, "optimize")


@router.post("/compress", dependencies=llm_guard)
def compress(payload: PromptRequest):
    result = rewrite_with_metrics(payload.prompt, "compress")
    return {"compressed": result["optimized"], **result}


@router.post("/enhance", dependencies=llm_guard)
def enhance(payload: PromptRequest):
    result = rewrite_with_metrics(payload.prompt, "enhance")
    return {"enhanced": result["optimized"], **result}


@router.post("/route", dependencies=llm_guard)
def route(payload: PromptRequest):
    return route_prompt(payload.prompt)


@router.post("/agent", dependencies=llm_guard)
def agent(payload: PromptRequest):
    return run_agent(payload.prompt)


@router.get("/dashboard")
def dashboard():
    return get_dashboard()
