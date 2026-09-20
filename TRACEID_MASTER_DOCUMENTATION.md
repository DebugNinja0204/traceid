# TRACEID — Evidence-Based Digital Identity Intelligence
## Consolidated Master System Documentation & Specification

> **Positioning Statement**: An evidence-first, explainable, multi-agent digital identity intelligence platform built for **NEURAX Hackathon 3.0 (Domain 3: AI in Cybersecurity)**.

---

## 1. Executive Summary & Problem Understanding

### 1.1 The Challenge
Naïve digital identity discovery fails because real-world online data is adversarial, fragmented, and ambiguous:
- **False Matches & Namesakes**: Common names produce multiple plausible candidates with overlapping metadata but no definitive separating link.
- **Synthesized & Copied Content**: Article syndication, scrapers, and content mirrors create the illusion of multiple independent confirmations for a single unverified claim.
- **Poisoned Sources**: Malicious or backdated profiles and prompt injection attacks attempt to trick automated OSINT crawlers into executing commands or fabricating identities.
- **Privacy Harms**: Over-confident automated identification damages innocent individuals. Unsubstantiated matching creates catastrophic real-world risk.

### 1.2 Core Objective & Principle
TRACEID analyzes an organizer-provided, consented image and limited authorized context to discover, correlate, and verify publicly available information associated with an identified person.

**Core Invariant**: TRACEID **never fabricates an identity** at any cost. It determines whether authorized public evidence is sufficient to establish a likely digital identity. **INSUFFICIENT EVIDENCE is a first-class, intentional system outcome.**

---

## 2. Locked Architectural Decisions (D1 – D10)

| Decision ID | Area | Locked Rule & Architecture |
|---|---|---|
| **D1** | **System Vocabulary** | **Pair States** (Entity Resolution): `SAME` · `POSSIBLY_SAME` · `DIFFERENT` · `UNKNOWN`.<br/>**Case Statuses** (Deterministic Verdict): `STRONG MATCH` · `POSSIBLE MATCH` · `AMBIGUOUS` · `INSUFFICIENT EVIDENCE` · `LIKELY DIFFERENT`. |
| **D2** | **Image Role** | Consented image is strictly for OCR visible-context extraction (badges, event text, logos) and reference photo comparison. **No open-web face search**. Face similarity is OFF by default, weak signal only, never sufficient alone. EXIF stripped on upload; image retained only for case lifetime. |
| **D3** | **Single Database** | PostgreSQL 16 (+ pgvector if embeddings used). Entity-relationship graph represented as edge tables (`entity_edges`) in PostgreSQL with recursive CTE queries. (No Neo4j in MVP; Neo4j listed in roadmap). |
| **D4** | **Looped Pipeline** | Bounded iterative loop: `Discover` → `Extract` → `Resolve` → `Contradiction Search` → (if gaps remain, re-discover up to `MAX_ITERATIONS=3`) → `Finalize`. |
| **D5** | **LLM vs. Deterministic Split** | LLMs are restricted strictly to: (1) Query planning suggestions, (2) Claim extraction from text, (3) Candidate contradiction proposals, (4) Narrative report synthesis, (5) Copilot Q&A.<br/>**Deterministic Code** computes: source reliability, source independence clustering, resolution scoring, contradiction verification, timeline ordering, and the **FINAL CASE STATUS**. An LLM never sets or overrides a status. |
| **D6** | **Data Boundaries & Sandbox** | Organizer-approved sources only. Web content is untrusted DATA. Live web adapter disabled by default. Demo runs in offline recorded/replay mode over synthetic sandbox corpus. |
| **D7** | **Evidence Matrix (No Single %)** | No fake mathematical certainty or single confidence percentage. Output features an interpretable matrix: Supporting / Contradicting / Unresolved signals grouped by Signal Tier, Reliability Tier, and Independence Cluster. |
| **D8** | **Specialist Agent Mapping** | 8 virtual functional agents map to code modules: Identity Investigator (Orchestrator), Profile Discovery (Adapters), Entity Resolution (Scorer), Evidence Verification (Sanitizer + Verification), Contradiction Search (Rules Engine), Timeline (Deterministic Sorter), Report (Template + LLM narrative), Copilot (Read-only cited Q&A). |
| **D9** | **Source Independence Algorithm** | Layered conservative derivation detection: (1) Same owner/domain = 1 cluster, (2) Near-duplicate text (MinHash/shingling > 0.85) = derived, (3) Attribution/"via" links = derived, (4) Syndication pattern matching. Independence cluster = connected component of derivation edges. **Count CLUSTERS, never URLs.** Uncertain derivation → conservative merge. |
| **D10** | **Prompt Injection Defense** | Input text wrapped in data blocks and sanitized (script/hidden text stripping). Extracted snippets MUST exist verbatim (normalized) in the raw stored page. Content-derived text NEVER reaches tool selection or status execution logic. |

