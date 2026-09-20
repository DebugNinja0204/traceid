"""Domain allowlist enforcement.

Allowlist is checked in the adapter base class, not in callers.
"""

from __future__ import annotations

import fnmatch
from dataclasses import dataclass


@dataclass(frozen=True)
class AllowlistResult:
    """Result of an allowlist check."""
    allowed: bool
    domain: str
    matched_pattern: str | None = None
    reason: str = ""


def is_allowed(domain: str, allowed_patterns: list[str]) -> AllowlistResult:
    """Check if a domain is in the allowlist.

    Uses glob/fnmatch patterns (e.g., "*.example" matches "sub.example").

    Args:
        domain: Domain to check.
        allowed_patterns: List of allowed domain patterns.

    Returns:
        AllowlistResult with whether the domain is allowed.
    """
    if not domain:
        return AllowlistResult(
            allowed=False,
            domain=domain,
            reason="Empty domain",
        )

    domain_lower = domain.lower().strip()

    for pattern in allowed_patterns:
        if fnmatch.fnmatch(domain_lower, pattern.lower()):
            return AllowlistResult(
                allowed=True,
                domain=domain_lower,
                matched_pattern=pattern,
                reason=f"Domain '{domain_lower}' matches pattern '{pattern}'",
            )

    return AllowlistResult(
        allowed=False,
        domain=domain_lower,
        reason=f"Domain '{domain_lower}' not in allowlist",
    )
