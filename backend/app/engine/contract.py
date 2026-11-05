"""A prompt's contract: the requirements a compressed prompt must keep.

Compressors report how many tokens they removed, not whether the prompt still
asks for the same thing. This module lists what a prompt *promises* (numbers,
negations, "at least"-style relations, quoted payloads, format demands) and
checks that a compressed version still says all of it.

    contract = extract(prompt)
    contract.force_words()        # words a compressor must not drop
    contract.lost_in(compressed)  # requirements the compressed text no longer states

It is plain regex over the prompt, so it is free and runs in microseconds. It
checks that a requirement is still *visible*; it cannot tell whether the
surviving text still means the same thing.
"""

import re
from collections import Counter
from dataclasses import dataclass
from typing import NamedTuple

QUOTED, NEGATION, RELATION, NUMBER, FORMAT = "quoted", "negation", "relation", "number", "format"

# Losing one of these changes what is being asked, so compression is reverted.
# FORMAT terms ("comma", "bullets") are reported but never trigger a revert:
# the word often survives in a different form.
HARD = {QUOTED, NEGATION, RELATION, NUMBER}


class Term(NamedTuple):
    kind: str
    text: str  # normalised, so "Don't" and "don’t" are the same term


# Text the answer must reproduce, or that is its own delimiter: quoted strings,
# <<titles>>, `code`, fenced code, [placeholders], a ****** separator, and the
# unquoted payload after "end with:" / "this exact phrase:". Long quoted
# passages (over 300 characters) are input data, not payloads, and may be
# compressed. Compressors pass these spans through whole.
_TRIGGER = (
    r"(?:exact(?:ly)? (?:phrase|words|sentence|text)|(?:end|finish|conclude|close|start|begin)(?:ing)? with"
    r"|read exactly like|say exactly|following (?:phrases?|sentences?|words?|keywords?|options?|choices?))[^:\n]{0,40}:[ \t]*+"
)
PAYLOAD = re.compile(
    r"```.*?```"
    r"|(?P<lit><<[^>\n]{1,300}>>|`[^`\n]+`|\[[^\]\n]{1,60}\]|\*{3,})"
    r'|"(?P<dq>[^"\n]{1,300})"'
    r"|“(?P<cq>[^”\n]{1,300})”"
    r"|(?<![\w])'(?P<sq>[^'\n]{1,300})'(?![\w])"
    # (A payload that is already quoted or bracketed is handled by the branches above.)
    rf"|(?i:{_TRIGGER})(?![\"“'`<\[*])(?P<tp>[^\n]{{1,200}})",
    re.S,
)
_QUOTED = PAYLOAD

_NEGATION = re.compile(r"\b(?:not|no|never|without|avoid|cannot|nor)\b|n['’]t\b", re.I)
_RELATION = re.compile(
    r"\b(?:at least|at most|exactly|less than|more than|fewer than|or more|or less|or fewer|minimum|maximum)\b", re.I
)
_NUMBER_WORDS = (
    "two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|"
    "twenty|thirty|forty|fifty|hundred|thousand|once|twice|single"
)
_FORMAT_NOUNS = (
    r"commas?|lower ?case|upper ?case|capitali[sz]ed|capital letters?|in capitals|json|markdown|bullets?|"
    r"paragraphs?|sentences?|title|highlighted?|sections?|placeholders?|postscript|quotations?|letters?|words?"
)
_NUMBER = re.compile(
    rf"\b\d[\d,]*(?:\.\d+)?\+?|\b(?:{_NUMBER_WORDS})\b|\bone(?=\s+(?:{_FORMAT_NOUNS})\b)", re.I
)
_FORMAT = re.compile(rf"\bp\.\s?s\.|\b(?:{_FORMAT_NOUNS})\b", re.I)

# A prompt that asks to be reproduced is its own payload: any rewrite of it
# changes what the answer must contain, so it is never compressed. The same
# goes for one that refers to its words by position, since compressing shifts
# which word is "word 3".
_VERBATIM = re.compile(
    r"word for word|verbatim|exactly as (?:written|given)|copy (?:it|this|the following) exactly"
    r"|repeat(?:ing)? (?:the |this |my )?(?:exact |same |entire |whole |above |following )*"
    r"(?:request|question|prompt|sentence|text|query)"
    r"|(?:word|character|letter)s?[ -](?:index|indices|indexes|positions?)\b|\bindices\b|copy the span",
    re.I,
)

