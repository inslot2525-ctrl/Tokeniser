import importlib.util

import pytest

from app import config
from app.engine import compressor
from app.engine.optimizer import compress_with_metrics

HAS_LINGUA = importlib.util.find_spec("llmlingua") is not None

# Long, with filler for the rules and substance left over for LLMLingua-2.
TECH_PROMPT = "Hi there! Could you please explain " + (
    "how the TCP handshake works, including SYN and ACK flags, sequence numbers, "
    "retransmission timers and window sizes. "
) * 3 + "Thanks so much!"


@pytest.fixture
def fake_lingua(monkeypatch):
    """Pretend LLMLingua-2 is installed; 'compression' keeps every other word."""
    monkeypatch.setattr(config, "COMPRESSOR", "auto")
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


def test_unfenced_code_disables_compression(fake_lingua):
    text = "please " * 40 + "fix this: function sum(arr) { for (let i = 1; i <= arr.length; i++) {} }"
    assert compressor.compress(text) == text


def test_inline_code_spans_stay_in_place(fake_lingua):
    text = "word " * 40 + "then call `items.sort(key=len)` and print the result"
    assert "`items.sort(key=len)`" in compressor.compress(text)


def test_prose_is_not_mistaken_for_code():
    for prose in ["Keep each one to a single sentence; don't mention Kubernetes.",
                  "Compare A vs B - which is better?", "Use 5-7-5 syllables."]:
        assert not compressor.UNFENCED_CODE.search(prose), prose


def test_short_prompts_are_left_alone(fake_lingua):
    text = "Summarize the theory of evolution in three sentences."
    assert compressor.compress(text) == text


def test_clean_rejoins_word_pieces():
    assert compressor.clean("don ' t use 12345 - 6789 , ok ?") == "don't use 12345-6789, ok?"
    assert compressor.clean("worst case,?") == "worst case?"
    assert compressor.clean("columns customer _ id, created _ at") == "columns customer_id, created_at"
    assert compressor.clean("don t mention it, it doesn t matter") == "don't mention it, it doesn't matter"


def test_rules_then_lingua_calls_no_model(fake_lingua, fake_llm):
    result = compress_with_metrics(TECH_PROMPT)
    assert result["method"] == f"Rules + {compressor.NAME}"
    assert {r["label"] for r in result["removed_phrases"]} >= {"greeting", "thanks"}
    assert result["saved_tokens"] > 0
    assert fake_llm.calls == []


def test_rules_only_when_lingua_missing(monkeypatch, fake_llm):
    monkeypatch.setattr(config, "COMPRESSOR", "auto")
    monkeypatch.setattr(compressor, "enabled", lambda: False)
    result = compress_with_metrics(TECH_PROMPT)
    assert result["method"] == "Rules"
    assert result["saved_tokens"] > 0
    assert fake_llm.calls == []


def test_short_prompt_gets_rules_only(fake_lingua):
    # Rules remove the filler; what's left is too short for LLMLingua-2.
    assert compress_with_metrics("Hi! What is DNS? Thanks!")["method"] == "Rules"


def test_agent_net_savings_equal_gross_with_local_compression(client, fake_lingua, fake_llm):
    fake_llm.remote_reply = lambda p: '{"score": 9}'
    body = client.post(
        "/agent", json={"prompt": TECH_PROMPT, "mode": "ai"}, headers={"X-Gemini-Key": "k"}
    ).json()
    tokens = body["tokens"]
    # Only the judge call counts as overhead; compression itself is free.
    assert any(compressor.NAME in step for step in body["steps"])
    assert tokens["saved"] > 0
    assert [backend for backend, _ in fake_llm.calls] == ["Local", "Gemini"]


def test_free_mode_with_no_model_still_compresses(client, fake_lingua, fake_llm):
    fake_llm.local_up = False
    body = client.post("/agent", json={"prompt": TECH_PROMPT}).json()
    assert body["route"] == "Not answered"
    assert body["tokens"]["saved"] > 0
    assert body["tokens"]["pipeline_overhead"] == 0
    assert fake_llm.calls == []


def test_rules_setting_disables_lingua(monkeypatch):
    monkeypatch.setattr(config, "COMPRESSOR", "rules")
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
