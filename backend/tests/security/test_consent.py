"""Consent gate tests — I8 invariant."""

import pytest

from app.security.consent import ConsentError, validate_consent


def test_missing_consenter_raises():
    """I8: Missing consenter raises ConsentError."""
    with pytest.raises(ConsentError):
        validate_consent(None, "full_investigation")


def test_missing_scope_raises():
    """I8: Missing scope raises ConsentError."""
    with pytest.raises(ConsentError):
        validate_consent("user@example.com", None)


def test_empty_consenter_raises():
    """I8: Empty consenter raises ConsentError."""
    with pytest.raises(ConsentError):
        validate_consent("", "full_investigation")


def test_empty_scope_raises():
    """I8: Empty scope raises ConsentError."""
    with pytest.raises(ConsentError):
        validate_consent("user@example.com", "")


def test_valid_consent_passes():
    """Valid consent does not raise."""
    validate_consent("user@example.com", "full_investigation")
