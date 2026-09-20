"""Real-Time Database Repository for TRACEID.

Handles persistence, retrieval, and atomic transactions between Investigation dataclasses
and the real-time SQLite database.
"""

from __future__ import annotations

import json
import logging
from dataclasses import asdict
from typing import Any

from app.db.database import get_connection, init_db
from app.security.consent import ConsentRecord

logger = logging.getLogger("traceid.db.repository")


def _to_json(val: Any) -> str:
    """Serialize value to JSON safely."""
    return json.dumps(val, default=str)


def _from_json(val: str | None, default: Any = None) -> Any:
    """Deserialize value from JSON safely."""
    if not val:
        return default
    try:
        return json.loads(val)
    except Exception:
        return default


def save_investigation(
    inv: Any,  # Investigation dataclass
    db_path: str | None = None,
) -> None:
    """Persist an investigation and all its entities to the real-time database."""
    init_db(db_path)
    with get_connection(db_path) as conn:
        with conn:
            # 1. Upsert investigations table
            consent_dict = asdict(inv.consent) if inv.consent else None
            conn.execute(
                """
                INSERT INTO investigations (
                    id, title, status, status_reasons, what_would_change,
                    iteration_count, candidate_count, context, image_analysis,
                    consent, pipeline_stage, pipeline_status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    title = excluded.title,
                    status = excluded.status,
                    status_reasons = excluded.status_reasons,
                    what_would_change = excluded.what_would_change,
                    iteration_count = excluded.iteration_count,
                    candidate_count = excluded.candidate_count,
                    context = excluded.context,
                    image_analysis = excluded.image_analysis,
                    consent = excluded.consent,
                    pipeline_stage = excluded.pipeline_stage,
                    pipeline_status = excluded.pipeline_status,
                    updated_at = excluded.updated_at;
                """,
                (
                    inv.id,
                    inv.title,
                    inv.status,
                    _to_json(inv.status_reasons),
                    _to_json(inv.what_would_change),
                    inv.iteration_count,
                    len(inv.candidates),
                    _to_json(inv.context),
                    _to_json(inv.image_analysis),
                    _to_json(consent_dict),
                    inv.pipeline_stage,
                    inv.pipeline_status,
                    inv.created_at,
                    inv.updated_at,
                ),
            )

            # 2. Upsert image bytes if present
            if inv.image_bytes:
                mime = "image/png" if inv.image_bytes.startswith(b"\x89PNG") else "image/jpeg"
                conn.execute(
                    """
                    INSERT INTO investigation_images (investigation_id, image_bytes, mime_type)
                    VALUES (?, ?, ?)
                    ON CONFLICT(investigation_id) DO UPDATE SET
                        image_bytes = excluded.image_bytes,
                        mime_type = excluded.mime_type;
                    """,
                    (inv.id, inv.image_bytes, mime),
                )

            # 3. Upsert investigation entities
            candidates_json = _to_json([asdict(c) for c in inv.candidates])
            runner_up_json = _to_json(asdict(inv.runner_up)) if inv.runner_up else None
            sources_json = _to_json([asdict(s) for s in inv.sources])
            clusters_json = _to_json([asdict(cl) for cl in inv.clusters])
            evidence_json = _to_json([asdict(e) for e in inv.evidence])
            nodes_json = _to_json([asdict(n) for n in inv.graph_nodes])
            edges_json = _to_json([asdict(e) for e in inv.graph_edges])
            timeline_json = _to_json([asdict(t) for t in inv.timeline_events])
            contradictions_json = _to_json([asdict(ct) for ct in inv.contradictions])
            gaps_json = _to_json([asdict(g) for g in inv.gaps])

            conn.execute(
                """
                INSERT INTO investigation_entities (
                    investigation_id, candidates, runner_up, sources, clusters,
                    evidence, graph_nodes, graph_edges, timeline_events,
                    contradictions, gaps
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(investigation_id) DO UPDATE SET
                    candidates = excluded.candidates,
                    runner_up = excluded.runner_up,
                    sources = excluded.sources,
                    clusters = excluded.clusters,
                    evidence = excluded.evidence,
                    graph_nodes = excluded.graph_nodes,
                    graph_edges = excluded.graph_edges,
                    timeline_events = excluded.timeline_events,
                    contradictions = excluded.contradictions,
                    gaps = excluded.gaps;
                """,
                (
                    inv.id,
                    candidates_json,
                    runner_up_json,
                    sources_json,
                    clusters_json,
                    evidence_json,
                    nodes_json,
                    edges_json,
                    timeline_json,
                    contradictions_json,
                    gaps_json,
                ),
            )

            # 4. Upsert review actions
            for action in inv.review_actions:
                conn.execute(
                    """
                    INSERT INTO review_actions (
                        id, investigation_id, action_type, target_type, target_id, reason, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        reason = excluded.reason;
                    """,
                    (
                        action.id,
                        inv.id,
                        action.action_type,
                        action.target_type,
                        action.target_id,
                        action.reason,
                        action.created_at,
                    ),
                )

            # 5. Insert audit log entries (only unrecorded ones)
            existing_audit_count = conn.execute(
                "SELECT COUNT(*) FROM audit_log WHERE investigation_id = ?;", (inv.id,)
            ).fetchone()[0]
            new_entries = inv.audit_trail[existing_audit_count:]
            for entry in new_entries:
                conn.execute(
                    """
                    INSERT INTO audit_log (investigation_id, action, actor, timestamp, details)
                    VALUES (?, ?, ?, ?, ?);
                    """,
                    (
                        inv.id,
                        entry.get("action", "UNKNOWN"),
                        entry.get("actor", "system"),
                        entry.get("timestamp", inv.updated_at),
                        _to_json(entry.get("details", {})),
                    ),
                )


