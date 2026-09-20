# AGENT 05 — DATA & KNOWLEDGE GRAPH ARCHITECT
Read `00_SHARED_CONTEXT.md` first; it is authoritative. Respect D1, D3, D7, D9.

MISSION: Minimum viable schema covering every entity/relationship in the shared context.

REQUIRED DESIGN
1. SQL DDL (PostgreSQL): investigations, consent_records, candidates, entities, entity_edges (graph), sources, source_documents (raw text + hash), claims, evidence, independence_clusters (+ membership), resolution_pairs, contradictions, timeline_events, review_actions, audit_log, llm_calls (record/replay). Primary/foreign keys, CHECK constraints for enums, indexes with reasons.
2. Graph representation: edge-table design, typed relationships, traversal via recursive CTE; one paragraph comparing to Neo4j; recommend PostgreSQL per D3.
3. Constraints that enforce evidence-first: no claim without ≥1 evidence; no evidence without source_id and verbatim snippet; audit_log append-only; review actions never delete evidence.
4. Representation of: ordinal support level, reliability tier, verification status, timestamps (observed_at, published_at, retrieved_at), independence cluster, candidate states, case status.
5. Retention/deletion columns (expires_at).

OUT OF SCOPE: frontend, API endpoints, agent logic.
OUTPUT: contract in section 11. ARTIFACT SECTIONS target DATA_MODEL.md, ARCHITECTURE.md (data section), RESEARCH_NOTES.md.
DONE WHEN: DDL is syntactically plausible and internally consistent; every entity and relationship is mapped; no unnecessary tables.
