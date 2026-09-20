"""Status engine tests — I1, I3 invariants."""

from app.core.contradiction import Contradiction, ContradictionKind, ContradictionSeverity
from app.core.matrix import EvidenceMatrix, Signal, SignalDirection, SignalTier
from app.core.status import CaseStatus, compute_status


def test_no_evidence_is_insufficient():
    """I1: No usable evidence ⇒ INSUFFICIENT EVIDENCE."""
    matrix = EvidenceMatrix()  # empty
    result = compute_status(
        matrix=matrix,
        contradictions=[],
        cluster_count=0,
        candidate_count=0,
    )
    assert result.status == CaseStatus.INSUFFICIENT_EVIDENCE


def test_only_weak_signals_is_insufficient():
    """Only WEAK signals (name/username) ⇒ INSUFFICIENT EVIDENCE."""
    matrix = EvidenceMatrix()
    matrix.add_signal(Signal(
        feature="name", tier=SignalTier.WEAK,
        direction=SignalDirection.SUPPORTS, evidence_ids=("e1",),
        reason="Name similarity 0.92",
    ))
    matrix.add_signal(Signal(
        feature="username", tier=SignalTier.WEAK,
        direction=SignalDirection.SUPPORTS, evidence_ids=("e2",),
        reason="Username match",
    ))
    result = compute_status(
        matrix=matrix,
        contradictions=[],
        cluster_count=1,
        candidate_count=1,
    )
    assert result.status == CaseStatus.INSUFFICIENT_EVIDENCE


def test_hard_contradiction_blocks_match():
    """I3: Unresolved hard contradiction prevents STRONG/POSSIBLE MATCH."""
    matrix = EvidenceMatrix()
    matrix.add_signal(Signal(
        feature="mutual_link", tier=SignalTier.DISCRIMINATING,
        direction=SignalDirection.SUPPORTS, evidence_ids=("e1",),
        cluster_id="c1",
    ))
    matrix.add_signal(Signal(
        feature="organization", tier=SignalTier.CORROBORATING,
        direction=SignalDirection.SUPPORTS, evidence_ids=("e2",),
        cluster_id="c2",
    ))
    hard = Contradiction(
        kind=ContradictionKind.IMPOSSIBLE_TIMELINE,
        severity=ContradictionSeverity.HARD,
        claim_ids=("cl1", "cl2"),
        evidence_ids=("e3", "e4"),
        description="Impossible timeline",
        explained_away=False,
    )
    result = compute_status(
        matrix=matrix,
        contradictions=[hard],
        cluster_count=2,
        candidate_count=1,
    )
    assert result.status == CaseStatus.LIKELY_DIFFERENT
    assert result.status != CaseStatus.STRONG_MATCH
    assert result.status != CaseStatus.POSSIBLE_MATCH


def test_strong_match():
    """≥2 clusters + ≥1 DISCRIMINATING + no contradiction + margin → STRONG MATCH."""
    matrix = EvidenceMatrix()
    matrix.add_signal(Signal(
        feature="mutual_link", tier=SignalTier.DISCRIMINATING,
        direction=SignalDirection.SUPPORTS, evidence_ids=("e1",),
        cluster_id="c1",
    ))
    matrix.add_signal(Signal(
        feature="organization", tier=SignalTier.CORROBORATING,
        direction=SignalDirection.SUPPORTS, evidence_ids=("e2",),
        cluster_id="c2",
    ))
    result = compute_status(
        matrix=matrix,
        contradictions=[],
        cluster_count=2,
        candidate_count=1,
    )
    assert result.status == CaseStatus.STRONG_MATCH


def test_possible_match():
    """1 cluster + DISCRIMINATING only → POSSIBLE MATCH."""
    matrix = EvidenceMatrix()
    matrix.add_signal(Signal(
        feature="mutual_link", tier=SignalTier.DISCRIMINATING,
        direction=SignalDirection.SUPPORTS, evidence_ids=("e1",),
        cluster_id="c1",
    ))
    result = compute_status(
        matrix=matrix,
        contradictions=[],
        cluster_count=1,
        candidate_count=1,
    )
    assert result.status == CaseStatus.POSSIBLE_MATCH


def test_ambiguous():
    """Two candidates both POSSIBLE, no separating evidence → AMBIGUOUS."""
    matrix_a = EvidenceMatrix()
    matrix_a.add_signal(Signal(
        feature="organization", tier=SignalTier.CORROBORATING,
        direction=SignalDirection.SUPPORTS, evidence_ids=("e1",),
        cluster_id="c1",
    ))
    matrix_a.add_signal(Signal(
        feature="education", tier=SignalTier.CORROBORATING,
        direction=SignalDirection.SUPPORTS, evidence_ids=("e2",),
        cluster_id="c2",
    ))

    matrix_b = EvidenceMatrix()
    matrix_b.add_signal(Signal(
        feature="organization", tier=SignalTier.CORROBORATING,
        direction=SignalDirection.SUPPORTS, evidence_ids=("e3",),
        cluster_id="c3",
    ))
    matrix_b.add_signal(Signal(
        feature="education", tier=SignalTier.CORROBORATING,
        direction=SignalDirection.SUPPORTS, evidence_ids=("e4",),
        cluster_id="c4",
    ))

    result = compute_status(
        matrix=matrix_a,
        contradictions=[],
        cluster_count=2,
        candidate_count=2,
        runner_up_matrix=matrix_b,
    )
    assert result.status == CaseStatus.AMBIGUOUS


def test_likely_different():
    """Hard contradiction not explained → LIKELY DIFFERENT."""
    matrix = EvidenceMatrix()
    matrix.add_signal(Signal(
        feature="name", tier=SignalTier.WEAK,
        direction=SignalDirection.SUPPORTS, evidence_ids=("e1",),
    ))
    hard = Contradiction(
        kind=ContradictionKind.IMPOSSIBLE_TIMELINE,
        severity=ContradictionSeverity.HARD,
        claim_ids=("cl1", "cl2"),
        evidence_ids=("e2", "e3"),
        description="Student claimed 2027 grad, but senior engineer 2014-2021",
        explained_away=False,
    )
    result = compute_status(
        matrix=matrix,
        contradictions=[hard],
        cluster_count=1,
        candidate_count=1,
    )
    assert result.status == CaseStatus.LIKELY_DIFFERENT
