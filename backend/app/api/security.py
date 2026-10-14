import secrets
import threading
import time
from collections import defaultdict, deque

from fastapi import Header, HTTPException, Request

from app import config


def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    """Enforced only when API_KEY is configured."""
    if config.API_KEY and not secrets.compare_digest(x_api_key or "", config.API_KEY):
        raise HTTPException(status_code=401, detail="Invalid or missing X-API-Key")


class RateLimiter:
    """Sliding-window limit per client IP. In-process only: with several
    workers each one keeps its own window, so swap in Redis if you scale out."""

    def __init__(self, limit: int, window_seconds: float = 60.0):
        self.limit = limit
        self.window = window_seconds
        self._hits: dict[str, deque] = defaultdict(deque)
        self._lock = threading.Lock()

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        with self._lock:
            hits = self._hits[key]
            while hits and now - hits[0] > self.window:
                hits.popleft()
            if len(hits) >= self.limit:
                return False
            hits.append(now)
            return True


limiter = RateLimiter(config.RATE_LIMIT_PER_MINUTE)


def rate_limit(request: Request) -> None:
    client = request.client.host if request.client else "unknown"
    if limiter.limit > 0 and not limiter.allow(client):
        raise HTTPException(status_code=429, detail="Rate limit exceeded, try again in a minute")
