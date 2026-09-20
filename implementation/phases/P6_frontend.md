# P6 — Investigation Workspace (frontend)

PRECONDITIONS: P5 PASS, or API contract frozen (`frontend/openapi.json`) with the P5 mock server available — P6 may start in parallel once the contract is frozen.
READ FIRST: docs/README.md (UX section), docs/DEMO_PLAN.md, docs/API_SPEC.md, rules/10 (I10, I13).

GOAL: A professional cybersecurity-intelligence workspace, not a chatbot. Uncertainty is visible everywhere.

TASKS
1. Generate TypeScript API types from `openapi.json`; a typed client; error and loading wrappers.
2. Screens/panels: Case input (mandatory consent checkbox + scope text; image upload; authorized context fields) · Status banner with the five statuses, "why", and "what would change this" · Candidates (side by side; runner-up always visible) · Evidence graph (React Flow; node types per entity; edge types per relationship; contradictions and POSSIBLY_SAME_AS styled distinctly) · Evidence cards (snippet, source, tier, timestamp, verification state, cluster badge, injection-flag badge) · Source reliability + independence view (clusters with origin and copies) · Timeline (impossible periods highlighted) · Contradictions · Gaps · Human review controls (confirm/reject with reason; history) · Report view · Copilot panel (citations link to evidence cards; refusal state shown).
3. States for every panel: loading, empty, partial, error, disagreement. Scenario C must read as an intentional outcome ("Insufficient evidence — here is what was checked and what is missing").
4. No confidence meters, percentages, or decorative AI animations (I10).
5. Accessibility basics: keyboard navigation for review controls, contrast, aria labels on the graph controls.
6. Playwright smoke tests for scenarios A, B, C (replay mode).

ACCEPTANCE
- `npm run build`, `npm run lint`, `npx tsc --noEmit` exit 0
- Playwright: A shows STRONG MATCH with ≥2 clusters and a visible mirror-copies badge; B shows two candidates and AMBIGUOUS; C shows INSUFFICIENT EVIDENCE with the "checked/missing" list; a UI test asserts no `%` confidence text is rendered
- `make check` exits 0; attach screenshots of A, B, C

DO NOT: invent API fields; add pages not listed; use random or hardcoded data in place of API responses; add marketing/landing fluff.
STOP AND ASK IF: an API field needed by a panel is missing (propose an API_SPEC diff).
HANDOFF: gate report + screenshots + tag `p6-done`.
