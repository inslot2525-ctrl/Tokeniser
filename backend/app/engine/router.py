from app.engine.complexity_analyser import analyze_prompt
from app.engine.llm_provider import generate

LOCAL_MODELS = {
    "default": {
        "name": "Gemma 3 4B (Local)",
        "latency": "Low",
        "cost": 0,
    }
}

REMOTE_MODELS = {
    "default": {
        "name": "Gemini",
        "latency": "Medium",
        "cost": "Token Based",
    }
}


def estimate_remote_cost(
    input_tokens: int,
    output_tokens: int,
):
    total_tokens = input_tokens + output_tokens

    return round(
        total_tokens * 0.000002,
        6,
    )


def decide_route(analysis):

    if analysis["recommended_route"] == "Gemini":

        return {
            "route": "Gemini",
            "model": REMOTE_MODELS["default"]["name"],
            "confidence": 95,
        }

    return {
        "route": "Local",
        "model": LOCAL_MODELS["default"]["name"],
        "confidence": 95,
    }


def route_prompt(prompt: str):

    analysis = analyze_prompt(prompt)

    routing = decide_route(analysis)

    estimated_cost = estimate_remote_cost(
        analysis["estimated_input_tokens"],
        analysis["estimated_output_tokens"],
    )

    print("\n==============================")
    print("ROUTING REQUEST")
    print("==============================")
    print(f"Recommended Route : {routing['route']}")
    print(f"Selected Model    : {routing['model']}")

    # Universal LLM Provider
    response = generate(prompt)

    return {

        "category":
            analysis["category"],

        "difficulty":
            analysis["difficulty"],

        "reasoning":
            analysis["reasoning"],

        "recommended_model":
            routing["model"],

        "route":
            routing["route"],

        "confidence":
            routing["confidence"],

        "estimated_input_tokens":
            analysis["estimated_input_tokens"],

        "estimated_output_tokens":
            analysis["estimated_output_tokens"],

        "estimated_remote_cost":
            (
                "$0"
                if routing["route"] == "Local"
                else f"${estimated_cost}"
            ),

        "response":
            response,
    }