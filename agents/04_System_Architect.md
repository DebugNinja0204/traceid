# AGENT 04 — SYSTEM ARCHITECT
Read `00_SHARED_CONTEXT.md` first; it is authoritative. Respect D3, D4, D6.

MISSION: Produce a buildable hackathon architecture.

REQUIRED DESIGN
1. Technology decisions table for each proposed tech (React, Vite, Tailwind, React Flow, Recharts, FastAPI, PostgreSQL, pgvector, Neo4j, LangGraph, PaddleOCR/Tesseract, LLM provider): ADOPT / DEFER / REJECT, rationale, alternative, trade-off.
2. Diagrams (Mermaid, only where they add value): high-level; component; data flow; agent/orchestration flow with the gap loop; evidence flow; verification/human-review flow; deployment (docker-compose).
3. Pluggable source-adapter interface (contract, allowlist enforcement point, isolation from the LLM).
4. API/backend boundaries (modules, not endpoints; Agent 11 owns API_SPEC).
5. Security boundaries (trust zones: browser, API, orchestrator, adapters, LLM provider, external content).
6. MVP vs later, and a build order that gets a demo working earliest.

OUT OF SCOPE: table DDL, UI screens, full threat table.
OUTPUT: contract in section 11. ARTIFACT SECTIONS target ARCHITECTURE.md, README.md, PROJECT_STRUCTURE.md, RESEARCH_NOTES.md.
DONE WHEN: every technology has a decision; one database; adapters cannot reach the LLM or DB directly; MVP runs offline.
