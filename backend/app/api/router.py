"""TRACEID — API Router implementing docs/API_SPEC.md."""

from __future__ import annotations

import asyncio
import json
from typing import Annotated, Any

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.config import Settings
from app.db.events import event_broker
from app.llm.provider import LLMProvider
from app.agents.copilot import ask_copilot
from app.agents.report import generate_dossier_report
from app.orchestrator.engine import store

router = APIRouter(prefix="/api/v1")


class CreateInvestigationRequest(BaseModel):
    title: str
    context: dict[str, Any] = Field(default_factory=dict)
    consent_consenter: str
    consent_scope: str


class ReviewRequest(BaseModel):
    action_type: str  # CONFIRM | REJECT
    target_type: str  # CLAIM | CANDIDATE
    target_id: str
    reason: str


class CopilotRequest(BaseModel):
    question: str


# --- Case Management ---


@router.post("/investigations", status_code=status.HTTP_201_CREATED)
async def create_investigation(
    title: Annotated[str, Form()],
    consent_consenter: Annotated[str, Form()],
    consent_scope: Annotated[str, Form()],
    context: Annotated[str, Form()] = "{}",
    image: Annotated[UploadFile | None, File()] = None,
):
    """Create a new investigation case with mandatory consent verification (I8)."""
    try:
        ctx_parsed = json.loads(context) if isinstance(context, str) else context
    except Exception:
        ctx_parsed = {"raw": context}

    image_bytes = None
    if image:
        image_bytes = await image.read()

    try:
        inv = store.create(
            title=title,
            context=ctx_parsed,
            consent_consenter=consent_consenter,
            consent_scope=consent_scope,
            image_bytes=image_bytes,
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": {
                    "code": "CONSENT_REQUIRED",
                    "message": str(e),
                    "details": {},
                }
            },
        ) from e

    return {
        "investigation_id": inv.id,
        "status": inv.status,
        "consent_recorded": True,
        "created_at": inv.created_at,
    }


@router.get("/investigations")
async def list_investigations():
    """List all active investigations."""
    return [
        {
            "id": inv.id,
            "title": inv.title,
            "status": inv.status,
            "iteration_count": inv.iteration_count,
            "candidate_count": len(inv.candidates),
            "created_at": inv.created_at,
            "updated_at": inv.updated_at,
        }
        for inv in store.investigations.values()
    ]


@router.get("/investigations/{inv_id}")
async def get_investigation(inv_id: str):
    """Get investigation summary and current status."""
    inv = store.get(inv_id)
    if not inv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "NOT_FOUND", "message": "Investigation not found"}},
        )
    return {
        "id": inv.id,
        "title": inv.title,
        "status": inv.status,
        "iteration_count": inv.iteration_count,
        "candidate_count": len(inv.candidates),
        "status_reasons": inv.status_reasons,
        "what_would_change": inv.what_would_change,
        "context": inv.context,
        "image_analysis": inv.image_analysis,
        "has_image": inv.image_bytes is not None,
        "created_at": inv.created_at,
        "updated_at": inv.updated_at,
    }


@router.get("/investigations/{inv_id}/image")
async def get_investigation_image(inv_id: str):
    """Retrieve consented uploaded image."""
    inv = store.get(inv_id)
    if not inv or not inv.image_bytes:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    from fastapi.responses import Response
    mime = "image/png" if inv.image_bytes.startswith(b"\x89PNG") else "image/jpeg"
    return Response(content=inv.image_bytes, media_type=mime)


@router.delete("/investigations/{inv_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_investigation(inv_id: str):
    """Delete investigation and write audit record."""
    if not store.delete(inv_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "NOT_FOUND", "message": "Investigation not found"}},
        )
    return None


# --- Pipeline Execution ---


@router.post("/investigations/{inv_id}/run", status_code=status.HTTP_202_ACCEPTED)
async def run_investigation_pipeline(inv_id: str):
    """Execute the investigation pipeline synchronously.

    The pipeline runs Tavily + SerpApi + Gemini sequentially.
    Total time: 60-120s depending on search depth.
    Use GET /investigations/{inv_id}/status to check completion.
    """
    inv_check = store.get(inv_id)
    if not inv_check:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")
    try:
        inv = store.run_pipeline(inv_id)
        return {
            "task_id": f"task-{inv.id[:8]}",
            "status": inv.pipeline_status,
            "case_status": inv.status,
        }
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e


