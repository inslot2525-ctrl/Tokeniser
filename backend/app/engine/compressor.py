"""Extractive prompt compression with LLMLingua-2.

A small local token classifier (BERT-base, ~700 MB) scores every token and
drops the least informative ones. Unlike an LLM rewrite it spends no API
tokens, so the savings are net savings. It does not fix grammar or rephrase,
so /enhance still uses the LLM.

llmlingua (and PyTorch) is an optional dependency: install
requirements-lingua.txt to enable it. Without it, or with COMPRESSOR=llm,
the optimizer falls back to the single-call LLM rewrite.
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

# Code is never compressed: dropping tokens from it breaks it.
CODE_BLOCK = re.compile(r"```.*?```", re.S)

# Tokens the model must always keep: punctuation, plus words that carry
# constraints. Dropping "not" or "exactly" silently inverts or loosens a
# requirement. Each is a single token in the model's vocabulary.
FORCE_TOKENS = [
    "\n", "?", "!", ".", ",", ":",
    "not", "Not", "no", "No", "never", "Never", "without", "don", "Don", "avoid",
    "must", "Must", "only", "Only", "exactly", "least", "most", "each",
]

# Below this size there is little to remove, and the words the model drops
# tend to be the instruction itself ("Summarize ..." -> "evolution three sentences").
MIN_TOKENS = 40

# The model returns word pieces re-joined with spaces: "don ' t", "5 - 7 - 5".
_SPACED_JOINER = re.compile(r"(?<=\w) ([-'’/]) (?=\w)")
_SPACE_BEFORE_PUNCT = re.compile(r" ([,.?!:;])")
_DUPLICATE_PUNCT = re.compile(r"[,;:]([.?!])")

# The model object is not documented as thread-safe, and FastAPI runs sync
# endpoints in a thread pool.
_lock = threading.Lock()


def enabled() -> bool:
    if config.COMPRESSOR == "llm":
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
    text = _SPACE_BEFORE_PUNCT.sub(r"\1", text)
    return _DUPLICATE_PUNCT.sub(r"\1", text)


def compress(text: str, rate: float | None = None) -> str:
    if count_tokens(text) < MIN_TOKENS:
        return text

    rate = rate or config.COMPRESSION_RATE
    prose_parts = CODE_BLOCK.split(text)
    code_blocks = CODE_BLOCK.findall(text)

    pieces = []
    for i, prose in enumerate(prose_parts):
        if prose.strip():
            pieces.append(_compress_prose(prose.strip(), rate))
        if i < len(code_blocks):
            pieces.append(code_blocks[i])

    return "\n".join(pieces)
