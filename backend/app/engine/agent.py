from app.engine.enhancer import (
    enhance_prompt,
)

from app.engine.compressor import (
    compress_prompt,
)

from app.engine.smart_optimizer import (
    smart_optimize_prompt,
)

from app.engine.router import (
    route_prompt,
)

from app.engine.planner import (
    plan_actions,
)

from app.engine.verifier import (
    verify_response,
)

from app.engine.fireworks_llm import (
    remote_generate,
)


def run_agent(prompt: str):

    original_prompt = prompt

    current_prompt = prompt

    steps = []

    print("\n========== TOKENWISE AGENT ==========\n")

    print("Original Prompt:")
    print(current_prompt)

    # -----------------------------------
    # Planner
    # -----------------------------------

    plan = plan_actions(current_prompt)

    print("\nPlanner Output:")
    print(plan)

    # -----------------------------------
    # Enhance
    # -----------------------------------

    if plan.get("enhance", False):

        current_prompt = enhance_prompt(
            current_prompt
        )

        print("\nAfter Enhance:")
        print(current_prompt)

        steps.append(
            "Grammar & clarity enhanced"
        )

    # -----------------------------------
    # Compress
    # -----------------------------------

    if plan.get("compress", False):

        current_prompt = compress_prompt(
            current_prompt
        )

        print("\nAfter Compress:")
        print(current_prompt)

        steps.append(
            "Prompt compressed"
        )

    # -----------------------------------
    # Smart Optimize
    # -----------------------------------

    if plan.get(
        "smart_optimize",
        False,
    ):

        current_prompt = smart_optimize_prompt(
            current_prompt
        )

        print("\nAfter Smart Optimize:")
        print(current_prompt)

        steps.append(
            "Prompt optimized"
        )

    # -----------------------------------
    # Routing
    # -----------------------------------

    print("\nRouting Prompt...")

    routing = route_prompt(
        current_prompt
    )

    response = routing["response"]

    print("\nModel Used:")
    print(routing["recommended_model"])

    print("\nGenerated Response:")
    print(response)

    # -----------------------------------
    # Verification
    # -----------------------------------

    verification = verify_response(
        current_prompt,
        response,
    )

    print("\nVerification:")
    print(verification)

    # -----------------------------------
    # Automatic Retry
    # -----------------------------------

    if verification["score"] < 8:

        print("\nVerifier rejected response.")

        print("Retrying using Gemini...")

        response = remote_generate(
            current_prompt
        )

        verification = verify_response(
            current_prompt,
            response,
        )

        routing["route"] = "Gemini Retry"

        routing[
            "recommended_model"
        ] = "Gemini"

        routing[
            "confidence"
        ] = verification[
            "score"
        ]

        steps.append(
            "Automatic retry triggered"
        )

        print("\nRetry Verification:")
        print(verification)

    else:

        print("\nVerifier accepted response.")

    # -----------------------------------
    # Final Output
    # -----------------------------------

    return {

        "original_prompt":
            original_prompt,

        "processed_prompt":
            current_prompt,

        "planner_reason":
            plan.get(
                "reason",
                "",
            ),

        "steps":
            steps,

        "route":
            routing["route"],

        "model":
            routing[
                "recommended_model"
            ],

        "confidence":
            routing[
                "confidence"
            ],

        "estimated_remote_cost":
            routing[
                "estimated_remote_cost"
            ],

        "verification":
            verification,

        "response":
            response,
    }