@router.get("/investigations/{inv_id}/status")
async def get_pipeline_status(inv_id: str):
    """Poll pipeline execution status."""
    inv = store.get(inv_id)
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")
    return {
        "task_id": f"task-{inv.id[:8]}",
        "pipeline_status": inv.pipeline_status,
        "current_stage": inv.pipeline_stage,
        "iteration": inv.iteration_count,
        "case_status": inv.status,
        "updated_at": inv.updated_at,
    }


@router.get("/investigations/{inv_id}/stream")
async def stream_investigation_events(inv_id: str):
    """Real-time Server-Sent Events (SSE) stream for live investigation updates."""
    inv = store.get(inv_id)
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")

    async def event_generator():
        q = event_broker.subscribe(inv_id)
        # Yield initial connection snapshot
        init_payload = {
            "type": "INITIAL_SNAPSHOT",
            "status": inv.status,
            "pipeline_stage": inv.pipeline_stage,
            "pipeline_status": inv.pipeline_status,
            "candidate_count": len(inv.candidates),
            "updated_at": inv.updated_at,
        }
        yield f"data: {json.dumps(init_payload)}\n\n"
        try:
            while True:
                try:
                    event_data = await asyncio.wait_for(q.get(), timeout=25.0)
                    yield f"data: {json.dumps(event_data)}\n\n"
                except asyncio.TimeoutError:
                    # Keep-alive heartbeat comment
                    yield ": ping\n\n"
        finally:
            event_broker.unsubscribe(inv_id, q)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# --- Candidates ---


@router.get("/investigations/{inv_id}/candidates")
async def get_candidates(inv_id: str):
    """List all candidates with their evidence matrices, always returning runner-up (I13)."""
    inv = store.get(inv_id)
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")
    return {
        "candidates": [
            {
                "id": c.id,
                "name": c.name,
                "pair_state": c.pair_state,
                "is_primary": c.is_primary,
                "matrix": c.matrix,
                "primary_organization": getattr(c, "primary_organization", ""),
                "primary_role": getattr(c, "primary_role", ""),
                "bio_summary": getattr(c, "bio_summary", ""),
                "relevance_reasons": getattr(c, "relevance_reasons", []),
            }
            for c in inv.candidates
        ],
        "runner_up": (
            {
                "id": inv.runner_up.id,
                "name": inv.runner_up.name,
                "pair_state": inv.runner_up.pair_state,
                "is_primary": inv.runner_up.is_primary,
                "matrix": inv.runner_up.matrix,
                "primary_organization": getattr(inv.runner_up, "primary_organization", ""),
                "primary_role": getattr(inv.runner_up, "primary_role", ""),
                "bio_summary": getattr(inv.runner_up, "bio_summary", ""),
                "relevance_reasons": getattr(inv.runner_up, "relevance_reasons", []),
            }
            if inv.runner_up
            else None
        ),
    }


# --- Evidence ---


@router.get("/investigations/{inv_id}/evidence")
async def get_evidence(inv_id: str):
    """List all evidence items with source provenance."""
    inv = store.get(inv_id)
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")
    return {
        "evidence": [
            {
                "id": e.id,
                "claim_id": e.claim_id,
                "source_id": e.source_id,
                "snippet": e.snippet,
                "support_level": e.support_level,
                "signal_tier": e.signal_tier,
                "verification_status": e.verification_status,
                "observed_at": e.observed_at,
            }
            for e in inv.evidence
        ]
    }


# --- Graph ---


@router.get("/investigations/{inv_id}/graph")
async def get_graph(inv_id: str):
    """Entity graph for React Flow rendering."""
    inv = store.get(inv_id)
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")
    return {
        "nodes": [
            {
                "id": n.id,
                "type": n.type,
                "label": n.label,
                "attributes": n.attributes,
            }
            for n in inv.graph_nodes
        ],
        "edges": [
            {
                "id": e.id,
                "source": e.source,
                "target": e.target,
                "relationship": e.relationship,
                "evidence_ids": e.evidence_ids,
            }
            for e in inv.graph_edges
        ],
    }


# --- Timeline ---