def get_investigation(
    inv_id: str,
    investigation_class: Any,
    types_map: dict[str, Any],
    db_path: str | None = None,
) -> Any | None:
    """Retrieve an investigation by ID and hydrate full dataclass hierarchies."""
    init_db(db_path)
    with get_connection(db_path) as conn:
        inv_row = conn.execute(
            "SELECT * FROM investigations WHERE id = ?;", (inv_id,)
        ).fetchone()
        if not inv_row:
            return None

        entities_row = conn.execute(
            "SELECT * FROM investigation_entities WHERE investigation_id = ?;", (inv_id,)
        ).fetchone()

        image_row = conn.execute(
            "SELECT image_bytes FROM investigation_images WHERE investigation_id = ?;", (inv_id,)
        ).fetchone()

        review_rows = conn.execute(
            "SELECT * FROM review_actions WHERE investigation_id = ? ORDER BY created_at ASC;", (inv_id,)
        ).fetchall()

        audit_rows = conn.execute(
            "SELECT * FROM audit_log WHERE investigation_id = ? ORDER BY id ASC;", (inv_id,)
        ).fetchall()

    # Hydrate nested dataclasses
    candidate_cls = types_map["CandidateItem"]
    source_cls = types_map["SourceItem"]
    cluster_cls = types_map["ClusterItem"]
    evidence_cls = types_map["EvidenceItem"]
    node_cls = types_map["GraphNode"]
    edge_cls = types_map["GraphEdge"]
    timeline_cls = types_map["TimelineEventItem"]
    contradiction_cls = types_map["ContradictionItem"]
    gap_cls = types_map["GapItem"]
    review_cls = types_map["ReviewActionItem"]

    # Entities
    candidates: list[Any] = []
    runner_up: Any = None
    sources: list[Any] = []
    clusters: list[Any] = []
    evidence: list[Any] = []
    nodes: list[Any] = []
    edges: list[Any] = []
    timeline: list[Any] = []
    contradictions: list[Any] = []
    gaps: list[Any] = []

    if entities_row:
        for c in _from_json(entities_row["candidates"], []):
            candidates.append(candidate_cls(**c))
        runner_up_data = _from_json(entities_row["runner_up"])
        if runner_up_data:
            runner_up = candidate_cls(**runner_up_data)
        for s in _from_json(entities_row["sources"], []):
            sources.append(source_cls(**s))
        for cl in _from_json(entities_row["clusters"], []):
            clusters.append(cluster_cls(**cl))
        for e in _from_json(entities_row["evidence"], []):
            evidence.append(evidence_cls(**e))
        for n in _from_json(entities_row["graph_nodes"], []):
            nodes.append(node_cls(**n))
        for ed in _from_json(entities_row["graph_edges"], []):
            edges.append(edge_cls(**ed))
        for t in _from_json(entities_row["timeline_events"], []):
            timeline.append(timeline_cls(**t))
        for ct in _from_json(entities_row["contradictions"], []):
            contradictions.append(contradiction_cls(**ct))
        for g in _from_json(entities_row["gaps"], []):
            gaps.append(gap_cls(**g))

    # Reviews
    review_actions = [
        review_cls(
            id=r["id"],
            action_type=r["action_type"],
            target_type=r["target_type"],
            target_id=r["target_id"],
            reason=r["reason"],
            created_at=r["created_at"],
        )
        for r in review_rows
    ]

    # Audit trail
    audit_trail = [
        {
            "action": a["action"],
            "actor": a["actor"],
            "timestamp": a["timestamp"],
            "details": _from_json(a["details"], {}),
        }
        for a in audit_rows
    ]

    # Consent
    consent_data = _from_json(inv_row["consent"])
    consent = ConsentRecord(**consent_data) if consent_data else None

    # Image bytes
    image_bytes = image_row["image_bytes"] if image_row else None

    return investigation_class(
        id=inv_row["id"],
        title=inv_row["title"],
        context=_from_json(inv_row["context"], {}),
        status=inv_row["status"],
        status_reasons=_from_json(inv_row["status_reasons"], []),
        what_would_change=_from_json(inv_row["what_would_change"], []),
        iteration_count=inv_row["iteration_count"],
        candidate_count=inv_row["candidate_count"],
        created_at=inv_row["created_at"],
        updated_at=inv_row["updated_at"],
        consent=consent,
        sources=sources,
        clusters=clusters,
        evidence=evidence,
        candidates=candidates,
        runner_up=runner_up,
        graph_nodes=nodes,
        graph_edges=edges,
        timeline_events=timeline,
        contradictions=contradictions,
        gaps=gaps,
        review_actions=review_actions,
        audit_trail=audit_trail,
        pipeline_stage=inv_row["pipeline_stage"],
        pipeline_status=inv_row["pipeline_status"],
        image_bytes=image_bytes,
        image_analysis=_from_json(inv_row["image_analysis"]),
    )