# Words that carry a requirement's meaning and are worth keeping when present.
_CONSTRAINT_WORDS = {
    "at", "least", "most", "less", "more", "than", "fewer", "every", "each", "all", "exactly", "only",
    "must", "without", "avoid", "not", "no", "never", "cannot", "nor", "minimum", "maximum",
}
_WORD = re.compile(r"[A-Za-z0-9]+(?:['’][A-Za-z]+)?")


def _flat(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower().replace("’", "'")).strip()


def _term(kind: str, raw: str) -> Term:
    text = _flat(raw)
    if kind == NEGATION:
        text = "not" if text in ("n't", "cannot") else text
    elif kind == NUMBER:
        text = text.replace(",", "")
    elif kind == FORMAT:
        text = re.sub(r"^lower ?case$", "lowercase", text)
        text = re.sub(r"^upper ?case$", "uppercase", text)
        text = "capital" if text.startswith(("capital", "in capital")) else text
        text = "p.s." if text.startswith("p.") else re.sub(r"(?<=[a-z])s$", "", text)
    return Term(kind, text)


def _quoted_terms(text: str) -> list[Term]:
    terms = []
    for m in _QUOTED.finditer(text):
        payload = m.group("dq") or m.group("cq") or m.group("sq") or m.group("tp")
        terms.append(Term(QUOTED, _flat(payload if payload is not None else m.group(0))))
    return terms


def _matches(text: str):
    """(kind, matched text) for every non-quoted requirement, quoted spans masked out."""
    masked = _QUOTED.sub(" ", text)
    for kind, rx in ((NEGATION, _NEGATION), (RELATION, _RELATION), (NUMBER, _NUMBER), (FORMAT, _FORMAT)):
        for m in rx.finditer(masked):
            yield kind, m.group(0)


def _scan(text: str) -> list[Term]:
    return [_term(kind, raw) for kind, raw in _matches(text)]


@dataclass(frozen=True)
class Contract:
    terms: tuple[Term, ...]
    # The prompt's own words that state a requirement ("commas", "at", "least",
    # "each", "don't"), as written: a compressor matches words, not stems.
    words: tuple[str, ...]
    verbatim: bool  # the prompt asks to be reproduced as-is

    def force_words(self) -> list[str]:
        """Words a token-dropping compressor must keep."""
        return list(self.words)

    def lost_in(self, text: str) -> list[Term]:
        """Requirements of this contract that `text` no longer states. Numbers,
        negations and relations must keep their count; a format noun only has
        to appear once; a quoted payload must appear verbatim."""
        flat, have = _flat(text), Counter(_scan(text))
        want = Counter(t for t in self.terms if t.kind != QUOTED)
        lost = [t for t, n in want.items() if have[t] < (1 if t.kind == FORMAT else n)]
        lost += [t for t in dict.fromkeys(self.terms) if t.kind == QUOTED and t.text not in flat]
        return lost

    def report(self, text: str, *, reverted: list[Term] = ()) -> dict:
        """The contract's state for `text`, in the shape the API returns.
        `reverted` lists what a discarded compression had dropped."""
        lost = self.lost_in(text)
        distinct = len(set(self.terms))
        as_dict = lambda terms: [{"kind": t.kind, "text": t.text} for t in terms]
        return {
            "terms": distinct,
            "kept": distinct - len(lost),
            "lost": as_dict(lost),
            "reverted": as_dict(reverted),
            "verbatim": self.verbatim,
        }


def hard_terms(terms: list[Term]) -> list[Term]:
    return [t for t in terms if t.kind in HARD]


def extract(prompt: str) -> Contract:
    prose = _QUOTED.sub(" ", prompt)
    # Quantifier words count wherever they appear ("each", "only"), and so do
    # contractions: "don't" is separate words to the compressor ("don", "'", "t").
    words = [w.lower() for w in _WORD.findall(prose) if w.lower() in _CONSTRAINT_WORDS]
    words += [m.group(0).lower() for m in re.finditer(r"\b\w+n['’]t\b", prose)]
    words += [w.lower() for _, raw in _matches(prompt) for w in _WORD.findall(raw)]
    return Contract(
        tuple(_quoted_terms(prompt) + _scan(prompt)), tuple(dict.fromkeys(words)), bool(_VERBATIM.search(prompt))
    )