@router.get("/investigations/{inv_id}/timeline")
async def get_timeline(inv_id: str):
    """Chronological events with conflict markers."""
    inv = store.get(inv_id)
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")
    return {
        "events": [
            {
                "id": ev.id,
                "date": ev.date,
                "end_date": ev.end_date,
                "description": ev.description,
                "claim_id": ev.claim_id,
                "is_impossible": ev.is_impossible,
                "conflicts_with": ev.conflicts_with,
            }
            for ev in inv.timeline_events
        ]
    }


# --- Contradictions ---


@router.get("/investigations/{inv_id}/contradictions")
async def get_contradictions(inv_id: str):
    """All detected contradictions."""
    inv = store.get(inv_id)
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")
    return {
        "contradictions": [
            {
                "id": c.id,
                "kind": c.kind,
                "severity": c.severity,
                "claim_ids": c.claim_ids,
                "evidence_ids": c.evidence_ids,
                "explanation": c.explanation,
                "explained_away": c.explained_away,
            }
            for c in inv.contradictions
        ]
    }


# --- Sources ---


@router.get("/investigations/{inv_id}/sources")
async def get_sources(inv_id: str):
    """Sources with reliability and independence cluster info."""
    inv = store.get(inv_id)
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")
    return {
        "sources": [
            {
                "id": s.id,
                "url": s.url,
                "domain": s.domain,
                "source_type": s.source_type,
                "reliability": s.reliability,
                "reliability_reason": s.reliability_reason,
                "cluster_id": s.cluster_id,
                "is_origin": s.is_origin,
                "injection_flags": s.injection_flags,
                "published_at": s.published_at,
                "retrieved_at": s.retrieved_at,
            }
            for s in inv.sources
        ],
        "clusters": [
            {
                "id": cl.id,
                "origin_source_id": cl.origin_source_id,
                "member_count": cl.member_count,
                "flagged": cl.flagged,
            }
            for cl in inv.clusters
        ],
    }


# --- Gaps ---


@router.get("/investigations/{inv_id}/gaps")
async def get_gaps(inv_id: str):
    """Investigation gaps — missing or unresolved items."""
    inv = store.get(inv_id)
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")
    return {
        "gaps": [
            {
                "description": g.description,
                "category": g.category,
                "suggested_action": g.suggested_action,
            }
            for g in inv.gaps
        ]
    }


# --- Human Review ---


@router.post("/investigations/{inv_id}/review", status_code=status.HTTP_201_CREATED)
async def submit_review(inv_id: str, body: ReviewRequest):
    """Submit a review action. Insert-only, never deletes evidence (I11)."""
    if not body.reason.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Review reason is mandatory.")

    try:
        action, new_status = store.add_review_action(
            inv_id=inv_id,
            action_type=body.action_type,
            target_type=body.target_type,
            target_id=body.target_id,
            reason=body.reason,
        )
        return {
            "review_id": action.id,
            "status_recomputed": True,
            "new_status": new_status,
        }
    except KeyError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found"
        ) from e


@router.get("/investigations/{inv_id}/review")
async def list_reviews(inv_id: str):
    """List all human review actions for the investigation."""
    inv = store.get(inv_id)
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")
    return {
        "reviews": [
            {
                "id": r.id,
                "action_type": r.action_type,
                "target_type": r.target_type,
                "target_id": r.target_id,
                "reason": r.reason,
                "created_at": r.created_at,
            }
            for r in inv.review_actions
        ]
    }


# --- Report ---


