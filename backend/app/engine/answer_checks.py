"""Rule-based checks on an answer.

These catch answers that are visibly broken, not answers that are wrong:
empty or cut-off output, refusals, runaway repetition, missing code, and
broken explicit constraints in the prompt ("exactly four", "three
sentences", "don't mention Kubernetes"). They cost nothing, so they run on
every answer in both modes; in AI mode a failed check escalates a local
answer to Gemini without spending a judge call.
"""

import re

NUMBER_WORDS = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
}
_NUM = r"(\d+|" + "|".join(NUMBER_WORDS) + r")"

REFUSAL = re.compile(
    r"\b(i('m| am) (sorry|unable)|i can(no|')t (help|assist|provide|do that)|"
    r"as an ai( language model)?|i('m| am) not able to (help|assist))\b",
    re.I,
)
CODE_REQUEST = re.compile(
    r"\b(write|implement|create|give me|fix|refactor)\b[^.?!]{0,60}"
    r"\b(code|function|script|program|query|regex|regular expression|class|snippet)\b",
    re.I,
)
CODE_IN_ANSWER = re.compile(
    r"```|`[^`\n]+`|^( {4}|\t)\S|\b(def|function|class|SELECT|return)\b|[{};]\s*$", re.M
)

# "list exactly four advantages", "list 5 tips", "top 3 reasons". Deliberately
# not "give me two examples ...": prompts often ask for two groups of N.
LIST_COUNT = re.compile(
    rf"\b(?:exactly|list|name|top)\s+{_NUM}\s+(?!sentences?\b|words?\b|lines?\b|times?\b)[a-z]+",
    re.I,
)
SENTENCE_COUNT = re.compile(rf"\b(?:in|exactly|use|using)\s+{_NUM}\s+sentences?\b", re.I)
# "don't mention Kubernetes", "must not use the word 'fall'". Not "don't use
# recursion" or "without X": an answer may rightly name what it avoided.
FORBIDDEN = re.compile(
    r"\b(?:don'?t|do not|never|must not|should not|shouldn'?t)\s+"
    r"(?:mention|say|include|use the word|include the word|say the word)"
    r"\s+['\"]?([A-Za-z][\w+#.-]*)['\"]?",
    re.I,
)
LIST_ITEM = re.compile(r"^\s*(?:\d+[.)]|[-*•])\s+\S", re.M)


def _num(token: str) -> int:
    return int(token) if token.isdigit() else NUMBER_WORDS[token.lower()]


def _sentences(text: str) -> int:
    text = re.sub(r"```.*?```", " ", text, flags=re.S)
    text = re.sub(r"\b(e\.g|i\.e|etc|vs|Dr|Mr|Ms)\.", "", text)
    return len([s for s in re.split(r"(?<=[.!?])\s+", text.strip()) if re.search(r"\w", s)])


def check_answer(prompt: str, answer: str | None) -> dict:
    issues: list[str] = []
    text = (answer or "").strip()

    if len(text.split()) < 3:
        issues.append("Answer is empty or almost empty")
        return {"passed": False, "issues": issues}

    if REFUSAL.search(text[:300]):
        issues.append("Answer looks like a refusal")

    if text.count("```") % 2:
        issues.append("Answer looks cut off (unclosed code block)")

    lines = [l.strip().lower() for l in text.splitlines() if len(l.strip()) > 20]
    if lines and max(lines.count(l) for l in set(lines)) >= 3:
        issues.append("Answer repeats the same line 3+ times")

    if CODE_REQUEST.search(prompt) and not CODE_IN_ANSWER.search(text):
        issues.append("Prompt asks for code but the answer contains none")

    if m := LIST_COUNT.search(prompt):
        want, got = _num(m.group(1)), len(LIST_ITEM.findall(text))
        if got and got != want:
            issues.append(f"Asked for {want} items, answer lists {got}")

    if m := SENTENCE_COUNT.search(prompt):
        want, got = _num(m.group(1)), _sentences(text)
        if abs(got - want) > 1:  # sentence splitting is approximate
            issues.append(f"Asked for {want} sentences, answer has about {got}")

    for m in FORBIDDEN.finditer(prompt):
        word = m.group(1).rstrip(".")
        if re.search(rf"\b{re.escape(word)}\b", text, re.I):
            issues.append(f"Answer mentions '{word}', which the prompt ruled out")

    return {"passed": not issues, "issues": issues}