---

## 3. System Architecture & Component Design

```mermaid
graph TD
    UI[React + TS + React Flow Workspace] -->|REST API| GW[FastAPI Gateway]
    GW --> CG[Consent Gate Validator]
    CG --> AL[Approved Domain Allowlist]
    AL --> ORCH[Orchestrator Engine]
    
    subgraph LLM Layer [LLM-Assisted Processing - Non-Decision]
        ORCH --> LLM_EXT[Evidence & Claim Extractor]
        ORCH --> LLM_REP[Report Narrative Synthesizer]
        ORCH --> LLM_COP[Copilot Q&A Adapter]
    end
    
    subgraph Deterministic Core [Deterministic Core - Rules & Audits]
        ORCH --> DET_REL[Source Reliability Scorer]
        ORCH --> DET_IND[Source Independence Clusterer]
        ORCH --> DET_RES[Entity Resolution Engine]
        ORCH --> DET_CON[Contradiction Verification Engine]
        ORCH --> DET_TL[Timeline Conflict Analyzer]
        ORCH --> DET_STAT[Deterministic Status Engine]
    end
    
    subgraph Storage [Persistence Layer]
        DET_STAT --> PG[(PostgreSQL 16 + pgvector)]
        DET_IND --> PG
        LLM_EXT --> PG
    end
    
    subgraph Data Adapters [Content Ingestion]
        ORCH --> ADP_SAND[Sandbox Synthetic Corpus]
        ORCH --> ADP_LIVE[Live SerpApi / Web Adapter - Disabled Default]
        ADP_SAND --> SAN[Sanitizer & Stripper]
        ADP_LIVE --> SAN
    end
```

### Pipeline Flow Stages
1. **Input & Consent**: Receives context, consented image, consenter signature, scope.
2. **Candidate Generation**: Extracts initial entities and context queries.
3. **Source Discovery**: Fetches authorized synthetic corpus pages or approved web links.
4. **Evidence Extraction**: Sanitizes text; LLM extracts structured claims; system verifies verbatim presence in source document.
5. **Entity Resolution**: Computes pair states (`SAME`, `POSSIBLY_SAME`, `DIFFERENT`, `UNKNOWN`).
6. **Source Reliability & Independence**: Assigns reliability tiers (`HIGH`, `MEDIUM`, `LOW`); runs MinHash/shingling clustering.
7. **Contradiction Search**: Executes deterministic timeline and attribute conflict checks over candidate claims.
8. **Gap Analysis Loop**: If ambiguity or missing discriminating evidence exists and iterations < `MAX_ITERATIONS`, formulates sub-queries and repeats discovery.
9. **Status Verdict**: `backend/app/core/status.py` computes deterministic case status.

---

## 4. PostgreSQL Database Schema (Data Model)

