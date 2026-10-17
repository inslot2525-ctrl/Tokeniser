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
# requirement. Each is a single token in the model's vocabulary.
FORCE_TOKENS = [
    "\n", "?", "!", ".", ",", ":", "_",
    "not", "Not", "no", "No", "never", "Never", "without", "don", "Don", "avoid",
    "must", "Must", "only", "Only", "exactly", "least", "most", "each",
]

# Below this size there is little to remove, and the words the model drops
# tend to be the instruction itself ("Summarize ..." -> "evolution three sentences").
MIN_TOKENS = 40

# The model returns word pieces re-joined with spaces: "don ' t", "5 - 7 - 5",
# "customer _ id". Identifiers and contractions must be glued back together.
_SPACED_JOINER = re.compile(r"(?<=\w) ([-'’/_]) (?=\w)")
# Safety net if the apostrophe itself was dropped: "don t" -> "don't".
_BROKEN_CONTRACTION = re.compile(
    r"\b(don|doesn|didn|isn|aren|wasn|weren|can|couldn|won|wouldn|shouldn|haven|hasn) t\b", re.I
)
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


def _compress_prose(text: str, rate: float) -> str:
    with _lock:
        result = _model().compress_prompt(
            text,
            rate=rate,
            force_tokens=FORCE_TOKENS,
            # Numbers are usually constraints ("exactly 4", "5-7-5"); keep them.
            force_reserve_digit=True,
            drop_consecutive=True,
        )
    return clean(result["compressed_prompt"])


def clean(text: str) -> str:
    text = _SPACED_JOINER.sub(r"\1", text)
    text = _BROKEN_CONTRACTION.sub(r"\1't", text)
    text = _SPACE_BEFORE_PUNCT.sub(r"\1", text)
    return _DUPLICATE_PUNCT.sub(r"\1", text)


def compress(text: str, rate: float | None = None) -> str:
    if count_tokens(text) < MIN_TOKENS:
        return text

    prose_only = CODE_BLOCK.sub(" ", text)
    if UNFENCED_CODE.search(prose_only):
        log.info("Skipping %s: prompt contains unfenced code", NAME)
        return text

    rate = rate or config.COMPRESSION_RATE
    prose_parts = CODE_BLOCK.split(text)
    code_blocks = CODE_BLOCK.findall(text)

    out = ""
    for i, prose in enumerate(prose_parts):
        if prose.strip():
            out += re.sub(r"[ \t]+", " ", _compress_prose(prose.strip(), rate))
        if i < len(code_blocks):
            block = code_blocks[i]
            # Fenced blocks go on their own lines; inline spans stay in the
            # sentence. Code is inserted verbatim, whitespace included.
            if block.startswith("```"):
                out = out.rstrip(" ") + f"\n{block}\n"
            else:
                out = out.rstrip(" ") + f" {block} "

    return out.strip()
