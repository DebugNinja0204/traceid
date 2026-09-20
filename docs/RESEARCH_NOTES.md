# TRACEID — Research Notes

## Decision log

| ID | Conflict | Choice | Reason |
|----|---------|--------|--------|
| DL-01 | Agent 03 proposed LangGraph; Agent 04 recommended explicit state machine | Explicit state machine by default; LangGraph optional if it installs cleanly and reduces code | MVP simplicity; fewer dependencies; LangGraph adds overhead for a bounded loop (D4) |
| DL-02 | Agent 05 proposed separate graph DB; shared context mandates PostgreSQL only (D3) | PostgreSQL edge tables with recursive CTEs | Single database; edge tables sufficient for MVP entity count; Neo4j deferred to roadmap |
| DL-03 | Agent 03 and Agent 06 overlapped on evidence schema | Agent 05's DDL is authoritative; Agent 03's Pydantic schemas are the in-code representation | DDL = source of truth; Pydantic models map to it |
| DL-04 | Agent 08 proposed RBAC and API authentication; Agent 04 noted hackathon scope | Minimal auth in MVP (no user accounts); consent gate is the access control | Hackathon time constraint; consent is the critical gate, not user identity |
| DL-05 | Agent 02 proposed animated AI visualizations; Agent 09 + D7 prohibited decorative gimmicks | No confidence meters, percentage displays, or decorative AI animations | D7 prohibits single confidence percentage; gimmicks don't improve correctness |
| DL-06 | Agent 03 suggested embeddings for entity resolution; Agent 04 flagged dependency risk | Embeddings optional, disabled by default, never decide alone | MVP feasibility; pgvector included in Docker image but not required |
| DL-07 | Agent 06 and Agent 07 both defined contradiction handling | Agent 07's taxonomy is authoritative; Agent 06's provenance chain feeds into it | Agent 07 was scoped specifically for contradiction; Agent 06 defines the evidence chain |
| DL-08 | Agent 01 cited several sources with uncertain URLs | URLs removed or marked [UNVERIFIED] per honesty rules; only verified citations retained | Section 12 honesty rules: never invent citations |
| DL-09 | Agent 10 flagged that demo scenarios D and E are test-only, not judge-facing | D and E retained as automated tests; demo script shows only A, B, C to judges | Judges see 3-minute demo; D/E prove robustness in automated tests |
| DL-10 | Agent 09 proposed 6 screens; Agent 04 worried about hackathon time | All screens designed as panels in a single-page workspace; prioritize status/candidates/evidence for demo | Single-page workspace is faster to build and demo |

## Alternatives rejected

| Alternative | Why rejected |
|-------------|-------------|
| Neo4j for graph storage | D3 mandates single PostgreSQL database; edge tables with recursive CTEs sufficient for MVP entity count |
| Redis for caching | No caching layer needed in MVP; all queries hit PostgreSQL directly |
| Kafka/RabbitMQ for event streaming | Over-engineered for a synchronous pipeline with bounded loop |
| Face recognition for candidate discovery | Privacy violation; D2 prohibits open-web face search |
| Bayesian probabilistic scoring | D7 prohibits single confidence percentage; ordinal tiers are more honest with limited data |
| Multiple LLM providers with fallback chain | MVP complexity; single provider with mock/replay fallback is sufficient |
| Separate microservices per agent | Hackathon time; monolithic backend with clear module boundaries achieves the same separation |
| Playwright for all E2E tests | P6 uses Playwright for frontend; backend E2E uses pytest with HTTP client |

## Open questions

| # | Question | Impact | Status |
|---|---------|--------|--------|
| OQ-01 | Should the gap loop re-run entity resolution on existing claims or only on new evidence? | Affects iteration time and accuracy | Resolved: re-run on all claims including existing; new evidence may change signals |
| OQ-02 | What is the maximum reasonable `MAX_ITERATIONS` for demo timing? | Demo must complete in <30 seconds per scenario | Set to 3; demo scenarios designed to converge in 1-2 iterations |
| OQ-03 | Should the copilot have access to raw source documents or only structured claims? | Privacy vs usefulness | Resolved: access to claims and evidence snippets, not full raw documents |
| OQ-04 | How to handle a source that returns 404/timeout during live fetching? | Affects evidence completeness | Resolved: log as FAILED source; continue with available evidence |
| OQ-05 | Should `DEMO_MODE=replay` affect the frontend or only the backend? | Frontend may need to hide "live" indicators | Resolved: backend sets mode; frontend reads `demo_mode` from `/health` |

## Assumptions

| # | Assumption | Risk if wrong |
|---|-----------|--------------|
| A-01 | Entity count per investigation is small (tens to low hundreds) [ASSUMPTION] | PostgreSQL recursive CTEs may be slow; would need Neo4j |
| A-02 | Synthetic corpus adequately tests the decision rules [ASSUMPTION] | Real-world data may produce edge cases not covered |
| A-03 | Judges evaluate documentation before seeing the demo [ASSUMPTION] | README structure may need adjustment if demo is shown first |
| A-04 | Tesseract is available in the Docker environment or fixture fallback works [ASSUMPTION] | OCR features degraded without Tesseract |
| A-05 | LLM structured output reliably parses into Pydantic models within 2 retries [ASSUMPTION] | More retries or different prompt strategy may be needed |
