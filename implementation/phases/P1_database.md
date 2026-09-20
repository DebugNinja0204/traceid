# P1 — Database schema, migrations, DB-level guarantees

PRECONDITIONS: P0 gate PASS.
READ FIRST: docs/DATA_MODEL.md (authoritative), rules/10-invariants.md (I4, I11, I12).

GOAL: The full schema from DATA_MODEL.md with constraints that make evidence-first violations impossible at the database level.

TASKS
1. SQLAlchemy 2 models + Alembic migration for every table in DATA_MODEL.md (investigations, consent_records, candidates, entities, entity_edges, sources, source_documents, claims, evidence, independence_clusters + membership, resolution_pairs, contradictions, timeline_events, review_actions, audit_log, llm_calls; anything else the doc defines).
2. Enums as CHECK constraints or PG enums exactly matching D1 vocabulary (pair states, case statuses) and tiers.
3. Guarantees: evidence.source_id NOT NULL and snippet NOT NULL; claim requires ≥1 evidence (enforce via deferred constraint/trigger or service-level transaction check with a test); audit_log has no UPDATE/DELETE path (revoke privileges, rule, or trigger); review_actions are insert-only.
4. Graph via `entity_edges` with typed relationship enum from the shared context; add a repository helper for neighbor queries (recursive CTE) with a test.
5. Repository layer (thin) with session management; no business logic.
6. `make reset-db` drops/recreates and migrates.

ACCEPTANCE
- `alembic upgrade head` then `alembic downgrade base` then `upgrade head` all succeed
- Tests: evidence without source_id rejected; claim without evidence rejected; audit_log UPDATE/DELETE fails (I12); invalid status string rejected; recursive-CTE neighbor query returns expected nodes
- `make check` exits 0

DO NOT: add tables not in DATA_MODEL.md without asking; store raw images in DB; write any engine logic.
STOP AND ASK IF: DATA_MODEL.md DDL is inconsistent (missing FK, ambiguous enum).
HANDOFF: gate report + schema diagram regenerated from the models (Mermaid) saved to docs/ if it differs + tag `p1-done`.