```sql
-- Enums
CREATE TYPE pair_state AS ENUM ('SAME', 'POSSIBLY_SAME', 'DIFFERENT', 'UNKNOWN');
CREATE TYPE case_status AS ENUM ('STRONG_MATCH', 'POSSIBLE_MATCH', 'AMBIGUOUS', 'INSUFFICIENT_EVIDENCE', 'LIKELY_DIFFERENT');
CREATE TYPE signal_tier AS ENUM ('DISCRIMINATING', 'CORROBORATING', 'WEAK');
CREATE TYPE reliability_tier AS ENUM ('HIGH', 'MEDIUM', 'LOW');
CREATE TYPE support_level AS ENUM ('SUPPORTING', 'CONTRADICTING', 'UNRESOLVED');
CREATE TYPE verification_status AS ENUM ('VERIFIED', 'UNVERIFIED', 'FAILED', 'PENDING');
CREATE TYPE contradiction_severity AS ENUM ('HARD', 'SOFT');
CREATE TYPE entity_type AS ENUM (
    'PERSON', 'ACCOUNT', 'USERNAME', 'ORGANIZATION', 'COMPANY',
    'EDUCATIONAL_INSTITUTION', 'EVENT', 'PROJECT', 'PRODUCT',
    'PUBLICATION', 'PATENT', 'WEBSITE', 'DOMAIN', 'LOCATION',
    'SOURCE', 'CLAIM'
);
CREATE TYPE relationship_type AS ENUM (
    'WORKED_AT', 'STUDIED_AT', 'CREATED', 'AUTHORED', 'PARTICIPATED_IN',
    'SPOKE_AT', 'FOUNDED', 'PUBLISHED', 'CONTRIBUTED_TO', 'LINKED_TO',
    'MENTIONED_BY', 'ASSOCIATED_WITH', 'POSSIBLY_SAME_AS', 'CONFLICTS_WITH'
);

-- Core Tables
CREATE TABLE investigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    status case_status DEFAULT 'INSUFFICIENT_EVIDENCE',
    context JSONB NOT NULL DEFAULT '{}',
    image_path TEXT,
    iteration_count INT DEFAULT 0,
    max_iterations INT NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ
);

CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    consenter TEXT NOT NULL,
    scope TEXT NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT consent_before_processing UNIQUE (investigation_id)
);

CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    pair_state pair_state DEFAULT 'UNKNOWN',
    is_primary BOOLEAN DEFAULT false,
    matrix JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    entity_type entity_type NOT NULL,
    name TEXT NOT NULL,
    attributes JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE entity_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    to_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    relationship relationship_type NOT NULL,
    evidence_ids UUID[] DEFAULT '{}',
    confidence_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT no_self_edge CHECK (from_entity_id != to_entity_id)
);

CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    source_type TEXT NOT NULL DEFAULT 'UNKNOWN',
    reliability reliability_tier NOT NULL DEFAULT 'LOW',
    reliability_reason TEXT,
    published_at TIMESTAMPTZ,
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    owner TEXT,
    is_allowed BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE source_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL UNIQUE REFERENCES sources(id) ON DELETE CASCADE,
    raw_text TEXT NOT NULL,
    cleaned_text TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    char_count INT NOT NULL,
    injection_flags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE SET NULL,
    entity_type entity_type NOT NULL,
    attribute TEXT NOT NULL,
    value TEXT NOT NULL,
    date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    snippet TEXT NOT NULL CHECK (snippet != ''),
    support_level support_level NOT NULL DEFAULT 'UNRESOLVED',
    signal_tier signal_tier,
    verification_status verification_status NOT NULL DEFAULT 'PENDING',
    observed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE independence_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    origin_source_id UUID REFERENCES sources(id),
    merge_reason TEXT,
    flagged BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE independence_cluster_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id UUID NOT NULL REFERENCES independence_clusters(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    derivation_reason TEXT,
    UNIQUE (cluster_id, source_id)
);

CREATE TABLE contradictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    severity contradiction_severity NOT NULL,
    claim_ids UUID[] NOT NULL DEFAULT '{}',
    evidence_ids UUID[] NOT NULL DEFAULT '{}',
    explanation TEXT,
    explained_away BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    claim_id UUID REFERENCES claims(id),
    event_date TIMESTAMPTZ,
    event_end_date TIMESTAMPTZ,
    description TEXT NOT NULL,
    is_impossible BOOLEAN DEFAULT false,
    conflict_with UUID[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit & Human Review Tables (Append-Only)
CREATE TABLE review_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('CONFIRM', 'REJECT')),
    target_type TEXT NOT NULL CHECK (target_type IN ('CLAIM', 'CANDIDATE')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    reviewer TEXT NOT NULL DEFAULT 'human',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID,
    action TEXT NOT NULL,
    actor TEXT NOT NULL DEFAULT 'system',
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 5. API Endpoint Specifications

Base URL: `http://localhost:8000/api/v1`

