from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app import config


class PromptRequest(BaseModel):
    prompt: str = Field(min_length=1)
    # free: rules and local models only, never calls Gemini.
    # ai: may call Gemini with the key from the X-Gemini-Key header.
    mode: Literal["free", "ai"] = "free"

    @field_validator("prompt")
    @classmethod
    def check_prompt(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Prompt must not be blank")
        if len(value) > config.MAX_PROMPT_CHARS:
            raise ValueError(f"Prompt exceeds {config.MAX_PROMPT_CHARS} characters")
        return value


class TokenResponse(BaseModel):
    tokens: int


class OptimizationResponse(BaseModel):
    original: str
    optimized: str
    original_tokens: int
    optimized_tokens: int
    saved_tokens: int
    savings_percent: float
    overhead_tokens: int
    backend: str
    removed_phrases: list[dict] = []
