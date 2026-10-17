"""Rule-based prompt compression.

Deletes only phrases from a fixed list of conversational filler (greetings,
pleasantries, "could you please", sign-offs). It cannot drop a requirement,
negation or number, because it only removes what is listed here. It runs in
microseconds with no dependencies, so it works on any host.

Each pattern has a label so the API can say exactly what was removed.
"""

import re
from dataclasses import dataclass, field

# (label, pattern). Order matters: longer wrappers before the shorter ones
# they contain. All patterns are case-insensitive.
FILLER: list[tuple[str, str]] = [
    # Openers
    ("greeting", r"^\s*(hi|hello|hey|greetings|good (morning|afternoon|evening))( there| all| team)?[\s,!.]+"),
    ("pleasantry", r"\bi hope (you('re| are)|this finds you) (doing |having )?(well|good|great|fine|a (great|good|nice) day)[\s,!.]*"),
    ("pleasantry", r"\bhope you('re| are) (doing )?(well|good|great)[\s,!.]*"),
    ("need help", r"\bi (really )?need (some|your) help( please)?( with (something|this))?[\s,!.:]*"),
    ("asking", r"\bi was (just )?wondering if you could (possibly |maybe )?(help me( out)?( with something)?[.!]?\s*(could you )?(please )?)?"),
    ("asking", r"\bi was hoping (that )?you could (possibly )?(give me|help me( with)?)?\s*"),
    ("asking", r"\bso,? basically,? what i want to know is,?( and i have been thinking about this for a while( now)?,?)?\s*"),
    ("asking", r"\bi have a (quick |small )?question( for you)?[\s,:.!]*"),
    ("asking", r"\b(i would|i'd) (really )?(like|love) (it if )?you to\s+"),
    ("asking", r"\bi want you to\s+"),
    ("asking", r"\b(could|can|would|will) you (please |kindly )?(possibly |maybe )?(help me )?(?=\w)"),
    ("asking", r"(?:^\s*|(?<=[.?!]\s))if you could (please )?(?=\w)"),
    ("opener", r"(?:^\s*|(?<=[.?!]\s))(okay|ok|so|well|alright),?\s+(so,?\s+)?(?=\w)"),
    ("politeness", r"\bif (it is|it's) not too much trouble,?\s*"),
    ("politeness", r"\b(please|kindly),?\s+(?=\w)"),
    ("politeness", r",?\s+please(?=[.?!])"),
    # Closers
    ("thanks", r"\b(thank you|thanks)( so much| very much| a lot| a ton)?( in advance)?( for your help)?[,.!]*(\s*i (really |truly )?appreciate (it|your help)[.!]*)?\s*$"),
    ("thanks", r"\bi (really |truly )?appreciate (it|your help)[.!]*\s*$"),
    ("sign-off", r"\b(cheers|best regards|kind regards|regards|best)[,.!]*\s*$"),
    ("thanks", r"\bthat would be (super |really |very )?(helpful|great|amazing|awesome)[,.!]*(\s*(thank you|thanks)[^.!?]*[.!]*)?\s*$"),
    # Hedges that carry no meaning
    ("hedge", r"\b(basically|honestly|actually|kind of|sort of),?\s+"),
]

COMPILED = [(label, re.compile(p, re.I | re.M)) for label, p in FILLER]

# Code is never touched.
PROTECTED = re.compile(r"```.*?```|`[^`\n]+`", re.S)


@dataclass
class RuleResult:
    text: str
    removed: list[dict] = field(default_factory=list)  # [{"label": ..., "text": ...}]


def _tidy(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" +([,.?!:;])", r"\1", text)
    text = re.sub(r"([,;:])\s*([.?!])", r"\2", text)  # ", ?" -> "?"
    text = re.sub(r"^[\s,.;:!]+", "", text, flags=re.M)  # leading debris per line
    text = re.sub(r"([.?!])\s*[,;]\s*", r"\1 ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Capitalise the start of each sentence that removal exposed.
    text = re.sub(r"(^|[.?!]\s+)([a-z])", lambda m: m.group(1) + m.group(2).upper(), text)
    return text.strip()


# Marks where a "could you ..." wrapper was removed, so the sentence it turned
# into an instruction can end with "." instead of "?".
_ASKED = "\x00"


def _compress_prose(text: str, removed: list[dict]) -> str:
    # Run to a fixed point: removing a greeting can expose another opener.
    for _ in range(3):
        before = text
        for label, rx in COMPILED:
            def record(m, label=label):
                if m.group(0).strip():
                    removed.append({"label": label, "text": m.group(0).strip()})
                space = " " if m.group(0)[:1].isspace() or m.group(0)[-1:].isspace() else ""
                return space + _ASKED if label == "asking" else space
            text = rx.sub(record, text)
        if text == before:
            break
    text = re.sub(_ASKED + r"([^.?!]*)\?", r"\1.", text)
    return _tidy(text.replace(_ASKED, ""))


def compress(text: str) -> RuleResult:
    removed: list[dict] = []
    out, pos = [], 0
    for m in PROTECTED.finditer(text):
        out.append(_compress_prose(text[pos:m.start()], removed))
        out.append(m.group(0))
        pos = m.end()
    out.append(_compress_prose(text[pos:], removed))

    result = " ".join(part for part in out if part.strip())
    # Never return something empty or longer than the input.
    if not result.strip() or len(result) >= len(text):
        return RuleResult(text, [])
    return RuleResult(result, removed)
