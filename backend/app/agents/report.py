"""Investigation Dossier Report Agent — template-driven narrative with sentence-level evidence binding.

Enforces Invariant I9: does NOT import or set case status.
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from app.llm.schemas import ReportResult, ReportSection

if TYPE_CHECKING:
    from app.llm.provider import LLMProvider

logger = logging.getLogger("traceid.agents.report")


def generate_dossier_report(
    provider: LLMProvider,
    case_title: str,
    status_str: str,
    status_reasons: list[str],
    what_would_change: list[str],
    evidence_items: list[dict[str, Any]],
    cluster_count: int,
    source_count: int,
    candidate_bio: str = "",
) -> list[dict[str, Any]]:
    """Generate narrative report sections bound to verified evidence IDs.

    Args:
        provider: LLMProvider instance.
        case_title: Title of investigation.
        status_str: Final deterministic status string.
        status_reasons: Reasons computed by core/status.py.
        what_would_change: Deterministic threshold explanations.
        evidence_items: List of verified evidence item dicts.
        cluster_count: Number of independent clusters.
        source_count: Number of total sources.
        candidate_bio: Verified bio summary of primary candidate.

    Returns:
        List of dicts {"title": str, "text": str, "evidence_ids": list[str]}.
    """
    valid_eids = {e.get("id") for e in evidence_items if e.get("id")}
    ev_summary = "\n".join(
        f"[{e.get('id')}] ({e.get('signal_tier')}): {e.get('snippet')}"
        for e in evidence_items[:20]
    )

    reasons_text = "; ".join(status_reasons) if status_reasons else "Deterministic rule evaluation completed."

    system_prompt = (
        "You are an investigative intelligence analyst generating a formal identity verification dossier. "
        "Produce 2 to 3 concise report sections:\n"
        "1. 'Executive Summary': High-level evaluation overview citing primary evidence IDs and the identified persona.\n"
        "2. 'Source Provenance & Independence': Review of independence clustering and source origins.\n"
        "3. 'Risk & Contradiction Analysis': Any conflicts or unresolved items.\n"
        "CRITICAL RULE: Every statement asserting identity facts MUST cite valid evidence IDs in square brackets (e.g. [ev-1])."
    )

    user_prompt = (
        f"Case: '{case_title}'\n"
        f"Identified Primary Candidate Persona: {candidate_bio or 'Unspecified'}\n"
        f"Evaluated Case Status: {status_str}\n"
        f"Evaluation Rationale: {reasons_text}\n"
        f"Total Sources Discovered: {source_count}\n"
        f"Independent Derivation Clusters: {cluster_count}\n\n"
        f"Verified Evidence Set:\n{ev_summary}\n\n"
        f"Generate the formal structured report sections with evidence bindings."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    try:
        res: ReportResult = provider.generate_structured(messages, ReportResult, schema_name="dossier_report")
        sections: list[dict[str, Any]] = []
        for s in res.sections:
            # Filter valid evidence IDs
            clean_ids = [eid for eid in s.evidence_ids if eid in valid_eids]
            sections.append({
                "title": s.title,
                "text": s.text,
                "evidence_ids": clean_ids,
            })
        if sections:
            return sections
    except Exception as e:
        logger.warning("LLM report generation failed: %s; falling back to deterministic template", e)

    # Fallback deterministic report
    all_ev_ids = list(valid_eids)
    return [
        {
            "title": "Executive Summary",
            "text": (
                f"TRACEID completed deterministic evaluation for '{case_title}'. "
                + (f"Identified primary candidate: {candidate_bio} " if candidate_bio else "")
                + f"Evaluation concluded with status {status_str} based on {len(evidence_items)} verified evidence chains "
                f"across {cluster_count} independent source cluster(s)."
            ),
            "evidence_ids": all_ev_ids[:3],
        },
        {
            "title": "Source Provenance & Independence",
            "text": (
                f"Identity claims were evaluated across {source_count} discovered sources, grouped into "
                f"{cluster_count} independent provenance clusters. Verification requires multi-cluster corroboration."
            ),
            "evidence_ids": all_ev_ids[3:6],
        },
        {
            "title": "Risk & Contradiction Analysis",
            "text": (
                f"Evaluation rules rationale: {reasons_text}."
            ),
            "evidence_ids": [],
        },
    ]
