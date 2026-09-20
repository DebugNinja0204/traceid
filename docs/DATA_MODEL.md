# TRACEID — Data Model

## Entity-Relationship Diagram

```mermaid
erDiagram
    INVESTIGATION ||--o{ CONSENT_RECORD : requires
    INVESTIGATION ||--o{ CANDIDATE : has
    INVESTIGATION ||--o{ SOURCE : discovers
    CANDIDATE ||--o{ ENTITY : linked_to
    CANDIDATE ||--o{ RESOLUTION_PAIR : participates
    ENTITY ||--o{ ENTITY_EDGE : from
    ENTITY ||--o{ ENTITY_EDGE : to
    SOURCE ||--|| SOURCE_DOCUMENT : stores
    SOURCE_DOCUMENT ||--o{ EVIDENCE : extracted_from
    EVIDENCE }o--|| CLAIM : supports
    CLAIM }o--|| CANDIDATE : about
    EVIDENCE ||--o{ INDEPENDENCE_CLUSTER_MEMBER : belongs_to
    INDEPENDENCE_CLUSTER ||--o{ INDEPENDENCE_CLUSTER_MEMBER : contains
    CLAIM ||--o{ CONTRADICTION : involved_in
    CLAIM ||--o{ TIMELINE_EVENT : produces
    INVESTIGATION ||--o{ REVIEW_ACTION : receives
    INVESTIGATION ||--o{ AUDIT_LOG : records
    INVESTIGATION ||--o{ LLM_CALL : uses
```

## SQL DDL (PostgreSQL 16)

```sql
-- Enums matching D1 vocabulary
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
CREATE TYPE source_type AS ENUM (
    'ORGANIZER_PROVIDED', 'INSTITUTIONAL_OFFICIAL', 'PROFESSIONAL_PROFILE',
    'PUBLICATION', 'THIRD_PARTY_MENTION', 'ANONYMOUS', 'UNKNOWN'
);

-- Investigations
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

-- Consent records
CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    consenter TEXT NOT NULL,
    scope TEXT NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT consent_before_processing UNIQUE (investigation_id)
);

-- Candidates
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    pair_state pair_state DEFAULT 'UNKNOWN',
    is_primary BOOLEAN DEFAULT false,
    matrix JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_candidates_investigation ON candidates(investigation_id);

-- Entities
CREATE TABLE entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    entity_type entity_type NOT NULL,
    name TEXT NOT NULL,
    attributes JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_entities_investigation ON entities(investigation_id);
CREATE INDEX idx_entities_type ON entities(entity_type);

-- Entity edges (graph representation)
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
CREATE INDEX idx_edges_from ON entity_edges(from_entity_id);
CREATE INDEX idx_edges_to ON entity_edges(to_entity_id);
CREATE INDEX idx_edges_relationship ON entity_edges(relationship);

-- Sources
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    source_type source_type NOT NULL DEFAULT 'UNKNOWN',
    reliability reliability_tier NOT NULL DEFAULT 'LOW',
    reliability_reason TEXT,
    published_at TIMESTAMPTZ,
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    owner TEXT,
    is_allowed BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sources_investigation ON sources(investigation_id);
CREATE INDEX idx_sources_domain ON sources(domain);

-- Source documents (raw stored text)
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
CREATE INDEX idx_source_docs_hash ON source_documents(content_hash);

-- Claims
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
CREATE INDEX idx_claims_investigation ON claims(investigation_id);
CREATE INDEX idx_claims_candidate ON claims(candidate_id);

-- Evidence (links claims to sources with verbatim snippets)
CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    snippet TEXT NOT NULL CHECK (snippet != ''),
    support_level support_level NOT NULL DEFAULT 'UNRESOLVED',
    signal_tier signal_tier,
    verification_status verification_status NOT NULL DEFAULT 'PENDING',
    observed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT evidence_has_source CHECK (source_id IS NOT NULL),
    CONSTRAINT evidence_has_snippet CHECK (snippet IS NOT NULL AND length(snippet) > 0)
);
CREATE INDEX idx_evidence_claim ON evidence(claim_id);
CREATE INDEX idx_evidence_source ON evidence(source_id);

-- Independence clusters
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

-- Resolution pairs
CREATE TABLE resolution_pairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    candidate_a_id UUID NOT NULL REFERENCES candidates(id),
    candidate_b_id UUID NOT NULL REFERENCES candidates(id),
    pair_state pair_state NOT NULL DEFAULT 'UNKNOWN',
    signals JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT different_candidates CHECK (candidate_a_id != candidate_b_id)
);

-- Contradictions
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

-- Timeline events
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

-- Review actions (insert-only: never update or delete evidence)
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
-- No UPDATE or DELETE on review_actions

-- Audit log (append-only)
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID,
    action TEXT NOT NULL,
    actor TEXT NOT NULL DEFAULT 'system',
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Enforce append-only via trigger or revoked privileges:
-- REVOKE UPDATE, DELETE ON audit_log FROM traceid_app;

-- LLM calls (record/replay)
CREATE TABLE llm_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID REFERENCES investigations(id),
    prompt_hash TEXT NOT NULL,
    schema_name TEXT NOT NULL,
    messages JSONB NOT NULL,
    response JSONB,
    provider TEXT NOT NULL,
    model TEXT,
    tokens_in INT,
    tokens_out INT,
    duration_ms INT,
    outcome TEXT NOT NULL CHECK (outcome IN ('SUCCESS', 'RETRY', 'FAIL_CLOSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_llm_calls_hash ON llm_calls(prompt_hash);
```

## Graph representation

The graph is modeled via the `entity_edges` table with typed relationships from the shared context enum. Traversal uses recursive CTEs:

```sql
-- Neighbor query: find all entities connected to a given entity within N hops
WITH RECURSIVE neighbors AS (
    SELECT to_entity_id AS entity_id, relationship, 1 AS depth
    FROM entity_edges WHERE from_entity_id = :start_id
    UNION ALL
    SELECT e.to_entity_id, e.relationship, n.depth + 1
    FROM entity_edges e
    JOIN neighbors n ON e.from_entity_id = n.entity_id
    WHERE n.depth < :max_depth
)
SELECT DISTINCT entity_id, relationship, depth FROM neighbors;
```

**Why PostgreSQL, not Neo4j (D3)**: For MVP, the entity count per investigation is small (tens to low hundreds). Edge-table queries with recursive CTEs are sufficient and avoid adding a second database. Neo4j is listed in FUTURE_ROADMAP.md for when graph traversal complexity justifies a dedicated graph engine.

## Schema-to-entity mapping

| Shared context entity | Table | Notes |
|----------------------|-------|-------|
| PERSON, ACCOUNT, USERNAME, etc. | `entities` (via `entity_type` enum) | All entity types in one table with JSONB attributes |
| Relationships (WORKED_AT, etc.) | `entity_edges` (via `relationship` enum) | Typed edges with evidence references |
| SOURCE | `sources` + `source_documents` | Source metadata separate from stored text |
| CLAIM | `claims` + `evidence` | Every claim must have ≥1 evidence row |

## Constraints enforcing evidence-first

1. `evidence.source_id NOT NULL` — no evidence without a source
2. `evidence.snippet NOT NULL AND length(snippet) > 0` — no evidence without a verbatim snippet
3. Claim requires ≥1 evidence — enforced via service-level transaction check with test (I4)
4. `audit_log` append-only — UPDATE/DELETE revoked or trigger-blocked (I12)
5. `review_actions` insert-only — no UPDATE/DELETE path (I11)
6. Valid enum values via PostgreSQL types — invalid status strings rejected
7. `expires_at` on investigations — retention/deletion support
