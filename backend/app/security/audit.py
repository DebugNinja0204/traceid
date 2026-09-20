"""Audit logger — append-only (I12)."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime

logger = logging.getLogger("traceid.audit")


@dataclass
class AuditEntry:
    """A single audit log entry."""
    action: str
    actor: str = "system"
    investigation_id: str | None = None
    details: dict = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)


class AuditLogger:
    """Append-only audit logger.

    In MVP, logs to structured Python logging.
    In production, writes to the audit_log table (append-only, no UPDATE/DELETE).
    """

    def __init__(self) -> None:
        self._entries: list[AuditEntry] = []

    def log(
        self,
        action: str,
        *,
        actor: str = "system",
        investigation_id: str | None = None,
        details: dict | None = None,
    ) -> AuditEntry:
        """Append an audit entry."""
        entry = AuditEntry(
            action=action,
            actor=actor,
            investigation_id=investigation_id,
            details=details or {},
        )
        self._entries.append(entry)
        logger.info(
            "AUDIT action=%s actor=%s investigation=%s details=%s",
            action, actor, investigation_id, details,
        )
        return entry

    def log_refusal(self, domain: str, investigation_id: str | None = None) -> AuditEntry:
        """Log a source fetch refusal (allowlist enforcement)."""
        return self.log(
            action="SOURCE_REFUSAL",
            investigation_id=investigation_id,
            details={"domain": domain, "reason": "Domain not in allowlist"},
        )

    def log_consent(self, consenter: str, scope: str, investigation_id: str) -> AuditEntry:
        """Log consent recorded."""
        return self.log(
            action="CONSENT_RECORDED",
            investigation_id=investigation_id,
            details={"consenter": consenter, "scope": scope},
        )

    def get_entries(self, investigation_id: str | None = None) -> list[AuditEntry]:
        """Get audit entries (read-only). Never delete."""
        if investigation_id:
            return [e for e in self._entries if e.investigation_id == investigation_id]
        return list(self._entries)
