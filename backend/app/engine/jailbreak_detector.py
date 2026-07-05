import re


JAILBREAK_PATTERNS = [
    "ignore previous instructions",
    "ignore all previous instructions",
    "disregard safety",
    "bypass safety",
    "developer mode",
    "act as dan",
    "jailbreak",
    "reveal system prompt",
    "show hidden prompt",
    "leak api key",
    "override system prompt",
    "do anything now",
    "disable guardrails",
]


PROMPT_INJECTION_PATTERNS = [
    "forget your instructions",
    "new instructions:",
    "system override",
    "you are no longer",
    "pretend you are unrestricted",
]


DATA_EXFILTRATION_PATTERNS = [
    "show database",
    "dump credentials",
    "show passwords",
    "reveal secrets",
    "print api keys",
]


def detect_prompt_risk(prompt: str):
    text = prompt.lower()

    matches = []

    for pattern in JAILBREAK_PATTERNS:
        if pattern in text:
            matches.append(
                ("Jailbreak", pattern)
            )

    for pattern in PROMPT_INJECTION_PATTERNS:
        if pattern in text:
            matches.append(
                (
                    "Prompt Injection",
                    pattern
                )
            )

    for pattern in DATA_EXFILTRATION_PATTERNS:
        if pattern in text:
            matches.append(
                (
                    "Data Exfiltration",
                    pattern
                )
            )

    if not matches:
        return {
            "risk": "LOW",
            "attack_type": "None",
            "confidence": 5,
            "matched_patterns": [],
        }

    confidence = min(
        50 + len(matches) * 15,
        99
    )

    return {
        "risk": (
            "HIGH"
            if confidence > 80
            else "MEDIUM"
        ),
        "attack_type": matches[0][0],
        "confidence": confidence,
        "matched_patterns": [
            match[1]
            for match in matches
        ],
    }