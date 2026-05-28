from fastapi import APIRouter

from app.models.schemas import (
    PromptRequest,
    TokenResponse
)

from app.engine.tokenizer import (
    count_tokens
)

from app.engine.optimizer import (
    optimize_prompt
)

from app.models.schemas import (
    OptimizationResponse
)
router = APIRouter()


@router.get("/")
def home():
    return {
        "message": "Tokeniser API running"
    }


@router.post("/tokenize",
             response_model=TokenResponse)
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
def optimize(payload: PromptRequest):
    return optimize_prompt(
        payload.prompt
    )