import json
from app.engine.llm_provider import generate



def plan_actions(
    prompt: str,
):

    planner_prompt = f"""
You are the planning agent for TokenWise.

Your task is to determine which prompt-processing tools should be executed.

Available tools:

1. enhance
- Fix grammar
- Improve spelling
- Improve clarity

2. compress
- Remove unnecessary words
- Reduce token count

3. smart_optimize
- Rewrite the prompt for maximum LLM performance

Analyze the prompt carefully.

Return ONLY valid JSON.

Example:

{{
    "enhance": true,
    "compress": false,
    "smart_optimize": true,
    "reason": "Prompt has grammar issues and can be optimized."
}}

Prompt:

{prompt}
"""

    response = generate(
        planner_prompt
    )

    try:

        start = response.find("{")

        end = (
            response.rfind("}") + 1
        )

        json_text = response[
            start:end
        ]

        return json.loads(
            json_text
        )

    except Exception:

        return {

            "enhance": False,

            "compress": False,

            "smart_optimize": False,

            "reason":
                "Planner failed to generate valid JSON.",
        }