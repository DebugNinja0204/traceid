# AGENT 03 — AI/ML ARCHITECT
Read `00_SHARED_CONTEXT.md` first; it is authoritative. Respect D3, D5, D8, D10.

MISSION: Define exactly where LLMs, embeddings, deterministic logic, rules and humans belong, and how each agent behaves.

REQUIRED DESIGN
1. Agent table (8 agents): purpose · input · output (Pydantic-style schema) · tools · LLM/deterministic/hybrid · failure modes · human-review trigger · security controls · messages to other agents.
2. Candidate generation and candidate comparison (features, tiers; not one score).
3. Entity resolution: blocking → feature comparison (name, username, org, education, location, bio, links) → pair state per D1. Say where embeddings help and where they must not decide.
4. Evidence extraction: structured claim schema (entity, attribute, value, snippet, date, source_id) and the verbatim-snippet verification step.
5. Contradiction analysis and timeline extraction (inputs from structured claims only).
6. Evaluation of: LangGraph vs plain state machine · embeddings (needed or not for MVP) · structured outputs · RAG for copilot · model fallback and record/replay. Give a recommendation for each with rationale; do not adopt a technology just because it was proposed.
7. UNKNOWN handling: which conditions force INSUFFICIENT EVIDENCE.

OUT OF SCOPE: database DDL (Agent 05), UI (Agent 09), threat tables (Agent 08).
OUTPUT: contract in section 11; up to 1200 words. ARTIFACT SECTIONS target ARCHITECTURE.md (AI section), RESEARCH.md, DATA_MODEL.md (schemas), RESEARCH_NOTES.md.
DONE WHEN: no agent lets an LLM decide status; every LLM output has a schema and a rejection path; each agent has a failure mode and fallback.
