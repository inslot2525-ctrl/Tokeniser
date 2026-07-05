import re

from app.engine.tokenizer import count_tokens


CODE_KEYWORDS = [
    "python",
    "java",
    "c++",
    "c#",
    "javascript",
    "typescript",
    "sql",
    "code",
    "program",
    "algorithm",
    "debug",
    "bug",
    "function",
    "api",
    "fastapi",
    "react",
    "backend",
    "frontend",
    "class",
]

MATH_KEYWORDS = [
    "solve",
    "equation",
    "matrix",
    "integral",
    "derivative",
    "calculate",
    "probability",
    "statistics",
    "algebra",
    "linear regression",
    "gradient",
]

WRITING_KEYWORDS = [
    "essay",
    "story",
    "article",
    "blog",
    "email",
    "cover letter",
    "resume",
    "paragraph",
    "write",
]

REASONING_KEYWORDS = [
    "analyze",
    "compare",
    "design",
    "evaluate",
    "research",
    "architecture",
    "optimize",
    "plan",
    "explain in detail",
    "step by step",
]

SUMMARIZATION_KEYWORDS = [
    "summarize",
    "summary",
    "tl;dr",
]

TRANSLATION_KEYWORDS = [
    "translate",
    "translation",
]

QA_KEYWORDS = [
    "what",
    "why",
    "when",
    "where",
    "who",
    "how",
]


def contains_keyword(text, keywords):
    text = text.lower()

    return any(
        keyword in text
        for keyword in keywords
    )


def estimate_output_tokens(word_count):

    if word_count < 20:
        return 60

    elif word_count < 60:
        return 150

    elif word_count < 150:
        return 300

    elif word_count < 300:
        return 600

    return 1200


def detect_category(prompt):

    if contains_keyword(prompt, CODE_KEYWORDS):
        return "Coding"

    if contains_keyword(prompt, MATH_KEYWORDS):
        return "Mathematics"

    if contains_keyword(prompt, WRITING_KEYWORDS):
        return "Writing"

    if contains_keyword(
        prompt,
        SUMMARIZATION_KEYWORDS,
    ):
        return "Summarization"

    if contains_keyword(
        prompt,
        TRANSLATION_KEYWORDS,
    ):
        return "Translation"

    return "General QA"


def detect_reasoning(prompt):

    if contains_keyword(
        prompt,
        REASONING_KEYWORDS,
    ):
        return "High"

    return "Low"


def detect_difficulty(
    token_count,
    reasoning,
    category,
):

    score = 0

    if token_count > 300:
        score += 3

    elif token_count > 150:
        score += 2

    elif token_count > 60:
        score += 1

    if reasoning == "High":
        score += 2

    if category == "Coding":
        score += 2

    if category == "Mathematics":
        score += 2

    if category == "Writing":
        score += 1

    if score <= 2:
        return "Easy"

    elif score <= 4:
        return "Medium"

    return "Hard"


def recommend_model(
    difficulty,
    reasoning,
):

    if difficulty == "Easy":
        return "Local"

    if (
        difficulty == "Medium"
        and reasoning == "Low"
    ):
        return "Local"

    return "Fireworks"


def analyze_prompt(prompt: str):

    cleaned_prompt = re.sub(
        r"\s+",
        " ",
        prompt.strip(),
    )

    word_count = len(
        cleaned_prompt.split()
    )

    input_tokens = count_tokens(
        cleaned_prompt
    )

    output_tokens = estimate_output_tokens(
        word_count
    )

    category = detect_category(
        cleaned_prompt
    )

    reasoning = detect_reasoning(
        cleaned_prompt
    )

    difficulty = detect_difficulty(
        input_tokens,
        reasoning,
        category,
    )

    recommended_model = recommend_model(
        difficulty,
        reasoning,
    )

    return {
        "category": category,
        "difficulty": difficulty,
        "reasoning": reasoning,
        "word_count": word_count,
        "estimated_input_tokens": input_tokens,
        "estimated_output_tokens": output_tokens,
        "recommended_model": recommended_model,
    }