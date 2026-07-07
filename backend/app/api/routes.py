from fastapi import APIRouter, HTTPException

from app.engine.jailbreak_detector import (
    detect_prompt_risk,
)

from app.engine.smart_optimizer import (
    smart_optimize_prompt,
    smart_optimize_with_metrics,
)
from app.engine.smart_optimizer import (
    smart_optimize_prompt,
)

from app.models.schemas import (
    PromptRequest,
    TokenResponse,
    OptimizationResponse,
)

from app.engine.tokenizer import (
    count_tokens,
)

from app.engine.optimizer import (
    optimize_prompt,
)

from app.engine.enhancer import (
    enhance_prompt,
)

from app.engine.router import (
    route_prompt,
)

from app.engine.agent import (
    run_agent,
)

from app.engine.agent import (
    run_agent,
)

from app.engine.compressor import (
    compress_prompt,
)

from app.analytics.metrics import (
    get_dashboard,
)
router = APIRouter()


@router.get("/")
def home():
    return {
        "message": "Tokeniser API running"
    }


@router.post(
    "/tokenize",
    response_model=TokenResponse
)
def tokenize_prompt(
    payload: PromptRequest
):
    token_count = count_tokens(
        payload.prompt
    )

    return {
        "tokens": token_count
    }


@router.post(
    "/optimize",
    response_model=OptimizationResponse
)
def optimize(
    payload: PromptRequest
):
    return optimize_prompt(
        payload.prompt
    )


@router.post("/enhance")
def enhance(payload: PromptRequest):
    try:
        enhanced_text = enhance_prompt(
            payload.prompt
        )

        return {
            "enhanced": enhanced_text
        }

    except Exception as e:
        print("ENHANCE ERROR:", repr(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
        
@router.post("/compress")
def compress(payload: PromptRequest):
    return compress_prompt (
        payload.prompt
    )


@router.post("/smart-optimize")
def smart_optimize(
    payload: PromptRequest,
):
    return smart_optimize_with_metrics(
        payload.prompt
    )


@router.post("/detect-risk")
def detect_risk(
    payload: PromptRequest
):
    result = detect_prompt_risk(
        payload.prompt
    )

    return result

@router.post("/route")
def route(
    payload: PromptRequest,
):
    return route_prompt(
        payload.prompt
    )
    
@router.post("/agent")
def agent(payload: PromptRequest):

    return run_agent(
        payload.prompt
    )
    
@router.post("/agent")
def agent(
    payload: PromptRequest
):
    return run_agent(
        payload.prompt
    )
    
@router.get("/dashboard")
def dashboard():
    return get_dashboard()