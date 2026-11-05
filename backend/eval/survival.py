"""Did a prompt's requirements survive compression?

Scored from a benchmark's own labels, never from contract.py, so the thing being
tested is not marking its own homework. IFEval and IFBench label every prompt
with the instructions it contains and their parameters (N, keywords, phrases to
reproduce). An instruction is *checkable* if its parameters are visible in the
original prompt; it *survives* if they are still visible after compression.

This is a necessary condition, not a sufficient one: a requirement that is gone
from the prompt cannot be followed, but one that is still there may have lost its
meaning ("6 or more" -> "6"). No model is called.
"""

import re

WORDS = {
    1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine",
    10: "ten", 11: "eleven", 12: "twelve", 13: "thirteen", 14: "fourteen", 15: "fifteen", 16: "sixteen",
    17: "seventeen", 18: "eighteen", 19: "nineteen", 20: "twenty", 30: "thirty", 40: "forty", 50: "fifty",
    60: "sixty", 70: "seventy", 80: "eighty", 90: "ninety", 100: "hundred",
}

# IFEval only: words that must still be present for an instruction to be askable.
# (IFBench's instructions carry their meaning in their parameters.)
CUES = {
    "punctuation:no_comma": r"comma",
    "change_case:english_lowercase": r"lower ?case",
    "change_case:english_capital": r"capital|upper ?case",
    "change_case:capital_word_frequency": r"capital",
    "detectable_format:title": r"title|<<",
    "detectable_format:json_format": r"json",
    "detectable_format:number_highlighted_sections": r"highlight",
    "detectable_format:number_bullet_lists": r"bullet",
    "detectable_format:multiple_sections": r"section",
    "detectable_format:constrained_response": r"my answer is|answer with one of",
    "detectable_content:postscript": r"p\.? ?s|postscript",
    "detectable_content:number_placeholders": r"placeholder|square bracket|\[",
    "length_constraints:number_sentences": r"sentence",
    "length_constraints:number_words": r"word",
    "length_constraints:number_paragraphs": r"paragraph",
    "length_constraints:nth_paragraph_first_word": r"paragraph",
    "combination:two_responses": r"\*{6}|two (different |separate )?(responses|answers)",
    "startend:quotation": r"quot|double",
    "keywords:letter_frequency": r"letter",
}

# Parameters that are not text the prompt states.
SKIP_KEYS = {"relation", "capital_relation", "let_relation", "language", "letter", "reference_text"}

NEGATION = re.compile(r"\b(?:not|no|never|without|avoid|cannot|nor|neither|none)\b|n['’]t\b", re.I)


def norm(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower().replace("’", "'")).strip()


def has_number(text: str, n: int) -> bool:
    t = norm(text).replace(",", "")
    if re.search(rf"(?<![\d.]){n}(?!\d)", t):
        return True
    return n in WORDS and re.search(rf"\b{WORDS[n]}\b", t) is not None


def parameters(kwargs: dict) -> list[tuple[str, object]]:
    """The checkable parameters of one instruction, as ("num", int) / ("text", str)."""
    out = []
    for key, value in (kwargs or {}).items():
        if value is None or isinstance(value, bool) or key in SKIP_KEYS:
            continue
        if isinstance(value, (int, float)):
            if float(value).is_integer():
                out.append(("num", int(value)))
        elif isinstance(value, str) and len(value) > 1:
            out.append(("text", value))
        elif isinstance(value, list):
            out += [("text", v) for v in value if isinstance(v, str) and len(v) > 1]
    return out


def requirements(instruction_id: str, kwargs: dict) -> list[tuple[str, object]]:
    reqs = [("cue", CUES[instruction_id])] if instruction_id in CUES else []
    return reqs + parameters(kwargs)


def present(text: str, kind: str, value) -> bool:
    if kind == "cue":
        return re.search(value, norm(text)) is not None
    if kind == "num":
        return has_number(text, value)
    return norm(value) in norm(text)


def check(original: str, compressed: str, row: dict) -> list[tuple[str, bool]]:
    """(instruction id, survived) for each instruction checkable in the original."""
    results = []
    for instruction_id, kwargs in zip(row["instruction_id_list"], row["kwargs"]):
        reqs = requirements(instruction_id, kwargs)
        if reqs and all(present(original, k, v) for k, v in reqs):
            results.append((instruction_id, all(present(compressed, k, v) for k, v in reqs)))
    return results


def lost_negation(original: str, compressed: str) -> bool:
    """A negation word the prompt had, and the compressed prompt no longer has."""
    count = lambda text: len(NEGATION.findall(text))
    return count(compressed) < count(original)
