# TRACEID — API Specification

## Base URL

`http://localhost:8000/api/v1`

All endpoints require a valid `investigation_id` except case creation. Error responses use a uniform schema.

## Uniform error schema

```json
{
  "error": {
    "code": "CONSENT_REQUIRED",
    "message": "Investigation requires consent before processing",
    "details": {}
  }
}
```

## Endpoints

### Case management

#### POST /investigations
Create a new investigation case.

- **Request**: `multipart/form-data`
  - `title`: string (required)
  - `context`: JSON string — authorized context (name, institution, event, etc.)
  - `image`: file (optional) — consented image, EXIF stripped server-side, max `IMAGE_MAX_SIZE_BYTES`
  - `consent_consenter`: string (required)
  - `consent_scope`: string (required)
- **Response** `201`:
  ```json
  {
    "investigation_id": "uuid",
    "status": "INSUFFICIENT_EVIDENCE",
    "consent_recorded": true,
    "created_at": "ISO8601"
  }
  ```
- **Errors**: `400` missing fields · `403` consent not granted · `413` image too large · `429` rate limited

Consent gate: missing or invalid consent → `403` with audit row (I8).

#### GET /investigations/{id}
Get investigation summary and current status.

- **Response** `200`:
  ```json
  {
    "id": "uuid",
    "title": "string",
    "status": "STRONG_MATCH | POSSIBLE_MATCH | AMBIGUOUS | INSUFFICIENT_EVIDENCE | LIKELY_DIFFERENT",
    "iteration_count": 0,
    "candidate_count": 0,
    "created_at": "ISO8601",
    "updated_at": "ISO8601"
  }
  ```

#### DELETE /investigations/{id}
Delete investigation and all associated data.

- **Response** `204`: no content
- Writes audit row before deletion.

### Pipeline execution

#### POST /investigations/{id}/run
Start or resume the investigation pipeline (async).

- **Response** `202`:
  ```json
  {
    "task_id": "uuid",
    "status": "RUNNING"
  }
  ```
- **Errors**: `403` no consent · `409` already running

#### GET /investigations/{id}/status
Poll pipeline status.

- **Response** `200`:
  ```json
  {
    "task_id": "uuid",
    "pipeline_status": "RUNNING | COMPLETED | FAILED",
    "current_stage": "SOURCE_DISCOVERY | EXTRACTION | ...",
    "iteration": 1,
    "case_status": "INSUFFICIENT_EVIDENCE",
    "updated_at": "ISO8601"
  }
  ```

### Candidates

#### GET /investigations/{id}/candidates
List all candidates with their evidence matrices.

- **Response** `200`:
  ```json
  {
    "candidates": [
      {
        "id": "uuid",
        "name": "string",
        "pair_state": "SAME | POSSIBLY_SAME | DIFFERENT | UNKNOWN",
        "is_primary": true,
        "matrix": {
          "supporting": [{"signal": "...", "tier": "DISCRIMINATING", "evidence_ids": [...], "cluster_id": "..."}],
          "contradicting": [...],
          "unresolved": [...]
        }
      }
    ],
    "runner_up": { "...same schema..." }
  }
  ```
Runner-up is always included when ≥2 candidates exist (I13).

### Evidence

#### GET /investigations/{id}/evidence
List all evidence with source provenance.

- **Response** `200`:
  ```json
  {
    "evidence": [
      {
        "id": "uuid",
        "claim_id": "uuid",
        "source_id": "uuid",
        "snippet": "verbatim text from source",
        "support_level": "SUPPORTING | CONTRADICTING | UNRESOLVED",
        "signal_tier": "DISCRIMINATING | CORROBORATING | WEAK",
        "verification_status": "VERIFIED | UNVERIFIED | FAILED | PENDING",
        "observed_at": "ISO8601"
      }
    ]
  }
  ```

### Graph

#### GET /investigations/{id}/graph
Entity graph for React Flow rendering.

- **Response** `200`:
  ```json
  {
    "nodes": [
      {"id": "uuid", "type": "PERSON | ORGANIZATION | ...", "label": "string", "attributes": {}}
    ],
    "edges": [
      {"id": "uuid", "source": "uuid", "target": "uuid", "relationship": "WORKED_AT | ...", "evidence_ids": []}
    ]
  }
  ```