def list_investigation_summaries(db_path: str | None = None) -> list[dict[str, Any]]:
    """List investigation summaries sorted by creation time."""
    init_db(db_path)
    with get_connection(db_path) as conn:
        rows = conn.execute(
            """
            SELECT id, title, status, iteration_count, candidate_count, created_at, updated_at
            FROM investigations
            ORDER BY created_at DESC;
            """
        ).fetchall()
        return [dict(r) for r in rows]


def list_all_investigations(
    investigation_class: Any,
    types_map: dict[str, Any],
    db_path: str | None = None,
) -> list[Any]:
    """Retrieve all full investigations ordered by created_at DESC."""
    init_db(db_path)
    with get_connection(db_path) as conn:
        rows = conn.execute("SELECT id FROM investigations ORDER BY created_at DESC;").fetchall()
        ids = [r["id"] for r in rows]

    results = []
    for inv_id in ids:
        inv = get_investigation(inv_id, investigation_class, types_map, db_path)
        if inv:
            results.append(inv)
    return results


def delete_investigation(inv_id: str, db_path: str | None = None) -> bool:
    """Delete an investigation from the database."""
    init_db(db_path)
    with get_connection(db_path) as conn:
        with conn:
            cursor = conn.execute("DELETE FROM investigations WHERE id = ?;", (inv_id,))
            return cursor.rowcount > 0


def count_investigations(db_path: str | None = None) -> int:
    """Return total number of investigations in the database."""
    init_db(db_path)
    with get_connection(db_path) as conn:
        return conn.execute("SELECT COUNT(*) FROM investigations;").fetchone()[0]
