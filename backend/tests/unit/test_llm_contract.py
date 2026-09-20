"""LLM contract tests — I5 invariant."""

import pytest
from pydantic import ValidationError

from app.llm.schemas import ExtractedClaim, ExtractionResult


def test_extra_fields_rejected():
    """I5: LLM schemas with extra=forbid reject unexpected fields."""
    with pytest.raises(ValidationError):
        ExtractedClaim(
            entity_type="PERSON",
            attribute="name",
            value="Aarav Mehta",
            snippet="Aarav Mehta is a researcher",
            hallucinated_field="This should not exist",
        )


def test_valid_extraction():
    """Valid extraction result parses correctly."""
    result = ExtractionResult(
        source_id="s1",
        claims=[
            ExtractedClaim(
                entity_type="PERSON",
                attribute="name",
                value="Aarav Mehta",
                snippet="Aarav Mehta is a researcher at Meridian Institute",
            ),
        ],
    )
    assert len(result.claims) == 1
    assert result.claims[0].value == "Aarav Mehta"


def test_empty_claims_valid():
    """Empty claims list is valid (LLM found nothing)."""
    result = ExtractionResult(source_id="s1", claims=[])
    assert len(result.claims) == 0
