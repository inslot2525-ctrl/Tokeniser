from app.engine.complexity_analyser import (
    analyze_prompt,
)

from app.engine.local_llm import (
    local_generate,
)

from app.engine.fireworks_llm import (
    remote_generate,
)


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


def estimate_confidence(
    difficulty: str,
    reasoning: str,
):

    if (
        difficulty == "Easy"
        and reasoning == "Low"
    ):
        return 98

    if difficulty == "Medium":
        return 90

    return 72


def estimate_remote_cost(
    input_tokens: int,
    output_tokens: int,
):

    total_tokens = (
        input_tokens
        + output_tokens
    )

    return round(
        total_tokens * 0.000002,
        6,
    )


def decide_route(
    analysis,
):

    difficulty = analysis["difficulty"]

    reasoning = analysis["reasoning"]

    confidence = estimate_confidence(
        difficulty,
        reasoning,
    )

    if difficulty == "Easy":

        return {
            "route": "Local",
            "model": LOCAL_MODELS["default"]["name"],
            "confidence": confidence,
        }

    if (
        difficulty == "Medium"
        and confidence >= 85
    ):

        return {
            "route": "Local",
            "model": LOCAL_MODELS["default"]["name"],
            "confidence": confidence,
        }

    return {
        "route": "Gemini",
        "model": REMOTE_MODELS["default"]["name"],
        "confidence": confidence,
    }


def route_prompt(
    prompt: str,
):

    # ------------------------
    # Analyze Prompt
    # ------------------------

    analysis = analyze_prompt(
        prompt
    )

    # ------------------------
    # Decide Route
    # ------------------------

    routing = decide_route(
        analysis
    )

    estimated_cost = estimate_remote_cost(
        analysis["estimated_input_tokens"],
        analysis["estimated_output_tokens"],
    )

    print("\n==============================")
    print("Generating Initial Response...")
    print("==============================")

    # ------------------------
    # Generate Response
    # ------------------------

    if routing["route"] == "Local":

        print("Using Local Gemma")

        response = local_generate(
            prompt
        )

    else:

        print("Using Gemini")

        response = remote_generate(
            prompt
        )

    # ------------------------
    # Return
    # ------------------------

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