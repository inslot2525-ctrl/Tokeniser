import json

from app.core.gemini_client import client


def verify_response(
    prompt: str,
    response: str,
):
    """
    Evaluates the quality of an LLM response.

    Returns:
        score
        passed
        reasoning
    """

    verification_prompt = f"""
You are an expert AI evaluator.

Evaluate the AI response.

User Prompt:
{prompt}

AI Response:
{response}

Score the response from 0-10.

Evaluate:

1. Correctness
2. Completeness
3. Clarity
4. Relevance
5. Grammar

Return ONLY valid JSON.

Example:

{{
    "score": 9.4,
    "passed": true,
    "reason": "Accurate and complete."
}}
"""

    result = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=verification_prompt,
    )

    text = result.text.strip()

    try:
        return json.loads(text)

    except Exception:

        return {
            "score": 5,
            "passed": False,
            "reason": "Verifier could not parse evaluation."
        }