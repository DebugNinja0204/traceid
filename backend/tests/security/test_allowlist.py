"""Allowlist tests — I7 invariant."""

from app.security.allowlist import is_allowed


def test_allowed_domain():
    """Domain matching a pattern is allowed."""
    result = is_allowed("sub.example", ["*.example"])
    assert result.allowed
    assert result.matched_pattern == "*.example"


def test_disallowed_domain():
    """Domain not matching any pattern is refused."""
    result = is_allowed("evil.com", ["*.example"])
    assert not result.allowed
    assert result.matched_pattern is None


def test_empty_domain():
    """Empty domain is refused."""
    result = is_allowed("", ["*.example"])
    assert not result.allowed


def test_exact_match():
    """Exact domain match works."""
    result = is_allowed("university.example", ["university.example"])
    assert result.allowed


def test_case_insensitive():
    """Domain matching is case-insensitive."""
    result = is_allowed("SUB.EXAMPLE", ["*.example"])
    assert result.allowed
