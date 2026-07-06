import json

from app.core.gemini_client import client
from app.engine.tokenizer import count_tokens


def analyze_prompt(prompt: str):
    """
    AI-based prompt analysis.

    Gemini decides:
    - category
    - difficulty
    - reasoning level
    - best execution route
    """

    analysis_prompt = f"""
You are an AI routing engine.

Analyze the user's prompt.

Prompt:

{prompt}

Return ONLY valid JSON.

Schema:

{{
  "category":"Coding | Writing | Math | Research | Chat | Reasoning | Data Science | General",
  "difficulty":"Easy | Medium | Hard",
  "reasoning":"Low | Medium | High",
  "recommended_route":"Local | Gemini"
}}

Rules:

Easy
- factual questions
- definitions
- short explanations

Medium
- coding
- debugging
- multiple-step reasoning

Hard
- research
- architecture
- deep reasoning
- long code generation
- multi-document reasoning

Return JSON only.
"""

    result = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=analysis_prompt,
    )

    text = (
        result.text
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )

    try:

        analysis = json.loads(text)

    except Exception:

        analysis = {
            "category": "General",
            "difficulty": "Medium",
            "reasoning": "Medium",
            "recommended_route": "Local",
        }

    input_tokens = count_tokens(prompt)

    if analysis["difficulty"] == "Easy":
        output_tokens = 150

    elif analysis["difficulty"] == "Medium":
        output_tokens = 500

    else:
        output_tokens = 1200

    analysis["estimated_input_tokens"] = input_tokens
    analysis["estimated_output_tokens"] = output_tokens

    return analysis