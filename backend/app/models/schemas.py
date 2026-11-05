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


class ContractReport(BaseModel):
    terms: int  # distinct requirements found in the prompt
    kept: int  # how many of them the optimized prompt still states
    lost: list[dict] = []  # [{"kind": "negation", "text": "not"}]
    reverted: list[dict] = []  # what a discarded compression had dropped; empty if none was discarded
    verbatim: bool = False  # the prompt asks to be reproduced as-is, so it was not compressed


class CompressResponse(BaseModel):
    original: str
    optimized: str
    original_tokens: int
    optimized_tokens: int
    saved_tokens: int
    savings_percent: float
    method: str  # "Rules", "Rules + LLMLingua-2", or "None" (sent as written)
    removed_phrases: list[dict] = []
    contract: ContractReport | None = None  # None when CONTRACT_GUARD is off
