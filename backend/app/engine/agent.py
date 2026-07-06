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


def run_agent(prompt: str):

    original_prompt = prompt

    current_prompt = prompt

    steps = []

    print("\n========== TOKENWISE AGENT ==========")

    print("Original Prompt:")
    print(current_prompt)
    print(type(current_prompt))

    # ----------------------------
    # Planner
    # ----------------------------

    plan = plan_actions(
        current_prompt
    )

    print("\nPlanner Output:")

    print(plan)

    print(type(plan))

    # ----------------------------
    # Enhance
    # ----------------------------

    if plan.get(
        "enhance",
        False,
    ):

        current_prompt = enhance_prompt(
            current_prompt
        )

        print("\nAfter Enhance:")

        print(type(current_prompt))

        print(current_prompt)

        steps.append(
            "Grammar & clarity enhanced"
        )

    # ----------------------------
    # Compress
    # ----------------------------

    if plan.get(
        "compress",
        False,
    ):

        current_prompt = compress_prompt(
            current_prompt
        )

        print("\nAfter Compress:")

        print(type(current_prompt))

        print(current_prompt)

        steps.append(
            "Prompt compressed"
        )

    # ----------------------------
    # Smart Optimize
    # ----------------------------

    if plan.get(
        "smart_optimize",
        False,
    ):

        current_prompt = smart_optimize_prompt(
            current_prompt
        )

        print(
            "\nAfter Smart Optimize:"
        )

        print(type(current_prompt))

        print(current_prompt)

        steps.append(
            "Prompt optimized"
        )

    # ----------------------------
    # Route
    # ----------------------------

    print("\nBefore Routing:")

    print(type(current_prompt))

    print(current_prompt)

    routing = route_prompt(
        current_prompt
    )

    print("\nRouting Output:")

    print(routing)

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

        "response":
            routing.get(
                "response",
                current_prompt,
            ),
    }