import os

from dotenv import load_dotenv

load_dotenv()


def _int(name: str, default: int) -> int:
    value = os.getenv(name, "").strip()
    return int(value) if value else default


def _float(name: str, default: float) -> float:
    value = os.getenv(name, "").strip()
    return float(value) if value else default


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# ollama | gemini | auto
MODEL_PROVIDER = os.getenv("MODEL_PROVIDER", "auto").lower()
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:4b")

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

API_KEY = os.getenv("API_KEY", "")
MAX_PROMPT_CHARS = _int("MAX_PROMPT_CHARS", 8000)
RATE_LIMIT_PER_MINUTE = _int("RATE_LIMIT_PER_MINUTE", 20)
LLM_TIMEOUT_SECONDS = _int("LLM_TIMEOUT_SECONDS", 60)
METRICS_DB_PATH = os.getenv("METRICS_DB_PATH", "metrics.db")

# USD per 1M tokens for the remote model. Defaults are Gemini 2.5 Flash list prices;
# override if pricing changes.
REMOTE_INPUT_PRICE_PER_M = _float("REMOTE_INPUT_PRICE_PER_M", 0.30)
REMOTE_OUTPUT_PRICE_PER_M = _float("REMOTE_OUTPUT_PRICE_PER_M", 2.50)

# A local answer scoring below this is escalated to the remote model.
VERIFY_THRESHOLD = _float("VERIFY_THRESHOLD", 8.0)
