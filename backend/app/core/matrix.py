"""Evidence matrix builder — supporting / contradicting / unresolved.

Builds the interpretable evidence matrix that the API and UI show.
No single confidence percentage anywhere (D7, I10).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum


class SupportLevel(StrEnum):
    SUPPORTING = "SUPPORTING"
    CONTRADICTING = "CONTRADICTING"
    UNRESOLVED = "UNRESOLVED"


class SignalTier(StrEnum):
    DISCRIMINATING = "DISCRIMINATING"
    CORROBORATING = "CORROBORATING"
    WEAK = "WEAK"


class SignalDirection(StrEnum):
    SUPPORTS = "SUPPORTS"
    CONTRADICTS = "CONTRADICTS"
    NEUTRAL = "NEUTRAL"


@dataclass(frozen=True)
class Signal:
    """A typed signal from entity resolution or evidence analysis."""
    feature: str  # e.g., "name", "username", "mutual_link"
    tier: SignalTier
    direction: SignalDirection
    evidence_ids: tuple[str, ...]
    cluster_id: str = ""
    reason: str = ""


@dataclass
class EvidenceMatrix:
    """Interpretable evidence matrix — no single percentage.

    Organized by supporting/contradicting/unresolved signals with tiers.
    """
    supporting: list[Signal] = field(default_factory=list)
    contradicting: list[Signal] = field(default_factory=list)
    unresolved: list[Signal] = field(default_factory=list)

    def add_signal(self, signal: Signal) -> None:
        if signal.direction == SignalDirection.SUPPORTS:
            self.supporting.append(signal)
        elif signal.direction == SignalDirection.CONTRADICTS:
            self.contradicting.append(signal)
        else:
            self.unresolved.append(signal)

    @property
    def discriminating_support_count(self) -> int:
        return sum(1 for s in self.supporting if s.tier == SignalTier.DISCRIMINATING)

    @property
    def has_hard_contradiction(self) -> bool:
        """Check for contradicting signals at DISCRIMINATING tier."""
        return any(s.tier == SignalTier.DISCRIMINATING for s in self.contradicting)

    def unique_cluster_ids(self) -> set[str]:
        """Get unique independence cluster IDs from supporting signals."""
        return {s.cluster_id for s in self.supporting if s.cluster_id}

    def to_dict(self) -> dict:
        """Serialize matrix — no percentage field anywhere."""
        def _signal_dict(s: Signal) -> dict:
            return {
                "feature": s.feature,
                "tier": s.tier.value,
                "direction": s.direction.value,
                "evidence_ids": list(s.evidence_ids),
                "cluster_id": s.cluster_id,
                "reason": s.reason,
            }
        return {
            "supporting": [_signal_dict(s) for s in self.supporting],
            "contradicting": [_signal_dict(s) for s in self.contradicting],
            "unresolved": [_signal_dict(s) for s in self.unresolved],
        }


def build_matrix(signals: list[Signal]) -> EvidenceMatrix:
    """Build an evidence matrix from a list of signals."""
    matrix = EvidenceMatrix()
    for signal in signals:
        matrix.add_signal(signal)
    return matrix