@router.get("/investigations/{inv_id}/report")
async def get_report(inv_id: str):
    """Generated investigation dossier and evidence matrix."""
    inv = store.get(inv_id)
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")

    matrix_data: dict[str, list[Any]] = {"supporting": [], "contradicting": [], "unresolved": []}
    if inv.candidates:
        matrix_data = inv.candidates[0].matrix

    settings = Settings()
    provider = LLMProvider(
        provider=settings.LLM_PROVIDER,
        api_key=settings.LLM_API_KEY,
        model=settings.LLM_MODEL,
        timeout=settings.LLM_TIMEOUT_SECONDS,
        max_retries=settings.LLM_MAX_RETRIES,
    )
    evidence_dicts = [
        {
            "id": e.id,
            "snippet": e.snippet,
            "source_id": e.source_id,
            "signal_tier": e.signal_tier,
        }
        for e in inv.evidence
    ]
    primary_cand = inv.candidates[0] if inv.candidates else None
    cand_bio = getattr(primary_cand, "bio_summary", "") if primary_cand else ""
    sections = generate_dossier_report(
        provider=provider,
        case_title=inv.title,
        status_str=inv.status,
        status_reasons=inv.status_reasons,
        what_would_change=inv.what_would_change,
        evidence_items=evidence_dicts,
        cluster_count=len(inv.clusters),
        source_count=len(inv.sources),
        candidate_bio=cand_bio,
    )

    return {
        "status": inv.status,
        "status_reasons": inv.status_reasons,
        "what_would_change": inv.what_would_change,
        "sections": sections,
        "matrix": matrix_data,
        "llm_narrative_available": True,
    }


# --- Copilot ---


@router.post("/investigations/{inv_id}/copilot")
async def copilot_query(inv_id: str, body: CopilotRequest):
    """Grounded evidence assistant with strict citations and refusal logic."""
    inv = store.get(inv_id)
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")

    settings = Settings()
    provider = LLMProvider(
        provider=settings.LLM_PROVIDER,
        api_key=settings.LLM_API_KEY,
        model=settings.LLM_MODEL,
        timeout=settings.LLM_TIMEOUT_SECONDS,
        max_retries=settings.LLM_MAX_RETRIES,
    )
    evidence_dicts = [
        {
            "id": e.id,
            "snippet": e.snippet,
            "source_id": e.source_id,
            "signal_tier": e.signal_tier,
            "support_level": e.support_level,
        }
        for e in inv.evidence
    ]

    ans = ask_copilot(
        provider=provider,
        question=body.question,
        evidence_items=evidence_dicts,
        case_title=inv.title,
        current_status=inv.status,
    )

    return {
        "answer": ans.answer,
        "evidence_ids": ans.evidence_ids,
        "refused": ans.refused,
        "refusal_reason": ans.refusal_reason,
    }


# --- Demo Scenarios Helper ---


@router.get("/demo/scenarios")
async def get_demo_scenarios():
    """List predefined golden demo scenarios A-E."""
    return [
        {
            "id": "scenario-a-strong-match",
            "name": "Scenario A: Strong Match (Dr. Aarav Mehta)",
            "expected_status": "STRONG_MATCH",
            "description": "Multi-cluster verified academic profile with mutual discriminating links.",
        },
        {
            "id": "scenario-b-ambiguous-candidates",
            "name": "Scenario B: Ambiguous Candidates (Priya Nair)",
            "expected_status": "AMBIGUOUS",
            "description": "Two distinct plausible professionals with no separating evidence.",
        },
        {
            "id": "scenario-c-insufficient-evidence",
            "name": "Scenario C: No Footprint (Marcus Vance)",
            "expected_status": "INSUFFICIENT_EVIDENCE",
            "description": "Sparse footprint with only weak signals; zero hallucination.",
        },
        {
            "id": "scenario-d-prompt-injection",
            "name": "Scenario D: Adversarial Injection Attack",
            "expected_status": "INSUFFICIENT_EVIDENCE",
            "description": "Malicious source attempts prompt injection; intercepted and sanitized.",
        },
        {
            "id": "scenario-e-hard-contradiction",
            "name": "Scenario E: Hard Contradiction (Sarah Jenkins)",
            "expected_status": "LIKELY_DIFFERENT",
            "description": "Impossible concurrent residency dates mandate LIKELY_DIFFERENT.",
        },
    ]


# ---------------------------------------------------------------------------
# SerpApi — Enhanced Web & Social Profile Search
# ---------------------------------------------------------------------------

from app.adapters.serpapi_search import build_serpapi_adapter


class SerpApiWebRequest(BaseModel):
    query: str
    max_results: int = Field(default=10, ge=1, le=20)


class SerpApiSocialRequest(BaseModel):
    name: str
    platform: str
    extra_terms: str = ""


class SerpApiAllSocialRequest(BaseModel):
    name: str
    extra_terms: str = ""
    platforms: list[str] | None = None


