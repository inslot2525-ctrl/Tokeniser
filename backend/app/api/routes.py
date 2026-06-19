from fastapi import APIRouter, HTTPException

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