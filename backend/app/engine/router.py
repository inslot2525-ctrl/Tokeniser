from app import config
from app.engine import llm
from app.engine.complexity import analyze_prompt


def choose_backend(analysis: dict) -> str:
    """MODEL_PROVIDER pins the backend; in auto mode the classifier decides."""
    if config.MODEL_PROVIDER == "gemini":
        return llm.REMOTE
    if config.MODEL_PROVIDER == "ollama":
        return llm.LOCAL
    return llm.REMOTE if analysis["recommended_route"] == "Gemini" else llm.LOCAL


def call_cost(result: llm.LLMResult) -> float:
    if result.backend != llm.REMOTE:
        return 0.0
    return (
        result.input_tokens * config.REMOTE_INPUT_PRICE_PER_M
        + result.output_tokens * config.REMOTE_OUTPUT_PRICE_PER_M
    ) / 1_000_000


def format_cost(cost: float) -> str:
    return f"${cost:.6f}"


def route_prompt(prompt: str) -> dict:
    analysis = analyze_prompt(prompt)
    requested = choose_backend(analysis)
    result = llm.generate(prompt, requested)

    return {
        "category": analysis["category"],
        "difficulty": analysis["difficulty"],
        "reasoning": analysis["reasoning"],
        "signals": analysis["signals"],
        "requested_route": requested,
        # The backend that actually answered. It differs from requested_route
        # when the local model was unavailable and Gemini took over.
        "route": result.backend,
        "recommended_model": result.model,
        "estimated_input_tokens": analysis["estimated_input_tokens"],
        "estimated_output_tokens": analysis["estimated_output_tokens"],
        "estimated_remote_cost": format_cost(call_cost(result)),
        "response": result.text,
    }
