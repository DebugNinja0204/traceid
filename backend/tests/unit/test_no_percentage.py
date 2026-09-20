"""No percentage field test — I10 invariant."""

import json

from app.core.matrix import EvidenceMatrix, Signal, SignalDirection, SignalTier


def test_no_percentage_field():
    """I10: Matrix serialization has no single percentage/score field."""
    matrix = EvidenceMatrix()
    matrix.add_signal(Signal(
        feature="name", tier=SignalTier.WEAK,
        direction=SignalDirection.SUPPORTS, evidence_ids=("e1",),
        reason="Name match",
    ))
    matrix.add_signal(Signal(
        feature="organization", tier=SignalTier.CORROBORATING,
        direction=SignalDirection.SUPPORTS, evidence_ids=("e2",),
        reason="Org match",
    ))

    serialized = matrix.to_dict()
    text = json.dumps(serialized).lower()

    # Must not contain percentage, confidence, or score fields
    assert "percentage" not in text
    assert "confidence" not in text
    assert "score" not in text
    assert "probability" not in text

    # Must have the expected structure
    assert "supporting" in serialized
    assert "contradicting" in serialized
    assert "unresolved" in serialized
