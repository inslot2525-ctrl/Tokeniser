"""Extractive prompt compression with LLMLingua-2.

A small local token classifier (BERT-base, ~700 MB) scores every token and
drops the least informative ones. Unlike an LLM rewrite it spends no API
tokens, so the savings are net savings. It does not fix grammar or rephrase,
so /enhance still uses the LLM.

llmlingua (and PyTorch) is an optional dependency: install
requirements-lingua.txt to enable it. Without it, or with COMPRESSOR=rules,
compression uses the rule-based compressor alone.
"""

import importlib.util
import logging
import re
import threading
from functools import lru_cache

from app import config
from app.engine.contract import PAYLOAD, Contract
from app.engine.tokenizer import count_tokens

log = logging.getLogger(__name__)

NAME = "LLMLingua-2"

# Code is never compressed: dropping tokens from it breaks it. Fenced blocks
# and inline `spans` are passed through untouched...
CODE_BLOCK = re.compile(r"```.*?```|`[^`\n]+`", re.S)
# ...and a prompt with unfenced code-like syntax is not compressed at all,
# because there is no reliable way to tell where the code starts and stops.
UNFENCED_CODE = re.compile(r"[{};]\s*\S.*[{};]|[=!<>]=|\+\+|--\s*[;)]|=>|\)\s*\{|\bfunction\s*\w*\s*\(|\bdef \w+\(")

# Tokens the model must always keep: punctuation, plus words that carry
# constraints. Dropping "not" or "exactly" silently inverts or loosens a
# requirement. This static list is the base; with a contract it is extended
# with the words of the prompt's own requirements (see _force_tokens).
FORCE_TOKENS = [
    "\n", "?", "!", ".", ",", ":", "_",
    "not", "Not", "no", "No", "never", "Never", "without", "don", "Don", "avoid",
    "must", "Must", "only", "Only", "exactly", "least", "most", "each",
]
MAX_FORCE_TOKENS = 100  # llmlingua's max_force_token

# Below this size there is little to remove, and the words the model drops
# tend to be the instruction itself ("Summarize ..." -> "evolution three sentences").
MIN_TOKENS = 40
# The same holds for the stretch of prose between two protected spans: compressed
# alone, "Write a haiku about autumn leaves." became "haiku autumn."
MIN_FRAGMENT_TOKENS = MIN_TOKENS

# The model returns word pieces re-joined with spaces: "don ' t", "5 - 7 - 5",
# "customer _ id". Identifiers and contractions must be glued back together.
_SPACED_JOINER = re.compile(r"(?<=\w) ([-'’/_]) (?=\w)")
# Safety net if the apostrophe itself was dropped: "don t" -> "don't".
_BROKEN_CONTRACTION = re.compile(
    r"\b(don|doesn|didn|isn|aren|wasn|weren|can|couldn|won|wouldn|shouldn|haven|hasn) t\b", re.I
)
# ...and so is an abbreviation like "P.S." ("P. S.", "P. P. S").
_SPLIT_ABBREVIATION = re.compile(r"\b([A-Z])\. (?=[A-Z]\b)")
_SPACE_BEFORE_PUNCT = re.compile(r" ([,.?!:;])")
_DUPLICATE_PUNCT = re.compile(r"[,;:]([.?!])")

# The model object is not documented as thread-safe, and FastAPI runs sync
# endpoints in a thread pool.
_lock = threading.Lock()


def enabled() -> bool:
    if config.COMPRESSOR == "rules":
        return False
    return importlib.util.find_spec("llmlingua") is not None


@lru_cache(maxsize=1)
def _model():
    from llmlingua import PromptCompressor

    log.info("Loading %s (%s)", NAME, config.LINGUA_MODEL)
    return PromptCompressor(
        model_name=config.LINGUA_MODEL,
        use_llmlingua2=True,
        device_map="cpu",
    )


def warm_up() -> None:
    """Load the model ahead of the first request (it takes several seconds)."""
    if enabled():
        _model()


@lru_cache(maxsize=4096)
def _pieces(word: str) -> tuple[str, ...]:
    """The word-pieces the model matches force-tokens against. It matches a
    word by its first piece; a contraction ("don't") is separate words
    ("don", "'", "t"), so all of its pieces are needed."""
    pieces = [p.lstrip("#").lstrip("▁") for p in _model().tokenizer.tokenize(word)]
    pieces = [p for p in pieces if p]
    return tuple(pieces) if "'" in word or "’" in word else tuple(pieces[:1])


def _force_tokens(words) -> list[str]:
    """The prompt's own requirement words first, then the static list, so the
    prompt-specific ones win if the 100-token cap bites."""
    out: dict[str, None] = {}
    for word in words:
        for variant in (word, word.lower(), word.capitalize()):
            out.update(dict.fromkeys(_pieces(variant)))
    out.update(dict.fromkeys(FORCE_TOKENS))
    return list(out)[:MAX_FORCE_TOKENS]


def _compress_prose(text: str, rate: float, force_words=()) -> str:
    with _lock:
        result = _model().compress_prompt(
            text,
            rate=rate,
            force_tokens=_force_tokens(force_words) if force_words else FORCE_TOKENS,
            # Numbers are usually constraints ("exactly 4", "5-7-5"); keep them.
            force_reserve_digit=True,
            drop_consecutive=True,
        )
    return clean(result["compressed_prompt"])


def clean(text: str) -> str:
    text = _SPACED_JOINER.sub(r"\1", text)
    text = _SPLIT_ABBREVIATION.sub(r"\1.", text)
    text = _BROKEN_CONTRACTION.sub(r"\1't", text)
    text = _SPACE_BEFORE_PUNCT.sub(r"\1", text)
    return _DUPLICATE_PUNCT.sub(r"\1", text)


def compress(text: str, rate: float | None = None, contract: Contract | None = None) -> str:
    """With a `contract` (see contract.py) the prompt's own requirement words
    are force-kept and quoted payloads pass through; without one, only the
    static FORCE_TOKENS protect it."""
    if count_tokens(text) < MIN_TOKENS:
        return text

    protected = PAYLOAD if contract else CODE_BLOCK
    if UNFENCED_CODE.search(protected.sub(" ", text)):
        log.info("Skipping %s: prompt contains unfenced code", NAME)
        return text

    rate = rate or config.COMPRESSION_RATE
    force_words = contract.force_words() if contract else ()
    min_fragment = MIN_FRAGMENT_TOKENS if contract else 0
    # Not re.split: PAYLOAD has named groups, and split would return them too.
    prose_parts, code_blocks, pos = [], [], 0
    for m in protected.finditer(text):
        prose_parts.append(text[pos:m.start()])
        code_blocks.append(m.group(0))
        pos = m.end()
    prose_parts.append(text[pos:])

    out = ""
    for i, prose in enumerate(prose_parts):
        prose = prose.strip()
        if prose:
            if prose[0] in ",.;:!?)":
                out = out.rstrip(" ")  # punctuation that hugs the span before it
            if count_tokens(prose) < min_fragment:
                out += prose
            else:
                out += re.sub(r"[ \t]+", " ", _compress_prose(prose, rate, force_words))
        if i < len(code_blocks):
            block = code_blocks[i]
            # Fenced blocks go on their own lines; inline spans stay in the
            # sentence. Code is inserted verbatim, whitespace included.
            if block.startswith("```"):
                out = out.rstrip(" ") + f"\n{block}\n"
            else:
                out = out.rstrip(" ") + f" {block} "

    return out.strip()
