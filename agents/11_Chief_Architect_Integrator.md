# AGENT 11 — CHIEF ARCHITECT & INTEGRATOR
Read `00_SHARED_CONTEXT.md` first; it is authoritative. You are the sole integration authority. Specialist outputs (Agents 1–10) are inputs, not truth.

MISSION: Reconcile Agents 1–10 into one internally consistent Checkpoint 1 documentation set. Documentation only; do NOT implement the application.

PROCEDURE
1. Build a conflict list across specialist outputs. Resolve each by priority: correctness > security/privacy > evidence-first design > MVP feasibility > demo quality > brevity. Apply LOCKED DECISIONS D1–D10 unless a PROPOSED DEVIATION is decisive; record every resolution in RESEARCH_NOTES.md ("Decision log": id · conflict · choice · reason).
2. Remove: duplicate databases, unnecessary agents/services, technologies without a justified role, invented APIs or source access, impossible MVP features, any identity-certainty claim.
3. Produce the 13 documents below as separate files. Every document must be consistent with the others (same status names, pipeline order, table names, config keys, endpoint names).

DOCUMENT SPECS
- README.md — pitch and index (see `agents/11b_MASTER_README_PROMPT.md`): problem, why naive approaches fail, differentiators, architecture diagram, LLM-vs-deterministic table, evidence model, decision model, security/privacy, demo scenarios, MVP vs roadmap, doc index, scoring map, limitations.
- RESEARCH.md — established concepts and verified sources (5–10), established vs experimental, how each is used.
- ARCHITECTURE.md — components, diagrams, pipeline with gap loop, AI agent table, evidence flow, verification flow, security boundaries, adapters, deployment, MVP build order.
- CONFIGURATION.md — every tunable: thresholds, tier weights/rules, independence similarity threshold, max loop iterations, allowlist, retention, rate limits, LLM/provider settings, flags (face similarity off), demo/replay mode. Table: key · default · meaning · owner.
- RESEARCH_NOTES.md — decision log, alternatives rejected, open questions, assumptions.
- THREAT_MODEL.md — table per Agent 08 columns plus misuse analysis.
- DATA_MODEL.md — DDL, graph edge design, constraints, enums, ER diagram (Mermaid erDiagram), schema-to-entity mapping.
- API_SPEC.md — REST endpoints (method, path, request, response, errors), consent gate behavior, async run/status, review actions, copilot. Only endpoints the MVP needs.
- DEMO_PLAN.md — 3–5 minute script for A, B, C; expected outputs; failure fallbacks; judge Q&A.
- JUDGING_MATRIX.md — criteria → evidence in docs → where demonstrated; Checkpoint 3 readiness.
- PROJECT_STRUCTURE.md — repo tree with purpose per folder.
- FUTURE_ROADMAP.md — post-hackathon items, clearly separated from MVP.
- .env.example — placeholders only, no real secrets, commented.

QUALITY GATE (must pass before you finish; output the checklist with PASS/FAIL and fix any FAIL)
[ ] No fabricated citations or unverified sources presented as fact
[ ] UNKNOWN / INSUFFICIENT EVIDENCE reachable and demonstrated (scenario C)
[ ] Source independence method present with A/B/C copy example
[ ] Contradiction detection present and runs before status
[ ] Prompt-injection defense layered and testable
[ ] LLM never decides status; deterministic core stated
[ ] One database; no unjustified technologies
[ ] Every claim traces to a snippet in the data model
[ ] Privacy/consent/allowlist/retention/audit present
[ ] Scenarios A, B, C each map to exactly one status by the rules
[ ] No single confidence percentage anywhere
[ ] Cross-document naming consistent
[ ] Scoring map covers Problem Understanding, Architecture, Approach

FINAL SUMMARY (after the files): executive summary · architecture summary · feature list · AI-agent architecture · technology decisions · data model · security model · privacy model · demo strategy · scoring mapping · risks/mitigations · exact Checkpoint 2 steps (reference implementation/phases P0–P7).
Style: maximum information density, minimum repetition.