| Method | Route | Description | Request Payload / Params | Success Response |
|---|---|---|---|---|
| `POST` | `/investigations` | Create new investigation case | `multipart/form-data`: `title`, `context` (JSON), `image` (file), `consent_consenter`, `consent_scope` | `201 Created`: `{ "investigation_id": "...", "status": "INSUFFICIENT_EVIDENCE", "consent_recorded": true }` |
| `GET` | `/investigations/{id}` | Get case summary & status | Path `id` | `200 OK`: `{ "id": "...", "title": "...", "status": "STRONG_MATCH", "iteration_count": 1 }` |
| `DELETE`| `/investigations/{id}` | Permanently delete case data | Path `id` | `204 No Content` |
| `POST` | `/investigations/{id}/run` | Launch async pipeline execution | Path `id` | `202 Accepted`: `{ "task_id": "...", "status": "RUNNING" }` |
| `GET` | `/investigations/{id}/status` | Poll pipeline execution state | Path `id` | `200 OK`: `{ "pipeline_status": "COMPLETED", "case_status": "STRONG_MATCH" }` |
| `GET` | `/investigations/{id}/candidates`| Get candidates & matrix | Path `id` | `200 OK`: `{ "candidates": [...], "runner_up": {...} }` |
| `GET` | `/investigations/{id}/evidence` | List evidence with snippets | Path `id` | `200 OK`: `{ "evidence": [ { "id": "...", "snippet": "...", "support_level": "SUPPORTING" } ] }` |
| `GET` | `/investigations/{id}/graph` | React Flow graph JSON | Path `id` | `200 OK`: `{ "nodes": [...], "edges": [...] }` |
| `GET` | `/investigations/{id}/timeline`| Chronological timeline events| Path `id` | `200 OK`: `{ "events": [ { "description": "...", "is_impossible": false } ] }` |
| `GET` | `/investigations/{id}/contradictions`| List hard/soft contradictions| Path `id` | `200 OK`: `{ "contradictions": [...] }` |
| `GET` | `/investigations/{id}/sources` | Sources & clusters | Path `id` | `200 OK`: `{ "sources": [...], "clusters": [...] }` |
| `POST` | `/investigations/{id}/review` | Submit human confirm/reject | Body: `{ "action_type": "CONFIRM", "target_type": "CLAIM", "target_id": "...", "reason": "..." }` | `201 Created`: `{ "review_id": "...", "new_status": "STRONG_MATCH" }` |
| `POST` | `/investigations/{id}/copilot`| Read-only cited Q&A | Body: `{ "question": "..." }` | `200 OK`: `{ "answer": "...", "evidence_ids": [...] }` |
| `POST` | `/serpapi/web` | SerpApi web search | Body: `{ "query": "...", "max_results": 5 }` | `200 OK`: `{ "configured": true, "results": [...] }` |
| `POST` | `/serpapi/social/all` | Scan social platforms | Body: `{ "name": "...", "extra_terms": "..." }` | `200 OK`: `{ "configured": true, "results": {...} }` |
| `GET` | `/health` | Server health & config status | None | `200 OK`: `{ "status": "ok", "database": "connected" }` |

---

## 6. System Configuration Matrix

Environment configurations loaded via Pydantic `backend/app/config.py`:

| Parameter | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://traceid:traceid@localhost:5432/traceid` | PostgreSQL connection string |
| `DEMO_MODE` | `false` | Force mock/replay offline execution |
| `ALLOWED_DOMAINS` | `["*.example"]` | Approved domain list for live adapter |
| `SANDBOX_CORPUS_PATH` | `backend/seed/sandbox_corpus` | Directory containing synthetic test scenarios |
| `LIVE_ADAPTER_ENABLED` | `false` | Enable live network web fetching (D6) |
| `INDEPENDENCE_SIMILARITY_THRESHOLD` | `0.85` | MinHash shingling threshold for duplicate detection |
| `STATUS_MIN_CLUSTERS_STRONG` | `2` | Minimum independent clusters required for `STRONG MATCH` |
| `STATUS_MIN_DISCRIMINATING_STRONG` | `1` | Minimum discriminating signals for `STRONG MATCH` |
| `MAX_ITERATIONS` | `3` | Maximum gap-loop discovery iterations |
| `LLM_PROVIDER` | `mock` | `mock`, `replay`, `gemini`, or `openai` |
| `SERPAPI_API_KEY` | `""` | Optional key for enhanced web/social discovery |
| `IMAGE_STRIP_EXIF` | `true` | Strip EXIF metadata on upload |
| `FACE_SIMILARITY_ENABLED` | `false` | Optional reference face comparison (off by default) |

