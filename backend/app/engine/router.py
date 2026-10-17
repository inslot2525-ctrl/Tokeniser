from app import config
from app.engine import llm


def choose_backend(analysis: dict) -> str:
    """MODEL_PROVIDER pins the backend; in auto mode the classifier decides.
    (In free mode llm.generate() runs a Gemini choice on the local model.)"""
    if config.MODEL_PROVIDER == "gemini":
        return llm.REMOTE
    if config.MODEL_PROVIDER == "ollama":
        return llm.LOCAL
    return llm.REMOTE if analysis["recommended_route"] == "Gemini" else llm.LOCAL


def call_cost(result: llm.LLMResult) -> float:
    """USD cost of one call; local calls are free."""
    if result.backend != llm.REMOTE:
        return 0.0
    return (
        result.input_tokens * config.REMOTE_INPUT_PRICE_PER_M
        + result.output_tokens * config.REMOTE_OUTPUT_PRICE_PER_M
    ) / 1_000_000


def format_cost(cost: float) -> str:
    return f"${cost:.6f}"
