"""First-line filter for obvious jailbreak, injection and exfiltration attempts.

This is pattern matching, not a classifier: it catches common phrasings and
simple obfuscation (case, spacing, punctuation, leetspeak), and a determined
attacker can still get past it. It exists to stop cheap attacks before any
model is called.
"""

import re
import unicodedata

LEET = str.maketrans({"0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s"})

PATTERNS = {
    "Jailbreak": [
        r"\b(ignore|disregard|forget) (all |any |the )*(previous|prior|above|earlier|your) (instructions|rules|prompts?|guidelines)",
        r"\b(bypass|disable|disregard|turn off) (the |your |all )*(safety|guardrails|filters?|restrictions)",
        r"\bdeveloper mode\b",
        r"\b(act|pretend|roleplay) as dan\b|\bdo anything now\b",
        r"\bjailbr[eo]a?k",
        r"\bpretend (you are|to be) (an )?(unrestricted|unfiltered|uncensored)",
    ],
    "Prompt Injection": [
        r"\b(reveal|show|print|repeat|leak) (me )?(the |your )*(system|hidden|initial) (prompt|instructions)",
        r"\boverride (the |your )*(system )?(prompt|instructions)",
        r"\bnew instructions\b",
        r"\bsystem override\b",
        r"\byou are no longer\b",
    ],
    "Data Exfiltration": [
        r"\b(leak|print|show|reveal|dump|list) (me )?(the |all |your )*(api keys?|credentials|passwords?|secrets|tokens|env(ironment)? variables)",
        r"\b(show|dump) (the )?database\b",
    ],
}

COMPILED = [(attack, re.compile(p)) for attack, patterns in PATTERNS.items() for p in patterns]
PATTERN_COUNT = len(COMPILED)


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFKC", text).lower().translate(LEET)
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def detect_prompt_risk(prompt: str) -> dict:
    text = normalize(prompt)
    matches = [(attack, m.group(0)) for attack, rx in COMPILED if (m := rx.search(text))]

    if not matches:
        return {"risk": "LOW", "attack_type": "None", "confidence": 5, "matched_patterns": []}

    confidence = min(60 + (len(matches) - 1) * 20, 99)
    return {
        "risk": "HIGH" if len(matches) > 1 or matches[0][0] == "Data Exfiltration" else "MEDIUM",
        "attack_type": matches[0][0],
        "confidence": confidence,
        "matched_patterns": [text for _, text in matches],
    }
