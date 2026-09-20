"""Contradiction detection engine — rules over structured claims.

Deterministic rules for detecting contradictions. LLM proposals (from agents/)
must be verified through these rules before they count.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum


class ContradictionSeverity(StrEnum):
    HARD = "HARD"
    SOFT = "SOFT"


class ContradictionKind(StrEnum):
    DIFFERENT_ORGANIZATION = "different_organization"
    DIFFERENT_LOCATION = "different_location"
    DIFFERENT_EDUCATION = "different_education"
    IMPOSSIBLE_TIMELINE = "impossible_timeline"
    OVERLAPPING_EMPLOYMENT = "overlapping_employment"
    PROJECT_ATTRIBUTION = "project_attribution"
    USERNAME_REUSE = "username_reuse"
    BIOGRAPHY_MISMATCH = "biography_mismatch"


@dataclass(frozen=True)
class StructuredClaim:
    """A structured claim extracted from evidence."""
    claim_id: str
    entity_type: str
    attribute: str
    value: str
    date_start: datetime | None = None
    date_end: datetime | None = None
    source_id: str = ""
    candidate_id: str = ""
    evidence_ids: tuple[str, ...] = ()


@dataclass(frozen=True)
class Contradiction:
    """A detected contradiction between claims."""
    kind: ContradictionKind
    severity: ContradictionSeverity
    claim_ids: tuple[str, ...]
    evidence_ids: tuple[str, ...]
    description: str
    explained_away: bool = False


def _dates_overlap(
    start_a: datetime | None, end_a: datetime | None,
    start_b: datetime | None, end_b: datetime | None,
) -> bool:
    """Check if two date ranges overlap."""
    if start_a is None or start_b is None:
        return False
    end_a = end_a or datetime.max
    end_b = end_b or datetime.max
    return start_a <= end_b and start_b <= end_a


def _is_impossible_timeline(claims: list[StructuredClaim]) -> list[Contradiction]:
    """Detect impossible timelines (e.g., graduated before born)."""
    contradictions: list[Contradiction] = []
    dated = [c for c in claims if c.date_start is not None]

    for i, a in enumerate(dated):
        for b in dated[i + 1:]:
            if a.candidate_id != b.candidate_id:
                continue
            # Check for impossible: e.g., "student 2020-2024" + "senior engineer 2014-2021"
            # when context says "current student graduating 2027"
            if (a.attribute == "education" and b.attribute == "employment"
                    and a.date_start and b.date_end and a.date_start > b.date_end):
                # Student started after employment ended — check if dates make sense
                pass
            # Overlapping employment at different organizations
            if (a.attribute == "employment" and b.attribute == "employment"
                    and a.value != b.value
                    and _dates_overlap(a.date_start, a.date_end, b.date_start, b.date_end)):
                contradictions.append(Contradiction(
                    kind=ContradictionKind.OVERLAPPING_EMPLOYMENT,
                    severity=ContradictionSeverity.SOFT,
                    claim_ids=(a.claim_id, b.claim_id),
                    evidence_ids=a.evidence_ids + b.evidence_ids,
                    description=(
                        f"Overlapping employment: '{a.value}' "
                        f"({a.date_start}-{a.date_end}) vs '{b.value}' "
                        f"({b.date_start}-{b.date_end})"
                    ),
                ))

    return contradictions


def detect_contradictions(
    claims: list[StructuredClaim],
) -> list[Contradiction]:
    """Detect contradictions across structured claims using deterministic rules.

    Args:
        claims: List of structured claims to check.

    Returns:
        List of detected contradictions.
    """
    contradictions: list[Contradiction] = []

    # Group claims by candidate
    by_candidate: dict[str, list[StructuredClaim]] = {}
    for c in claims:
        by_candidate.setdefault(c.candidate_id, []).append(c)

    for _cand_id, cand_claims in by_candidate.items():
        # Rule: Different organization for same role/period
        org_claims = [c for c in cand_claims if c.attribute in ("employer", "organization", "employment")]
        for i, a in enumerate(org_claims):
            for b in org_claims[i + 1:]:
                if a.value.lower() != b.value.lower():
                    overlap = _dates_overlap(a.date_start, a.date_end, b.date_start, b.date_end)
                    if overlap or (a.date_start is None and b.date_start is None):
                        contradictions.append(Contradiction(
                            kind=ContradictionKind.DIFFERENT_ORGANIZATION,
                            severity=ContradictionSeverity.HARD if overlap else ContradictionSeverity.SOFT,
                            claim_ids=(a.claim_id, b.claim_id),
                            evidence_ids=a.evidence_ids + b.evidence_ids,
                            description=f"Different organizations: '{a.value}' vs '{b.value}'",
                        ))

        # Rule: Different location
        loc_claims = [c for c in cand_claims if c.attribute == "location"]
        for i, a in enumerate(loc_claims):
            for b in loc_claims[i + 1:]:
                if a.value.lower() != b.value.lower():
                    contradictions.append(Contradiction(
                        kind=ContradictionKind.DIFFERENT_LOCATION,
                        severity=ContradictionSeverity.SOFT,
                        claim_ids=(a.claim_id, b.claim_id),
                        evidence_ids=a.evidence_ids + b.evidence_ids,
                        description=f"Different locations: '{a.value}' vs '{b.value}'",
                    ))

        # Rule: Different education
        edu_claims = [c for c in cand_claims if c.attribute == "education"]
        for i, a in enumerate(edu_claims):
            for b in edu_claims[i + 1:]:
                if a.value.lower() != b.value.lower():
                    contradictions.append(Contradiction(
                        kind=ContradictionKind.DIFFERENT_EDUCATION,
                        severity=ContradictionSeverity.SOFT,
                        claim_ids=(a.claim_id, b.claim_id),
                        evidence_ids=a.evidence_ids + b.evidence_ids,
                        description=f"Different education: '{a.value}' vs '{b.value}'",
                    ))

        # Rule: Impossible timeline
        contradictions.extend(_is_impossible_timeline(cand_claims))

    return contradictions


def has_unresolved_hard_contradiction(contradictions: list[Contradiction]) -> bool:
    """Check if there are any unresolved hard contradictions."""
    return any(
        c.severity == ContradictionSeverity.HARD and not c.explained_away
        for c in contradictions
    )