@router.get("/serpapi/status")
async def serpapi_status():
    """Return SerpApi configuration status.

    Safe to call from the frontend — never exposes the API key.
    Use this to check whether SerpApi search features are available.
    """
    adapter = build_serpapi_adapter()
    s = adapter.status()
    return {
        "configured": s.configured,
        "message": s.message,
        "platforms_supported": s.platforms_supported,
    }


@router.post("/serpapi/web")
async def serpapi_web_search(req: SerpApiWebRequest):
    """Run a general SerpApi web search.

    Returns organic web results. Returns empty list with a warning if
    SERPAPI_API_KEY is not configured — does NOT fabricate results.

    Example:
        POST /api/v1/serpapi/web
        {"query": "John Doe cybersecurity researcher", "max_results": 10}
    """
    adapter = build_serpapi_adapter()
    if not adapter.status().configured:
        return {
            "configured": False,
            "message": (
                "SerpApi is not configured. "
                "Add your SERPAPI_API_KEY to the .env file to enable web search."
            ),
            "results": [],
        }

    results = adapter.search_web(query=req.query, max_results=req.max_results)
    return {
        "configured": True,
        "query": req.query,
        "result_count": len(results),
        "results": [
            {
                "url": r.url,
                "domain": r.domain,
                "title": r.title,
                "snippet": r.snippet,
                "position": r.position,
                "retrieved_at": r.retrieved_at,
            }
            for r in results
        ],
    }


@router.post("/serpapi/social")
async def serpapi_social_search(req: SerpApiSocialRequest):
    """Search for a person's profile on a specific social platform.

    Supported platforms: instagram, youtube, linkedin, github,
                         twitter, facebook, tiktok, reddit

    Returns empty list if not configured or no results found.
    Never fabricates profile URLs or usernames.

    Example:
        POST /api/v1/serpapi/social
        {"name": "John Doe", "platform": "linkedin", "extra_terms": "engineer"}
    """
    adapter = build_serpapi_adapter()
    if not adapter.status().configured:
        return {
            "configured": False,
            "message": (
                "SerpApi is not configured. "
                "Add your SERPAPI_API_KEY to the .env file to enable social search."
            ),
            "platform": req.platform,
            "profiles": [],
        }

    profiles = adapter.search_social_profile(
        name=req.name,
        platform=req.platform,  # type: ignore[arg-type]
        extra_terms=req.extra_terms,
    )
    return {
        "configured": True,
        "name": req.name,
        "platform": req.platform,
        "profile_count": len(profiles),
        "profiles": [
            {
                "platform": p.platform,
                "url": p.url,
                "domain": p.domain,
                "title": p.title,
                "snippet": p.snippet,
                "retrieved_at": p.retrieved_at,
            }
            for p in profiles
        ],
    }


@router.post("/serpapi/social/all")
async def serpapi_all_social_search(req: SerpApiAllSocialRequest):
    """Scan all (or selected) social platforms for a person's profiles.

    Returns a dict of platform → profile list.
    Platforms with no results return an empty list, not omitted.
    Never fabricates results.

    Example:
        POST /api/v1/serpapi/social/all
        {"name": "John Doe", "extra_terms": "software engineer India"}
    """
    adapter = build_serpapi_adapter()
    if not adapter.status().configured:
        from app.adapters.serpapi_search import SOCIAL_PLATFORMS
        return {
            "configured": False,
            "message": (
                "SerpApi is not configured. "
                "Add your SERPAPI_API_KEY to the .env file to enable social search."
            ),
            "name": req.name,
            "results": {p: [] for p in (req.platforms or list(SOCIAL_PLATFORMS.keys()))},
        }

    raw_results = adapter.search_all_social_profiles(
        name=req.name,
        extra_terms=req.extra_terms,
        platforms=req.platforms,  # type: ignore[arg-type]
    )

    serialised = {
        platform: [
            {
                "platform": p.platform,
                "url": p.url,
                "domain": p.domain,
                "title": p.title,
                "snippet": p.snippet,
                "retrieved_at": p.retrieved_at,
            }
            for p in profiles
        ]
        for platform, profiles in raw_results.items()
    }

    total = sum(len(v) for v in serialised.values())
    return {
        "configured": True,
        "name": req.name,
        "total_profiles_found": total,
        "results": serialised,
    }
