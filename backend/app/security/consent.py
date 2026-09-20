"""Consent gate enforcement — no processing without explicit consent (I8)."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ConsentRecord:
    """Recorded consent for an investigation."""
    consenter: str
    scope: str
    investigation_id: str


class ConsentError(Exception):
    """Raised when consent is missing or invalid."""

    def __init__(self, message: str = "Consent required before processing"):
        super().__init__(message)
        self.message = message


def validate_consent(
    consenter: str | None,
    scope: str | None,
) -> ConsentRecord | None:
    """Validate that consent fields are present.

    Args:
        consenter: Who provided consent.
        scope: Scope of consent.

    Returns:
        None if invalid (caller should raise ConsentError).

    Raises:
        ConsentError: If consent fields are missing.
    """
    if not consenter or not consenter.strip():
        raise ConsentError("Consent consenter is required")
    if not scope or not scope.strip():
        raise ConsentError("Consent scope is required")
    return None  # Validation passed; actual record is created in the API layer