---

## 7. Decision Logic & Case Status Rules

The final case status is evaluated **deterministically** inside `backend/app/core/status.py`:

```
                       [ Evaluate Case Claims & Clusters ]
                                       |
                +----------------------+----------------------+
                |                                             |
   (Hard Contradiction Exists?)                   (Sufficient Evidence?)
                |                                             |
               YES                                            |
                |                                             v
         LIKELY DIFFERENT                    +----------------+----------------+
                                             |                                 |
                                 (≥2 Independent Clusters             (≥1 Cluster with DISCRIMINATING
                                  + ≥1 DISCRIMINATING Signal           OR ≥2 CORROBORATING Clusters?)
                                  + No Hard Contradiction?)                    |
                                             |                                 |
                                            YES                               YES
                                             |                                 |
                                        STRONG MATCH                     POSSIBLE MATCH
                                             |                                 |
                                  (Clear margin over runner-up?)   (2 candidates tied?)
                                             |                                 |
                                            NO                                YES
                                             |                                 |
                                         AMBIGUOUS                         AMBIGUOUS
                                             |
                                   (Everything Else)
                                             |
                                   INSUFFICIENT EVIDENCE
```

---

## 8. Developer Setup & SerpApi Integration Guide

### Local Development Setup
1. **Clone & Dependencies**:
   ```bash
   git clone <repo-url>
   cd traceid_pack_v2
   make setup
   ```
2. **Start Services**:
   ```bash
   make up
   ```
3. **Configure SerpApi (Optional for Live Search)**:
   - Obtain key from `https://serpapi.com/`
   - Edit `backend/.env`:
     ```env
     SERPAPI_API_KEY=your_actual_api_key_here
     ```
4. **Run Verification & Tests**:
   ```bash
   make check
   make test
   ```

---

## 9. Demo Scenarios & Test Suite

- **Scenario A (Strong Match)**: Input: "Aarav Mehta", institution, event. Proves: Evidence verification across multiple independent clusters. Outcome: `STRONG MATCH`.
- **Scenario B (Ambiguous)**: Input: "Priya Nair" (generic name). Proves: System presents 2 distinct candidates side-by-side without guessing. Outcome: `AMBIGUOUS`.
- **Scenario C (No Digital Footprint)**: Input: Sparse/synthetic unknown name. Proves: System handles missing evidence gracefully. Outcome: `INSUFFICIENT EVIDENCE`.
- **Scenario D (Prompt Injection / Poisoned Profile)**: Injected "Ignore previous instructions" in web text. Proves: Sanitizer strips flags; status engine remains unaffected.
- **Scenario E (Timeline Contradiction)**: Overlapping impossible employment dates from reliable sources. Outcome: `LIKELY DIFFERENT`.

---

## 10. Phase Execution Roadmap (P0 – P7)

- **P0 Scaffold**: Repository layout, Docker compose PostgreSQL 16 setup, FastAPI `/health` endpoint, Makefile targets.
- **P1 Database**: SQLAlchemy models, Alembic migrations, database indexes, seed data fixtures.
- **P2 Core Engines**: Deterministic status calculator, independence MinHash clusterer, entity resolution module, contradiction rules engine.
- **P3 Adapters & Sanitizer**: HTML sanitizer, prompt-injection detector, synthetic sandbox adapters, OCR fixture reader.
- **P4 LLM Layer**: Schema-enforced structured LLM extraction, prompt isolation wrapper, mock/replay provider.
- **P5 Orchestrator & REST API**: Bounded iterative pipeline coordinator, FastAPI router integration, async task status.
- **P6 Frontend Workspace**: React + Vite + TypeScript interface, React Flow entity graph visualization, evidence matrix view, copilot drawer.
- **P7 Demo Hardening**: Offline record/replay test verification, end-to-end scenario runner (`make demo-scenarios`), documentation freeze.

---
*End of Master System Specification — TRACEID v2*