### Timeline

#### GET /investigations/{id}/timeline
Chronological events with conflict markers.

- **Response** `200`:
  ```json
  {
    "events": [
      {
        "id": "uuid",
        "date": "ISO8601",
        "end_date": "ISO8601 | null",
        "description": "string",
        "claim_id": "uuid",
        "is_impossible": false,
        "conflicts_with": ["uuid"]
      }
    ]
  }
  ```

### Contradictions

#### GET /investigations/{id}/contradictions
All detected contradictions.

- **Response** `200`:
  ```json
  {
    "contradictions": [
      {
        "id": "uuid",
        "kind": "impossible_timeline | different_organization | ...",
        "severity": "HARD | SOFT",
        "claim_ids": ["uuid"],
        "evidence_ids": ["uuid"],
        "explanation": "string | null",
        "explained_away": false
      }
    ]
  }
  ```

### Sources

#### GET /investigations/{id}/sources
Sources with reliability and independence cluster info.

- **Response** `200`:
  ```json
  {
    "sources": [
      {
        "id": "uuid",
        "url": "string",
        "domain": "string",
        "source_type": "INSTITUTIONAL_OFFICIAL | ...",
        "reliability": "HIGH | MEDIUM | LOW",
        "reliability_reason": "string",
        "cluster_id": "uuid",
        "is_origin": true,
        "injection_flags": ["string"],
        "published_at": "ISO8601",
        "retrieved_at": "ISO8601"
      }
    ],
    "clusters": [
      {
        "id": "uuid",
        "origin_source_id": "uuid",
        "member_count": 3,
        "flagged": false
      }
    ]
  }
  ```

### Gaps

#### GET /investigations/{id}/gaps
Investigation gaps — what's missing or unresolved.

- **Response** `200`:
  ```json
  {
    "gaps": [
      {
        "description": "string",
        "category": "missing_source | unresolved_contradiction | weak_only | ...",
        "suggested_action": "string"
      }
    ]
  }
  ```

### Human review

#### POST /investigations/{id}/review
Submit a review action (confirm or reject a claim or candidate).

- **Request**:
  ```json
  {
    "action_type": "CONFIRM | REJECT",
    "target_type": "CLAIM | CANDIDATE",
    "target_id": "uuid",
    "reason": "string (required)"
  }
  ```
- **Response** `201`:
  ```json
  {
    "review_id": "uuid",
    "status_recomputed": true,
    "new_status": "STRONG_MATCH"
  }
  ```
- Review actions are insert-only; evidence is never deleted (I11).

#### GET /investigations/{id}/review
List all review actions.

### Report

#### GET /investigations/{id}/report
Generated investigation report.

- **Response** `200`:
  ```json
  {
    "status": "STRONG_MATCH",
    "status_reasons": ["string"],
    "what_would_change": ["string"],
    "sections": [
      {"title": "string", "text": "string", "evidence_ids": ["uuid"]}
    ],
    "matrix": { "supporting": [...], "contradicting": [...], "unresolved": [...] },
    "llm_narrative_available": true
  }
  ```

### Copilot

#### POST /investigations/{id}/copilot
Ask a question about the investigation evidence.

- **Request**:
  ```json
  {
    "question": "string"
  }
  ```
- **Response** `200`:
  ```json
  {
    "answer": "string",
    "evidence_ids": ["uuid"],
    "refused": false,
    "refusal_reason": null
  }
  ```
- Refuses out-of-scope requests (private data, unsupported claims, collection triggers). Cannot trigger fetches or status changes.
- **Errors**: `429` rate limited

### Health

#### GET /health
Health check (always available, no auth).

- **Response** `200`:
  ```json
  {
    "status": "ok",
    "database": "connected",
    "version": "1.0.0"
  }
  ```

## Tables referenced by this spec

All tables exist in DATA_MODEL.md: `investigations`, `consent_records`, `candidates`, `entities`, `entity_edges`, `sources`, `source_documents`, `claims`, `evidence`, `independence_clusters`, `independence_cluster_members`, `resolution_pairs`, `contradictions`, `timeline_events`, `review_actions`, `audit_log`, `llm_calls`.
