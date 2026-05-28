from pydantic import BaseModel


class PromptRequest(BaseModel):
    prompt: str


class TokenResponse(BaseModel):
    tokens: int
    
class OptimizationResponse(BaseModel):
    original: str
    optimized: str

    original_tokens: int
    optimized_tokens: int

    saved_tokens: int
    savings_percent: float