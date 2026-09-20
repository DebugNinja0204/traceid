"""Real-Time Persistent SQLite Database Manager with WAL concurrency.

Provides real-time transactional persistence for investigations, photos, evidence matrices,
timelines, review actions, and append-only audit trails.
"""

from __future__ import annotations

import contextlib
import logging
import os
import sqlite3
from typing import Generator

logger = logging.getLogger("traceid.db")

DEFAULT_DB_PATH = os.environ.get("SQLITE_DB_PATH", "traceid.db")


def get_db_path(custom_path: str | None = None) -> str:
    """Resolve database path."""
    if custom_path:
        return custom_path
    from app.config import get_settings
    try:
        return get_settings().SQLITE_DB_PATH
    except Exception:
        return DEFAULT_DB_PATH


@contextlib.contextmanager
def get_connection(db_path: str | None = None) -> Generator[sqlite3.Connection, None, None]:
    """Provide a thread-safe connection to SQLite with WAL mode and row factory."""
    resolved_path = get_db_path(db_path)
    # Ensure directory exists if path contains directories
    dirname = os.path.dirname(resolved_path)
    if dirname:
        os.makedirs(dirname, exist_ok=True)

    conn = sqlite3.connect(
        resolved_path,
        timeout=10.0,
        isolation_level=None,  # autocommit mode, transactions handled explicitly
    )
    conn.row_factory = sqlite3.Row

    # Configure WAL (Write-Ahead Logging) for real-time concurrent reads & writes
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA busy_timeout=10000;")
    conn.execute("PRAGMA foreign_keys=ON;")

    try:
        yield conn
    finally:
        conn.close()


def init_db(db_path: str | None = None) -> None:
    """Initialize database tables, indexes, and constraints."""
    with get_connection(db_path) as conn:
        with conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS investigations (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    status TEXT NOT NULL,
                    status_reasons TEXT NOT NULL DEFAULT '[]',
                    what_would_change TEXT NOT NULL DEFAULT '[]',
                    iteration_count INTEGER NOT NULL DEFAULT 1,
                    candidate_count INTEGER NOT NULL DEFAULT 1,
                    context TEXT NOT NULL DEFAULT '{}',
                    image_analysis TEXT,
                    consent TEXT,
                    pipeline_stage TEXT NOT NULL DEFAULT 'PENDING',
                    pipeline_status TEXT NOT NULL DEFAULT 'PENDING',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
            """)

            conn.execute("""
                CREATE TABLE IF NOT EXISTS investigation_images (
                    investigation_id TEXT PRIMARY KEY,
                    image_bytes BLOB NOT NULL,
                    mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
                    FOREIGN KEY (investigation_id) REFERENCES investigations(id) ON DELETE CASCADE
                );
            """)

            conn.execute("""
                CREATE TABLE IF NOT EXISTS investigation_entities (
                    investigation_id TEXT PRIMARY KEY,
                    candidates TEXT NOT NULL DEFAULT '[]',
                    runner_up TEXT,
                    sources TEXT NOT NULL DEFAULT '[]',
                    clusters TEXT NOT NULL DEFAULT '[]',
                    evidence TEXT NOT NULL DEFAULT '[]',
                    graph_nodes TEXT NOT NULL DEFAULT '[]',
                    graph_edges TEXT NOT NULL DEFAULT '[]',
                    timeline_events TEXT NOT NULL DEFAULT '[]',
                    contradictions TEXT NOT NULL DEFAULT '[]',
                    gaps TEXT NOT NULL DEFAULT '[]',
                    FOREIGN KEY (investigation_id) REFERENCES investigations(id) ON DELETE CASCADE
                );
            """)

            conn.execute("""
                CREATE TABLE IF NOT EXISTS review_actions (
                    id TEXT PRIMARY KEY,
                    investigation_id TEXT NOT NULL,
                    action_type TEXT NOT NULL,
                    target_type TEXT NOT NULL,
                    target_id TEXT NOT NULL,
                    reason TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (investigation_id) REFERENCES investigations(id) ON DELETE CASCADE
                );
            """)

            # Append-only tamper-evident audit trail (Invariant I11)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS audit_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    investigation_id TEXT NOT NULL,
                    action TEXT NOT NULL,
                    actor TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    details TEXT NOT NULL
                );
            """)

            # Indexes for high performance querying
            conn.execute("CREATE INDEX IF NOT EXISTS idx_investigations_created_at ON investigations(created_at DESC);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_audit_log_inv_id ON audit_log(investigation_id);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_review_actions_inv_id ON review_actions(investigation_id);")

        logger.info("Real-time SQLite database initialized at '%s'", get_db_path(db_path))
