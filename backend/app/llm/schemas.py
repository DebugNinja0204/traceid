"""LLM Pydantic schemas — structured output with extra=forbid (I5)."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class ExtractedClaim(BaseModel):
    """A single claim extracted from a source document."""
    model_config = ConfigDict(extra="forbid")

    entity_type: str
    attribute: str
    value: str
    snippet: str  # Must exist verbatim in source text (I4)
    date: str | None = None


class ExtractionResult(BaseModel):
    """Result of LLM extraction from a source document."""
    model_config = ConfigDict(extra="forbid")

    claims: list[ExtractedClaim]
    source_id: str


class QuerySuggestion(BaseModel):
    """A suggested search query from the planner."""
    model_config = ConfigDict(extra="forbid")

    query: str
    target_domains: list[str]
    rationale: str


class QueryPlan(BaseModel):
    """Plan of search queries to discover sources."""
    model_config = ConfigDict(extra="forbid")

    suggestions: list[QuerySuggestion]


class ReportSection(BaseModel):
    """A section of the investigation report."""
    model_config = ConfigDict(extra="forbid")

    title: str
    text: str
    evidence_ids: list[str]


class ReportResult(BaseModel):
    """Full report with sections bound to evidence."""
    model_config = ConfigDict(extra="forbid")

    sections: list[ReportSection]


class CopilotAnswer(BaseModel):
    """Answer from the copilot with citations."""
    model_config = ConfigDict(extra="forbid")

    answer: str
    evidence_ids: list[str]
    refused: bool = False
    refusal_reason: str | None = None


class ContradictionProposal(BaseModel):
    """LLM-proposed contradiction to be verified by deterministic rules."""
    model_config = ConfigDict(extra="forbid")

    kind: str
    claim_ids: list[str]
    description: str
