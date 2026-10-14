import importlib.util

import pytest

from app import config
from app.engine import compressor
from app.engine.optimizer import rewrite_with_metrics
from app.engine.planner import plan_actions
from tests.test_engine import LONG_PROMPT

HAS_LINGUA = importlib.util.find_spec("llmlingua") is not None


@pytest.fixture
def fake_lingua(monkeypatch):
    """Pretend LLMLingua-2 is installed; 'compression' keeps every other word."""
    monkeypatch.setattr(compressor, "enabled", lambda: True)
    monkeypatch.setattr(
        compressor, "_compress_prose", lambda text, rate: " ".join(text.split()[::2])
    )


def test_code_blocks_pass_through_untouched(fake_lingua):
    code = "```python\ndef add(a, b):\n    return a + b\n```"
    prose = "please " * 40 + "fix this function"
    out = compressor.compress(f"{prose}\n{code}\nthanks a lot")
    assert code in out
    assert out.count("please") == 20


def test_short_prompts_are_left_alone(fake_lingua):
    text = "Summarize the theory of evolution in three sentences."
    assert compressor.compress(text) == text


def test_clean_rejoins_word_pieces():
    assert compressor.clean("don ' t use 12345 - 6789 , ok ?") == "don't use 12345-6789, ok?"
    assert compressor.clean("worst case,?") == "worst case?"


def test_compression_costs_no_api_tokens(fake_lingua, fake_llm):
    result = rewrite_with_metrics(LONG_PROMPT, "compress")
    assert result["backend"] == compressor.NAME
    assert result["overhead_tokens"] == 0
    assert result["saved_tokens"] > 0
    assert fake_llm.calls == []


def test_enhance_still_uses_llm(fake_lingua, fake_llm):
    result = rewrite_with_metrics("fix my grammer pls", "enhance")
    assert result["backend"] != compressor.NAME
    assert len(fake_llm.calls) == 1


def test_planner_uses_lower_threshold_for_local_compression(fake_lingua):
    medium = "word " * 50  # between the local (40) and LLM (60) thresholds
    assert plan_actions(medium)["optimize"] is True
    assert plan_actions("What is DNS?")["optimize"] is False


def test_agent_net_savings_equal_gross_with_local_compression(client, fake_lingua, fake_llm):
    fake_llm.remote_reply = lambda p: '{"score": 9}'
    body = client.post("/agent", json={"prompt": LONG_PROMPT}).json()
    tokens = body["tokens"]
    # Only the judge call counts as overhead; compression itself is free.
    assert any(compressor.NAME in step for step in body["steps"])
    assert tokens["saved"] > 0
    assert [backend for backend, _ in fake_llm.calls] == ["Local", "Gemini"]


def test_llm_setting_disables_compressor(monkeypatch):
    monkeypatch.setattr(config, "COMPRESSOR", "llm")
    assert compressor.enabled() is False


@pytest.mark.skipif(not HAS_LINGUA, reason="llmlingua not installed")
@pytest.mark.slow
def test_real_model_shortens_verbose_prompt():
    text = (
        "Hi there! I hope you're doing well. I was wondering if you could possibly "
        "help me out. Could you please explain the difference between a process "
        "and a thread in an operating system? Thank you so much in advance!"
    )
    out = compressor.compress(text, rate=0.5)
    assert len(out.split()) < len(text.split())
    assert "process" in out and "thread" in out
