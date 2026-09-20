"""Entity resolution engine — blocking + per-feature comparison.

Deterministic scorer producing typed signals and pair states per D1.
Embeddings are OPTIONAL and never decide alone.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum

from rapidfuzz import fuzz

from app.core.matrix import Signal, SignalDirection, SignalTier


class PairState(StrEnum):
    SAME = "SAME"
    POSSIBLY_SAME = "POSSIBLY_SAME"
    DIFFERENT = "DIFFERENT"
    UNKNOWN = "UNKNOWN"


@dataclass
class CandidateProfile:
    """Profile data for a candidate."""
    candidate_id: str
    name: str = ""
    usernames: list[str] | None = None
    organizations: list[str] | None = None
    education: list[str] | None = None
    locations: list[str] | None = None
    bio: str = ""
    linked_profiles: list[str] | None = None  # URLs or profile IDs


@dataclass(frozen=True)
class ResolutionResult:
    """Result of comparing two candidate profiles."""
    pair_state: PairState
    signals: list[Signal]
    reasons: list[str]


def _compare_strings(a: str, b: str) -> float:
    """Normalized string similarity using rapidfuzz."""
    if not a or not b:
        return 0.0
    return fuzz.ratio(a.lower().strip(), b.lower().strip()) / 100.0


def _compare_lists(a: list[str] | None, b: list[str] | None) -> tuple[float, list[tuple[str, str]]]:
    """Compare two lists of strings, return best match score and matched pairs."""
    if not a or not b:
        return 0.0, []
    best_score = 0.0
    matches: list[tuple[str, str]] = []
    for item_a in a:
        for item_b in b:
            score = _compare_strings(item_a, item_b)
            if score > best_score:
                best_score = score
            if score > 0.8:
                matches.append((item_a, item_b))
    return best_score, matches


def resolve_pair(
    profile_a: CandidateProfile,
    profile_b: CandidateProfile,
    *,
    name_threshold: float = 0.85,
    username_threshold: float = 0.90,
) -> ResolutionResult:
    """Compare two candidate profiles and produce a pair state with signals.

    Args:
        profile_a: First candidate profile.
        profile_b: Second candidate profile.
        name_threshold: Similarity threshold for name matching.
        username_threshold: Similarity threshold for username matching.

    Returns:
        ResolutionResult with pair state, signals, and reasons.
    """
    signals: list[Signal] = []
    reasons: list[str] = []

    # Feature: Name similarity (WEAK — name alone is never enough)
    name_sim = _compare_strings(profile_a.name, profile_b.name)
    if name_sim >= name_threshold:
        signals.append(Signal(
            feature="name",
            tier=SignalTier.WEAK,
            direction=SignalDirection.SUPPORTS,
            evidence_ids=(),
            reason=f"Name similarity {name_sim:.2f}",
        ))

    # Feature: Username similarity (WEAK)
    if profile_a.usernames and profile_b.usernames:
        user_score, user_matches = _compare_lists(profile_a.usernames, profile_b.usernames)
        if user_score >= username_threshold:
            signals.append(Signal(
                feature="username",
                tier=SignalTier.WEAK,
                direction=SignalDirection.SUPPORTS,
                evidence_ids=(),
                reason=f"Username match: {user_matches}",
            ))

    # Feature: Organization match (CORROBORATING)
    if profile_a.organizations and profile_b.organizations:
        org_score, org_matches = _compare_lists(profile_a.organizations, profile_b.organizations)
        if org_score > 0.8:
            signals.append(Signal(
                feature="organization",
                tier=SignalTier.CORROBORATING,
                direction=SignalDirection.SUPPORTS,
                evidence_ids=(),
                reason=f"Organization match: {org_matches}",
            ))

    # Feature: Education match (CORROBORATING)
    if profile_a.education and profile_b.education:
        edu_score, edu_matches = _compare_lists(profile_a.education, profile_b.education)
        if edu_score > 0.8:
            signals.append(Signal(
                feature="education",
                tier=SignalTier.CORROBORATING,
                direction=SignalDirection.SUPPORTS,
                evidence_ids=(),
                reason=f"Education match: {edu_matches}",
            ))

    # Feature: Location match (WEAK)
    if profile_a.locations and profile_b.locations:
        loc_score, loc_matches = _compare_lists(profile_a.locations, profile_b.locations)
        if loc_score > 0.8:
            signals.append(Signal(
                feature="location",
                tier=SignalTier.WEAK,
                direction=SignalDirection.SUPPORTS,
                evidence_ids=(),
                reason=f"Location match: {loc_matches}",
            ))

    # Feature: Mutual profile links (DISCRIMINATING)
    if profile_a.linked_profiles and profile_b.linked_profiles:
        a_links = set(profile_a.linked_profiles)
        b_links = set(profile_b.linked_profiles)
        # Mutual link = A links to B and B links to A
        mutual = bool(
            any(link in b_links for link in a_links)
            and any(link in a_links for link in b_links)
        )
        if mutual:
            signals.append(Signal(
                feature="mutual_link",
                tier=SignalTier.DISCRIMINATING,
                direction=SignalDirection.SUPPORTS,
                evidence_ids=(),
                reason="Mutual bidirectional profile links",
            ))

    # Feature: Bio similarity (CORROBORATING if substantial match)
    if profile_a.bio and profile_b.bio:
        bio_sim = _compare_strings(profile_a.bio, profile_b.bio)
        if bio_sim > 0.7:
            signals.append(Signal(
                feature="bio",
                tier=SignalTier.CORROBORATING,
                direction=SignalDirection.SUPPORTS,
                evidence_ids=(),
                reason=f"Bio similarity {bio_sim:.2f}",
            ))

    # Determine pair state from signals
    has_discriminating = any(s.tier == SignalTier.DISCRIMINATING for s in signals)
    has_corroborating = any(s.tier == SignalTier.CORROBORATING for s in signals)
    supporting_count = len([s for s in signals if s.direction == SignalDirection.SUPPORTS])

    if has_discriminating and has_corroborating:
        pair_state = PairState.SAME
        reasons.append("DISCRIMINATING + CORROBORATING signals found")
    elif has_discriminating or (has_corroborating and supporting_count >= 2):
        pair_state = PairState.POSSIBLY_SAME
        reasons.append("Strong supporting signals but not sufficient for SAME")
    elif supporting_count > 0:
        pair_state = PairState.UNKNOWN
        reasons.append("Some supporting signals but insufficient for determination")
    else:
        pair_state = PairState.UNKNOWN
        reasons.append("No supporting signals found")

    return ResolutionResult(
        pair_state=pair_state,
        signals=signals,
        reasons=reasons,
    )
