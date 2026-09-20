# TRACEID — Project Structure

```
traceid/
├── AGENTS.md                          # Agent instructions (always on)
├── Makefile                           # setup, up, check, test, demo-scenarios, reset-db, demo
├── docker-compose.yml                 # PostgreSQL 16 (+ pgvector if needed)
├── .env.example                       # Environment variable placeholders (no secrets)
├── .gitignore                         # .env, DB volumes, node_modules, caches, __pycache__
├── .agents/
│   └── rules/
│       ├── 10-invariants.md           # Test-enforced invariants I1–I15
│       ├── 20-stack-and-structure.md   # Repository layout and layering rules
│       ├── 30-security-and-llm.md     # Untrusted content pipeline, allowlist, LLM contracts
│       └── 40-workflow-gates.md       # Plan → implement → gate → report protocol
├── docs/
│   ├── README.md                      # Pitch and documentation index
│   ├── RESEARCH.md                    # Established concepts and verified sources
│   ├── ARCHITECTURE.md                # Components, diagrams, pipeline, agent table
│   ├── CONFIGURATION.md              # Every tunable parameter
│   ├── RESEARCH_NOTES.md             # Decision log, alternatives, open questions
│   ├── THREAT_MODEL.md               # Threat table and misuse analysis
│   ├── DATA_MODEL.md                 # DDL, ER diagram, constraints
│   ├── API_SPEC.md                   # REST endpoints for MVP
│   ├── DEMO_PLAN.md                  # 3–5 minute demo script
│   ├── JUDGING_MATRIX.md             # Criteria → evidence → where demonstrated
│   ├── PROJECT_STRUCTURE.md          # This file
│   ├── FUTURE_ROADMAP.md             # Post-hackathon items
│   └── .env.example                  # Documented environment template
├── backend/
│   ├── pyproject.toml                 # Python dependencies: FastAPI, SQLAlchemy, Pydantic, pytest, ruff, mypy
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI application entry point
│   │   ├── config.py                  # Pydantic settings from env/CONFIGURATION.md keys
│   │   ├── api/                       # Thin routers only; no business logic
│   │   │   ├── __init__.py
│   │   │   ├── investigations.py      # Case CRUD + run/status
│   │   │   ├── candidates.py          # Candidate listing with matrices
│   │   │   ├── evidence.py            # Evidence with provenance
│   │   │   ├── graph.py               # Entity graph for React Flow
│   │   │   ├── timeline.py            # Chronological events
│   │   │   ├── contradictions.py      # Detected contradictions
│   │   │   ├── sources.py             # Sources with reliability/clusters
│   │   │   ├── review.py              # Human review actions
│   │   │   ├── report.py              # Investigation report
│   │   │   ├── copilot.py             # Q&A over evidence
│   │   │   └── health.py              # Health check endpoint
│   │   ├── core/                      # DETERMINISTIC engines: no DB, no network, no LLM
│   │   │   ├── __init__.py
│   │   │   ├── reliability.py         # Source type → tier (HIGH/MEDIUM/LOW)
│   │   │   ├── independence.py        # Near-duplicate detection, clustering (D9)
│   │   │   ├── resolution.py          # Blocking + feature comparison → pair states
│   │   │   ├── contradiction.py       # Rules over structured claims
│   │   │   ├── timeline.py            # Date ordering, overlap detection
│   │   │   ├── matrix.py              # Evidence matrix builder
│   │   │   └── status.py              # ONLY place case status is computed (I9)
│   │   ├── agents/                    # LLM-assisted: no status writes (I9)
│   │   │   ├── __init__.py
│   │   │   ├── planner.py             # Query planning from authorized context
│   │   │   ├── extraction.py          # Structured claim extraction
│   │   │   ├── report.py              # Template + LLM narrative
│   │   │   └── copilot.py             # Read-only cited Q&A
│   │   ├── llm/                       # Provider interface and schemas
│   │   │   ├── __init__.py
│   │   │   ├── provider.py            # generate_structured(); mock/replay/real
│   │   │   ├── schemas.py             # Pydantic schemas (extra=forbid)
│   │   │   ├── mock.py                # Fixture-based provider for tests
│   │   │   ├── replay.py              # Recorded responses keyed by prompt hash
│   │   │   └── prompts/               # Versioned prompt templates
│   │   ├── adapters/                  # Source fetching; never call LLM or DB
│   │   │   ├── __init__.py
│   │   │   ├── base.py                # Base adapter with allowlist enforcement
│   │   │   ├── sandbox_corpus.py      # Serves from seed/sandbox_corpus/
│   │   │   ├── live_allowlisted.py    # Live web fetch (disabled by default)
│   │   │   └── ocr.py                 # Tesseract / fixture fallback
│   │   ├── security/                  # Consent, allowlist, sanitize, audit
│   │   │   ├── __init__.py
│   │   │   ├── consent.py             # Consent gate enforcement
│   │   │   ├── allowlist.py           # Domain allowlist
│   │   │   ├── sanitize.py            # Strip/normalize/flag injection patterns
│   │   │   ├── audit.py               # Append-only audit logging
│   │   │   └── ratelimit.py           # Per-client rate limiting
│   │   ├── orchestrator/              # Pipeline state machine
│   │   │   ├── __init__.py
│   │   │   ├── state_machine.py       # Pipeline nodes and transitions
│   │   │   └── loop_control.py        # Gap loop with MAX_ITERATIONS bound
│   │   └── db/                        # Database models and session
│   │       ├── __init__.py
│   │       ├── models.py              # SQLAlchemy 2 models
│   │       ├── session.py             # Session management
│   │       └── migrations/            # Alembic migrations
│   ├── seed/
│   │   ├── sandbox_corpus/            # Synthetic scenario data
│   │   │   ├── A/                     # Strong Match scenario
│   │   │   ├── B/                     # Ambiguous scenario
│   │   │   ├── C/                     # No footprint scenario
│   │   │   ├── D/                     # Poisoning/injection scenario
│   │   │   └── E/                     # Contradiction scenario
│   │   ├── llm_replays/               # Recorded LLM responses for replay mode
│   │   └── ocr_fixtures/              # OCR fallback fixtures
│   └── tests/
│       ├── conftest.py                # Shared fixtures
│       ├── unit/                      # Unit tests for core engines
│       │   ├── test_status.py         # I1, I3
│       │   ├── test_independence.py   # I2
│       │   ├── test_evidence_verify.py # I4
│       │   ├── test_llm_contract.py   # I5
│       │   ├── test_no_percentage.py  # I10
│       │   ├── test_review.py         # I11
│       │   └── test_audit.py          # I12
│       ├── security/                  # Security-focused tests
│       │   ├── test_injection.py      # I6
│       │   ├── test_allowlist.py      # I7
│       │   ├── test_consent.py        # I8
│       │   └── test_boundaries.py     # I9
│       ├── golden/                    # Golden scenario tests
│       │   └── test_scenarios.py      # I15 (A–E expected outcomes)
│       └── e2e/                       # End-to-end tests
│           ├── test_candidates.py     # I13
│           └── test_replay.py         # I14
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── openapi.json                   # Generated from backend for type generation
    ├── src/
    │   ├── main.tsx                   # App entry point
    │   ├── App.tsx                    # Root component with workspace layout
    │   ├── api/                       # Generated TypeScript API client
    │   ├── components/
    │   │   ├── CaseInput.tsx          # Consent + context + image upload
    │   │   ├── StatusBanner.tsx       # Five statuses + why + what would change
    │   │   ├── CandidateView.tsx      # Side-by-side candidates with matrices
    │   │   ├── EvidenceGraph.tsx      # React Flow entity graph
    │   │   ├── EvidenceCard.tsx       # Snippet, source, tier, cluster badge
    │   │   ├── SourceView.tsx         # Reliability + independence clusters
    │   │   ├── Timeline.tsx           # Chronological events, conflict highlights
    │   │   ├── Contradictions.tsx     # Detected contradictions
    │   │   ├── Gaps.tsx               # Investigation gaps
    │   │   ├── ReviewPanel.tsx        # Confirm/reject with reason + history
    │   │   ├── ReportView.tsx         # Investigation report
    │   │   └── CopilotPanel.tsx       # Q&A with citations
    │   └── hooks/                     # React hooks for API state
    └── public/
```

## Key design rules

- **`core/`** is pure Python: no DB, no network, no LLM. Everything unit-testable.
- **`api/`** routers contain no logic beyond validation/serialization.
- **`agents/`** and **`llm/`** never import `core/status.py` writers (I9).
- **Adapters** return raw documents only. They never call the LLM or DB.
- **All thresholds** come from `config.py` — no magic numbers in engines.
