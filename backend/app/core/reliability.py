"""Source reliability engine — deterministic tier assignment.

Maps source types to reliability tiers (HIGH/MEDIUM/LOW) using the rubric
from docs. All thresholds come from config.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum


class ReliabilityTier(StrEnum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class SourceType(StrEnum):
    ORGANIZER_PROVIDED = "ORGANIZER_PROVIDED"
    INSTITUTIONAL_OFFICIAL = "INSTITUTIONAL_OFFICIAL"
    PROFESSIONAL_PROFILE = "PROFESSIONAL_PROFILE"
    PUBLICATION = "PUBLICATION"
    THIRD_PARTY_MENTION = "THIRD_PARTY_MENTION"
    ANONYMOUS = "ANONYMOUS"
    UNKNOWN = "UNKNOWN"


# Rubric: source type → base tier
_TIER_RUBRIC: dict[SourceType, ReliabilityTier] = {
    SourceType.ORGANIZER_PROVIDED: ReliabilityTier.HIGH,
    SourceType.INSTITUTIONAL_OFFICIAL: ReliabilityTier.HIGH,
    SourceType.PROFESSIONAL_PROFILE: ReliabilityTier.MEDIUM,
    SourceType.PUBLICATION: ReliabilityTier.MEDIUM,
    SourceType.THIRD_PARTY_MENTION: ReliabilityTier.LOW,
    SourceType.ANONYMOUS: ReliabilityTier.LOW,
    SourceType.UNKNOWN: ReliabilityTier.LOW,
}


@dataclass(frozen=True)
class ReliabilityResult:
    """Result of reliability assessment."""
    tier: ReliabilityTier
    reason: str


def assess_reliability(
    source_type: SourceType | str,
    *,
    has_injection_flags: bool = False,
) -> ReliabilityResult:
    """Assess the reliability tier for a source.

    Args:
        source_type: The type of the source.
        has_injection_flags: Whether the source was flagged for injection patterns.

    Returns:
        ReliabilityResult with tier and reason.
    """
    if isinstance(source_type, str):
        try:
            source_type = SourceType(source_type)
        except ValueError:
            return ReliabilityResult(
                tier=ReliabilityTier.LOW,
                reason=f"Unknown source type '{source_type}' defaults to LOW",
            )

    base_tier = _TIER_RUBRIC.get(source_type, ReliabilityTier.LOW)
    reason = f"Source type {source_type.value} maps to {base_tier.value}"

    # Injection flags cap reliability at LOW
    if has_injection_flags and base_tier != ReliabilityTier.LOW:
        return ReliabilityResult(
            tier=ReliabilityTier.LOW,
            reason=f"{reason}; downgraded to LOW due to injection flags",
        )

    return ReliabilityResult(tier=base_tier, reason=reason)
