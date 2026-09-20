"""Status engine — THE ONLY PLACE case status is computed (I9).

Implements decision rules v1 from the shared context.
Thresholds from config. LLM code NEVER imports this writer.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum

from app.core.contradiction import Contradiction, has_unresolved_hard_contradiction
from app.core.matrix import EvidenceMatrix, SignalTier


class CaseStatus(StrEnum):
    STRONG_MATCH = "STRONG_MATCH"
    POSSIBLE_MATCH = "POSSIBLE_MATCH"
    AMBIGUOUS = "AMBIGUOUS"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
    LIKELY_DIFFERENT = "LIKELY_DIFFERENT"


@dataclass(frozen=True)
class StatusResult:
    """Result of status computation — no single percentage."""
    status: CaseStatus
    reasons: list[str]
    what_would_change: list[str]


def compute_status(
    matrix: EvidenceMatrix,
    contradictions: list[Contradiction],
    cluster_count: int,
    candidate_count: int,
    runner_up_matrix: EvidenceMatrix | None = None,
    *,
    min_clusters_strong: int = 2,
    min_discriminating_strong: int = 1,
    margin_threshold: int = 1,
    min_clusters_possible: int = 1,
) -> StatusResult:
    """Compute the case status using decision rules v1.

    This is the ONLY function that determines case status.
    It is deterministic, auditable, and configurable.

    Args:
        matrix: Evidence matrix for the primary candidate.
        contradictions: Detected contradictions.
        cluster_count: Number of independent source clusters supporting the candidate.
        candidate_count: Number of candidates identified.
        runner_up_matrix: Evidence matrix for the runner-up candidate (if any).
        min_clusters_strong: Minimum clusters for STRONG MATCH.
        min_discriminating_strong: Minimum DISCRIMINATING signals for STRONG MATCH.
        margin_threshold: Minimum signal advantage over runner-up.
        min_clusters_possible: Minimum clusters for POSSIBLE MATCH.

    Returns:
        StatusResult with status, reasons, and what_would_change.
    """
    reasons: list[str] = []
    what_would_change: list[str] = []

    disc_count = matrix.discriminating_support_count
    has_hard = has_unresolved_hard_contradiction(contradictions)
    only_weak = all(s.tier == SignalTier.WEAK for s in matrix.supporting) if matrix.supporting else True

    # Compute runner-up strength for margin
    runner_up_disc = runner_up_matrix.discriminating_support_count if runner_up_matrix else 0
    len(runner_up_matrix.unique_cluster_ids()) if runner_up_matrix else 0
    margin = disc_count - runner_up_disc

    # Rule: LIKELY DIFFERENT — hard contradiction not explained away
    if has_hard:
        reasons.append("Unresolved hard contradiction found")
        what_would_change.append("Resolve or explain away the hard contradiction")
        return StatusResult(
            status=CaseStatus.LIKELY_DIFFERENT,
            reasons=reasons,
            what_would_change=what_would_change,
        )

    # Rule: INSUFFICIENT EVIDENCE — no evidence, only weak, or single-cluster corroboration
    if not matrix.supporting:
        reasons.append("No supporting evidence found")
        what_would_change.append("Find any corroborating or discriminating evidence")
        return StatusResult(
            status=CaseStatus.INSUFFICIENT_EVIDENCE,
            reasons=reasons,
            what_would_change=what_would_change,
        )

    if only_weak:
        reasons.append("Only WEAK signals (name/username similarity)")
        what_would_change.append("Find CORROBORATING or DISCRIMINATING evidence")
        return StatusResult(
            status=CaseStatus.INSUFFICIENT_EVIDENCE,
            reasons=reasons,
            what_would_change=what_would_change,
        )

    if cluster_count < min_clusters_possible and disc_count < 1:
        reasons.append(f"Only {cluster_count} independent cluster(s), no DISCRIMINATING signal")
        what_would_change.append("Find evidence from additional independent sources")
        return StatusResult(
            status=CaseStatus.INSUFFICIENT_EVIDENCE,
            reasons=reasons,
            what_would_change=what_would_change,
        )

    # Rule: AMBIGUOUS — ≥2 candidates each reach POSSIBLE, no separating evidence
    if candidate_count >= 2 and runner_up_matrix:
        runner_up_has_support = bool(runner_up_matrix.supporting)
        runner_has_corroborating = any(
            s.tier in (SignalTier.DISCRIMINATING, SignalTier.CORROBORATING)
            for s in runner_up_matrix.supporting
        )
        if runner_up_has_support and runner_has_corroborating and margin < margin_threshold:
            reasons.append(
                f"Multiple candidates with comparable evidence "
                f"(margin={margin}, threshold={margin_threshold})"
            )
            what_would_change.append("Find separating evidence unique to one candidate")
            return StatusResult(
                status=CaseStatus.AMBIGUOUS,
                reasons=reasons,
                what_would_change=what_would_change,
            )

    # Rule: STRONG MATCH
    if (cluster_count >= min_clusters_strong
            and disc_count >= min_discriminating_strong
            and margin >= margin_threshold
            and not has_hard):
        reasons.append(
            f"{cluster_count} independent clusters, "
            f"{disc_count} DISCRIMINATING signal(s), "
            f"margin={margin} over runner-up, no hard contradiction"
        )
        return StatusResult(
            status=CaseStatus.STRONG_MATCH,
            reasons=reasons,
            what_would_change=what_would_change,
        )

    # Rule: POSSIBLE MATCH
    if (cluster_count >= min_clusters_possible
            and (disc_count >= 1 or cluster_count >= 2)):
        reasons.append(
            f"{cluster_count} cluster(s), {disc_count} DISCRIMINATING signal(s)"
        )
        what_would_change.append("Find additional independent evidence or DISCRIMINATING signals")
        return StatusResult(
            status=CaseStatus.POSSIBLE_MATCH,
            reasons=reasons,
            what_would_change=what_would_change,
        )

    # Fallback: INSUFFICIENT EVIDENCE
    reasons.append("Evidence does not meet any match threshold")
    what_would_change.append("Find stronger independent evidence")
    return StatusResult(
        status=CaseStatus.INSUFFICIENT_EVIDENCE,
        reasons=reasons,
        what_would_change=what_would_change,
    )
