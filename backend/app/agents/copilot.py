"""Grounded Evidence Copilot Agent — cites investigation evidence and enforces refusal rules.

Enforces Invariant I9: does NOT import or set case status.
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from app.llm.schemas import CopilotAnswer

if TYPE_CHECKING:
    from app.llm.provider import LLMProvider

logger = logging.getLogger("traceid.agents.copilot")

BLOCKED_PII = [
    "private phone", "home address", "residential address", "ssn",
    "social security", "password", "bank account", "steal", "hack", "credit card",
]

BLOCKED_MUTATION = [
    "change status to", "force match", "override status", "fabricate", "guess identity", "ignore evidence",
]


def ask_copilot(
    provider: LLMProvider,
    question: str,
    evidence_items: list[dict[str, Any]],
    case_title: str = "",
    current_status: str = "",
) -> CopilotAnswer:
    """Answer user questions grounded in case evidence with refusal guards.

    Args:
        provider: LLMProvider instance.
        question: User query.
        evidence_items: List of dicts representing verified case evidence.
        case_title: Title or subject of the investigation.
        current_status: Current status string (read-only reference).

    Returns:
        CopilotAnswer instance.
    """
    q_lower = question.lower()

    # Rule 1: Refuse private PII requests
    if any(k in q_lower for k in BLOCKED_PII):
        return CopilotAnswer(
            answer=(
                "I cannot answer this query: TRACEID strictly refuses requests "
                "for private PII, personal phone numbers, passwords, or residential addresses."
            ),
            evidence_ids=[],
            refused=True,
            refusal_reason="OUT_OF_SCOPE_PII",
        )

    # Rule 2: Refuse unauthorized status modification or fabrication requests
    if any(k in q_lower for k in BLOCKED_MUTATION):
        return CopilotAnswer(
            answer=(
                "I cannot modify investigation status or fabricate identity links. "
                "Status decisions are strictly deterministic and human-audited."
            ),
            evidence_ids=[],
            refused=True,
            refusal_reason="UNAUTHORIZED_STATE_MUTATION",
        )

    # Format case evidence as grounded context
    evidence_lines: list[str] = []
    valid_ids: set[str] = set()
    for ev in evidence_items[:25]:
        e_id = ev.get("id", "")
        snip = ev.get("snippet", "")
        src = ev.get("source_id", "")
        tier = ev.get("signal_tier", "")
        if e_id and snip:
            valid_ids.add(e_id)
            evidence_lines.append(f"- [{e_id}] ({tier}, source: {src}): \"{snip}\"")

    evidence_context = "\n".join(evidence_lines) if evidence_lines else "No verified evidence items available."

    system_prompt = (
        "You are the TRACEID Intelligence Copilot, a read-only evidentiary assistant. "
        "Your task is to provide concise, factual, and strictly grounded answers using ONLY the provided case evidence.\n"
        "DIRECTIVES:\n"
        "1. Every factual statement must cite one or more evidence IDs in square brackets (e.g., [ev-1]).\n"
        "2. Do NOT invent, assume, or fabricate any facts not in the evidence list.\n"
        "3. If the evidence does not contain sufficient details to answer, state clearly that the evidence is insufficient.\n"
        "4. Never propose or claim to alter the case status."
    )

    user_prompt = (
        f"Case: '{case_title}' (Current Evaluated Status: {current_status})\n\n"
        f"Verified Case Evidence:\n{evidence_context}\n\n"
        f"User Question: {question}\n\n"
        f"Provide your grounded answer with the list of cited evidence IDs."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    try:
        ans = provider.generate_structured(messages, CopilotAnswer, schema_name="copilot_qa")
        # Ensure cited IDs actually exist in the case
        filtered_ids = [eid for eid in ans.evidence_ids if eid in valid_ids]
        if not filtered_ids and valid_ids:
            # If LLM didn't populate list but mentioned in text
            for vid in valid_ids:
                if vid in ans.answer and vid not in filtered_ids:
                    filtered_ids.append(vid)

        return CopilotAnswer(
            answer=ans.answer,
            evidence_ids=filtered_ids,
            refused=ans.refused,
            refusal_reason=ans.refusal_reason,
        )
    except Exception as e:
        logger.warning("Copilot LLM query failed: %s; falling back to deterministic summary", e)
        # Fallback response
        matched = [
            ev for ev in evidence_items
            if any(w in ev.get("snippet", "").lower() for w in question.lower().split() if len(w) > 3)
        ]
        if not matched and evidence_items:
            matched = [evidence_items[0]]
        e_ids = [m["id"] for m in matched if "id" in m]
        snippets = " ".join(f"[{m['id']}] '{m.get('snippet','')}'" for m in matched)
        return CopilotAnswer(
            answer=f"Based on available verified evidence records: {snippets}. Evaluated case status: {current_status}.",
            evidence_ids=e_ids,
            refused=False,
        )
