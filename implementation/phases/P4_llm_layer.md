# P4 — LLM layer (extraction, report, copilot) with fail-closed contracts

PRECONDITIONS: P2 and P3 PASS.
READ FIRST: docs/ARCHITECTURE.md (AI section), rules/30, rules/10 (I4, I5, I6, I9, I14).

GOAL: Useful language capabilities that can never decide status and can never be steered by page content.

TASKS
1. `llm/provider.py`: `generate_structured(schema, messages)`; providers: `mock` (fixtures), `replay` (recorded by prompt hash, zero network), one real provider selected by env (Gemini- or OpenAI-compatible; verify SDK names/params from official docs before use). Timeouts and retry limits from config. Record mode stores `llm_calls`.
2. `llm/schemas.py` (Pydantic, extra=forbid): ExtractedClaim(entity_type, attribute, value, snippet, date?, source_id), ContradictionProposal(claim_ids, kind, rationale), ReportSection(text, evidence_ids), CopilotAnswer(answer, evidence_ids, refused: bool).
3. `agents/extraction.py`: wraps sanitized text in a randomized-delimiter data block with a fixed system prompt; parses to schema; retries ≤ config with validation error only; then fail closed. Post-verification: drop any claim whose snippet is not a verbatim (normalized) substring of the stored source text (I4); count drops.
4. Contradiction proposals from the LLM are candidates only: each must pass `core/contradiction.py` verification against structured claims before it counts.
5. `agents/report.py`: template-driven; LLM fills narrative per section but every sentence-level statement must cite evidence_ids that exist; strip any statement without valid ids; the status and matrix are inserted from core output verbatim, not generated. Provide a deterministic-only fallback report when the LLM is unavailable (banner: "AI narrative unavailable").
6. `agents/copilot.py`: read-only Q&A over the case's evidence (retrieval by SQL/keyword; embeddings optional); answers must cite evidence_ids; refuse questions that request out-of-scope collection, private data, or unsupported identity claims; cannot trigger fetches or status changes.
7. `agents/planner.py`: query suggestions derived ONLY from authorized case context and already-verified claims; output validated against the allowlist.
8. Boundary test: modules in `agents/` and `llm/` do not import the status writer (I9).

ACCEPTANCE
- Tests (mock provider): invalid JSON rejected → retry → fail closed (I5); snippet not in source dropped (I4); malicious mock output attempting to set status or add fields rejected; injection fixture page (scenario D) produces no change in extracted structure/status and is flagged (I6); report statements without valid evidence_ids removed; copilot refuses out-of-scope requests; replay mode makes zero network calls (I14); boundary test passes (I9)
- Optional real-provider smoke test, skipped without an API key, never in `make check`
- `make check` exits 0

DO NOT: give the LLM tools that fetch URLs; let any LLM text reach status logic; put page content into system prompts; swallow schema errors; add a second provider abstraction layer beyond the interface.
STOP AND ASK IF: the provider SDK behavior differs from what docs assume; structured-output support is missing (then use JSON mode + Pydantic validation and report).
HANDOFF: gate report + list of prompts used (versioned files under `backend/app/llm/prompts/`) + tag `p4-done`.
