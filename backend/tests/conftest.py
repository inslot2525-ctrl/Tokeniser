import pytest
from fastapi.testclient import TestClient

from app import config
from app.api import security
from app.engine import llm


class FakeLLM:
    """Records calls and answers from scripted functions instead of the network."""

    def __init__(self):
        self.calls = []
        self.local_up = True
        # Realistic enough to pass the rule-based answer checks.
        self.local_reply = lambda prompt: "DNS maps domain names to IP addresses."
        self.remote_reply = lambda prompt: "DNS translates human-readable names into IP addresses."

    def _result(self, backend, model, prompt, text):
        self.calls.append((backend, prompt))
        return llm.LLMResult(text, backend, model, len(prompt) // 4, len(text) // 4)

    def ollama(self, prompt):
        if not self.local_up:
            raise llm.LLMError("connection refused")
        return self._result(llm.LOCAL, "gemma3:4b", prompt, self.local_reply(prompt))

    def gemini(self, prompt):
        return self._result(llm.REMOTE, "gemini-2.5-flash", prompt, self.remote_reply(prompt))


@pytest.fixture(autouse=True)
def isolated(tmp_path, monkeypatch):
    monkeypatch.setattr(config, "METRICS_DB_PATH", str(tmp_path / "metrics.db"))
    monkeypatch.setattr(config, "MODEL_PROVIDER", "auto")
    # Tests use the LLM rewrite path unless they opt into the compressor.
    monkeypatch.setattr(config, "COMPRESSOR", "llm")
    monkeypatch.setattr(config, "API_KEY", "")
    # No server-side Gemini key: AI mode must get one from the request.
    monkeypatch.setattr(config, "GEMINI_API_KEY", "")
    monkeypatch.setattr(security, "limiter", security.RateLimiter(1000))


@pytest.fixture
def fake_llm(monkeypatch):
    fake = FakeLLM()
    monkeypatch.setattr(llm, "ollama_generate", fake.ollama)
    monkeypatch.setattr(llm, "gemini_generate", fake.gemini)
    return fake


@pytest.fixture
def client():
    from app.main import app

    return TestClient(app)
