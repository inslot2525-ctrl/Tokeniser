"""Request metrics, persisted in SQLite so they survive restarts and are
shared across worker processes."""

import sqlite3
import threading
from contextlib import closing
from datetime import datetime, timezone

from app import config

_lock = threading.Lock()

SCHEMA = """
CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    route TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    original_tokens INTEGER NOT NULL,
    optimized_tokens INTEGER NOT NULL,
    overhead_tokens INTEGER NOT NULL,
    verification_score REAL,
    cost REAL NOT NULL
)
"""


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(config.METRICS_DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute(SCHEMA)
    return conn


def log_request(*, route, difficulty, original_tokens, optimized_tokens,
                overhead_tokens, verification_score, cost) -> None:
    with _lock, closing(_connect()) as conn, conn:
        conn.execute(
            "INSERT INTO requests (timestamp, route, difficulty, original_tokens,"
            " optimized_tokens, overhead_tokens, verification_score, cost)"
            " VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (datetime.now(timezone.utc).isoformat(timespec="seconds"), route, difficulty,
             original_tokens, optimized_tokens, overhead_tokens, verification_score, cost),
        )


def get_dashboard() -> dict:
    with _lock, closing(_connect()) as conn:
        totals = conn.execute(
            "SELECT COUNT(*) AS n, COALESCE(SUM(original_tokens), 0) AS orig,"
            " COALESCE(SUM(original_tokens - optimized_tokens), 0) AS saved,"
            " COALESCE(SUM(overhead_tokens), 0) AS overhead,"
            " COALESCE(SUM(cost), 0) AS cost,"
            " AVG(verification_score) AS avg_score FROM requests"
        ).fetchone()
        routes = dict(conn.execute("SELECT route, COUNT(*) FROM requests GROUP BY route").fetchall())
        history = [dict(r) for r in conn.execute(
            "SELECT * FROM requests ORDER BY id DESC LIMIT 20"
        ).fetchall()]

    n = totals["n"]
    return {
        "total_requests": n,
        "total_tokens_saved": totals["saved"],
        "pipeline_overhead_tokens": totals["overhead"],
        "net_tokens_saved": totals["saved"] - totals["overhead"],
        "avg_savings_percent": round(totals["saved"] / totals["orig"] * 100, 2) if totals["orig"] else 0.0,
        "route_distribution": routes,
        "local_percentage": round(routes.get("Local", 0) / n * 100, 2) if n else 0.0,
        "estimated_remote_cost": round(totals["cost"], 6),
        "average_verification": round(totals["avg_score"], 2) if totals["avg_score"] is not None else None,
        "history": history,
    }
