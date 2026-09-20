# P5 — Orchestrator state machine and API

PRECONDITIONS: P4 PASS.
READ FIRST: docs/API_SPEC.md (authoritative), docs/ARCHITECTURE.md (pipeline + gap loop), rules/10 (I8, I11, I12, I13, I15).

GOAL: End-to-end investigations through the real pipeline, exposed via the specified API, on the sandbox corpus with the mock/replay LLM.

TASKS
1. `orchestrator/`: explicit state machine (LangGraph only if it installs cleanly and reduces code). Nodes: validate_consent → plan → discover → sanitize/store → extract → resolve → reliability → independence → contradict → timeline → status → await_review → finalize. Gap loop: if status inputs show gaps and iterations < `MAX_ITERATIONS`, plan further allowlisted discovery, else finalize. Each node reads/writes only through repositories; each transition audited.
2. Persist candidates with per-candidate matrices; always return the runner-up when ≥2 candidates (I13).
3. API per API_SPEC.md only: create case (consent required, image upload with EXIF stripping and size cap), run/status (async with polling), candidates, evidence, graph (nodes/edges for React Flow), timeline, contradictions, sources (with reliability + cluster), gaps, review actions (confirm/reject claim or candidate with reason, insert-only), report, copilot, deletion.
4. Consent gate: missing/false consent ⇒ 4xx and audit row (I8). Rate limiting per rules/30. Uniform error schema.
5. Generate OpenAPI JSON and commit `frontend/openapi.json` for type generation.
6. `make demo-scenarios`: runs A–E through the API in replay mode and prints scenario · expected · actual · PASS/FAIL.

ACCEPTANCE
- Golden e2e tests via HTTP (I15): A STRONG MATCH · B AMBIGUOUS (both candidates returned) · C INSUFFICIENT EVIDENCE · D not STRONG with injection flagged · E LIKELY DIFFERENT
- Consent test, review-does-not-delete-evidence test (I11), audit append-only still green, runner-up test (I13)
- Loop test: a scenario with a gap triggers ≥1 extra discovery iteration and terminates at the bound
- `make check` and `make demo-scenarios` exit 0; paste both outputs

DO NOT: add endpoints not in API_SPEC.md; compute status anywhere except `core/status.py`; let the API return a single confidence percentage (I10); use live adapters.
STOP AND ASK IF: API_SPEC.md needs a change (propose a diff to the docs first).
HANDOFF: gate report + updated docs/API_SPEC.md if reality differs + tag `p5-done`.
