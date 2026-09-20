"""Timeline engine — deterministic date ordering and conflict detection."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class TimelineClaim:
    """A dated claim for timeline analysis."""
    claim_id: str
    description: str
    date_start: datetime | None = None
    date_end: datetime | None = None
    candidate_id: str = ""
    evidence_ids: tuple[str, ...] = ()


@dataclass(frozen=True)
class TimelineEvent:
    """A timeline event with optional conflict markers."""
    claim_id: str
    description: str
    date_start: datetime | None
    date_end: datetime | None
    is_impossible: bool = False
    conflicts_with: tuple[str, ...] = ()


def build_timeline(claims: list[TimelineClaim]) -> list[TimelineEvent]:
    """Order dated claims chronologically and flag impossible/overlapping periods.

    Args:
        claims: List of dated claims.

    Returns:
        Sorted list of timeline events with conflict markers.
    """
    if not claims:
        return []

    # Filter to dated claims and sort by start date
    dated = [c for c in claims if c.date_start is not None]
    undated = [c for c in claims if c.date_start is None]

    dated.sort(key=lambda c: c.date_start or datetime.min)  # filtered to non-None above

    events: list[TimelineEvent] = []

    # Check for overlapping/impossible periods within same candidate
    by_candidate: dict[str, list[TimelineClaim]] = {}
    for c in dated:
        by_candidate.setdefault(c.candidate_id, []).append(c)

    conflict_map: dict[str, list[str]] = {}

    for _cand_id, cand_claims in by_candidate.items():
        for i, a in enumerate(cand_claims):
            for b in cand_claims[i + 1:]:
                if (a.date_start and b.date_start and a.date_end and b.date_end
                        and a.date_start <= b.date_end and b.date_start <= a.date_end):
                    conflict_map.setdefault(a.claim_id, []).append(b.claim_id)
                    conflict_map.setdefault(b.claim_id, []).append(a.claim_id)

    # Build events
    for c in dated:
        conflicts = tuple(conflict_map.get(c.claim_id, []))
        events.append(TimelineEvent(
            claim_id=c.claim_id,
            description=c.description,
            date_start=c.date_start,
            date_end=c.date_end,
            is_impossible=len(conflicts) > 0,
            conflicts_with=conflicts,
        ))

    # Add undated claims at the end
    for c in undated:
        events.append(TimelineEvent(
            claim_id=c.claim_id,
            description=c.description,
            date_start=None,
            date_end=None,
        ))

    return events
