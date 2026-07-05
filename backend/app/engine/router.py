from app.engine.complexity_analyser import (
    analyze_prompt,
)

from app.engine.local_llm import (
    local_generate,
)

from app.engine.fireworks_llm import (
    remote_generate,
)

from app.engine.confidence import (
    estimate_answer_confidence,
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
        "name": "Fireworks AI",
        "latency": "Medium",
        "cost": "Token Based",
    }
}


def estimate_confidence(
    difficulty: str,
    reasoning: str,
):
    """
    Initial confidence estimation based
    on prompt complexity.
    """

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
    """
    Approximate remote model cost.
    """

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

    difficulty = analysis[
        "difficulty"
    ]

    reasoning = analysis[
        "reasoning"
    ]

    confidence = estimate_confidence(
        difficulty,
        reasoning,
    )

    if difficulty == "Easy":

        route = "Local"

        model = LOCAL_MODELS[
            "default"
        ]["name"]

    elif (
        difficulty == "Medium"
        and confidence >= 85
    ):

        route = "Local"

        model = LOCAL_MODELS[
            "default"
        ]["name"]

    else:

        route = "Fireworks"

        model = REMOTE_MODELS[
            "default"
        ]["name"]

    return {

        "route": route,

        "model": model,

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
    # Decide Initial Route
    # ------------------------

    routing = decide_route(
        analysis
    )

    estimated_cost = estimate_remote_cost(
        analysis[
            "estimated_input_tokens"
        ],
        analysis[
            "estimated_output_tokens"
        ],
    )

    final_confidence = routing[
        "confidence"
    ]

    # ------------------------
    # Execute Model
    # ------------------------

    if routing["route"] == "Local":

        print("Using Local Gemma...")

        response = local_generate(
            prompt
        )

        final_confidence = (
            estimate_answer_confidence(
                prompt,
                response,
            )
        )

        print(
            "Local Confidence:",
            final_confidence,
        )

        # Confidence too low?
        if final_confidence < 85:

            print(
                "Escalating to Fireworks..."
            )

            response = remote_generate(
                prompt
            )

            routing[
                "route"
            ] = "Fireworks"

            routing[
                "model"
            ] = "Fireworks AI"

    else:

        print(
            "Using Fireworks..."
        )

        response = remote_generate(
            prompt
        )

    # ------------------------
    # Return Results
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
            final_confidence,

        "estimated_input_tokens":
            analysis[
                "estimated_input_tokens"
            ],

        "estimated_output_tokens":
            analysis[
                "estimated_output_tokens"
            ],

        "estimated_remote_cost":
            (
                "$0"
                if routing["route"]
                == "Local"
                else f"${estimated_cost}"
            ),

        "response":
            response,
    }