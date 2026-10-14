"""Rule-based prompt classifier used by the router.

This used to be a Gemini call, which meant paying Gemini to decide whether to
use Gemini. A transparent heuristic costs nothing, runs in microseconds, and
reports the signals behind each decision.
"""

import re

from app.engine.tokenizer import count_tokens

CATEGORY_PATTERNS = {
    "Coding": (
        r"```|\b(code|function|class|bug|debug|error|exception|traceback|stack ?trace|"
        r"compile|refactor|implement|api|sql|python|javascript|typescript|java|regex)\b"
    ),
    "Math": r"\b(solve|equation|integral|derivative|prove|proof|theorem|probability|matrix)\b",
    "Research": r"\b(research|literature|sources|papers?|survey|cite|citations?)\b",
    "Writing": r"\b(write|essay|email|letter|story|poem|blog|article|rewrite|summari[sz]e)\b",
    "Data Science": (
        r"\b(dataset|dataframe|pandas|regression|classifier|model training|feature engineering)\b"
    ),
}

HARD_SIGNALS = (
    r"\b(architecture|design a system|system design|trade-?offs?|scalab\w+|"
    r"step[- ]by[- ]step|in depth|detailed analysis|compare and contrast|derive|"
    r"end[- ]to[- ]end)\b"
)

OUTPUT_TOKENS = {"Easy": 150, "Medium": 500, "Hard": 1200}


def analyze_prompt(prompt: str) -> dict:
    text = prompt.lower()
    tokens = count_tokens(prompt)
    signals = []

    category = "General"
    for name, pattern in CATEGORY_PATTERNS.items():
        if re.search(pattern, text):
            category = name
            break

    score = 0
    if tokens > 400:
        score += 2
        signals.append(f"long prompt ({tokens} tokens)")
    elif tokens > 120:
        score += 1
        signals.append(f"medium-length prompt ({tokens} tokens)")

    if re.search(HARD_SIGNALS, text):
        score += 2
        signals.append("asks for deep reasoning or design")

    if category in ("Coding", "Math", "Data Science"):
        score += 1
        signals.append(f"{category.lower()} task")

    asks = text.count("?") + len(re.findall(r"^\s*\d+[.)]", text, re.M))
    if asks >= 3:
        score += 1
        signals.append(f"{asks} separate asks")

    if not signals:
        signals.append("short, simple request")

    difficulty = "Easy" if score <= 1 else "Medium" if score == 2 else "Hard"
    reasoning = {"Easy": "Low", "Medium": "Medium", "Hard": "High"}[difficulty]

    return {
        "category": category,
        "difficulty": difficulty,
        "reasoning": reasoning,
        "recommended_route": "Gemini" if difficulty == "Hard" else "Local",
        "signals": signals,
        "estimated_input_tokens": tokens,
        "estimated_output_tokens": OUTPUT_TOKENS[difficulty],
    }
