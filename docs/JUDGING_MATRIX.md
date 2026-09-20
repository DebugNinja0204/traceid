# TRACEID — Judging Matrix

## Checkpoint 1 scoring (15 marks)

### Problem Understanding (5 marks)

| Criterion | Evidence in docs | Where demonstrated | Score risk |
|-----------|-----------------|-------------------|-----------|
| Understands the official problem | README §2 restates problem; RESEARCH maps pillars to established practice | README.md, RESEARCH.md | LOW |
| Identifies why naive approaches fail | README §3 table: 6 weak approaches with failure modes and TRACEID counters | README.md | LOW |
| Recognizes false-match and ambiguity risks | RESEARCH_NOTES decisions; contradiction taxonomy in ARCHITECTURE; scenario B demonstrates ambiguity | RESEARCH_NOTES.md, ARCHITECTURE.md, DEMO_PLAN.md | LOW |
| Addresses privacy and consent | README §9; THREAT_MODEL misuse analysis; consent gate in API_SPEC | README.md, THREAT_MODEL.md, API_SPEC.md | LOW |
| Understands evidence quality vs quantity | Source independence method; evidence matrix; "count clusters not URLs" | ARCHITECTURE.md, README.md, RESEARCH.md | LOW |

### Architecture (5 marks)

| Criterion | Evidence in docs | Where demonstrated | Score risk |
|-----------|-----------------|-------------------|-----------|
| Clear component separation | ARCHITECTURE diagrams; PROJECT_STRUCTURE layout; layering rules | ARCHITECTURE.md, PROJECT_STRUCTURE.md | LOW |
| Justified technology choices | ARCHITECTURE tech decisions table; RESEARCH_NOTES alternatives rejected | ARCHITECTURE.md, RESEARCH_NOTES.md | LOW |
| Data model covers all entities | DATA_MODEL ER diagram; DDL with enums matching shared context | DATA_MODEL.md | LOW |
| Pipeline design with gap loop | ARCHITECTURE pipeline diagram; API_SPEC run/status endpoints | ARCHITECTURE.md, API_SPEC.md | LOW |
| Security boundaries defined | ARCHITECTURE trust zones table; THREAT_MODEL threat table | ARCHITECTURE.md, THREAT_MODEL.md | LOW |

### Approach (5 marks)

| Criterion | Evidence in docs | Where demonstrated | Score risk |
|-----------|-----------------|-------------------|-----------|
| Evidence-first design | Evidence flow diagram; snippet verification (I4); provenance chain | ARCHITECTURE.md, DATA_MODEL.md | LOW |
| Deterministic core decisions | LLM vs deterministic table; status engine in core/; invariant I9 | README.md, ARCHITECTURE.md | LOW |
| Source independence method | Layered algorithm with worked example; MinHash/shingling | ARCHITECTURE.md, RESEARCH.md, CONFIGURATION.md | LOW |
| Contradiction detection | Taxonomy; hard vs soft; runs before status; invariant I3 | ARCHITECTURE.md, RESEARCH_NOTES.md | LOW |
| Handles UNKNOWN/insufficient evidence | Scenario C; invariant I1; INSUFFICIENT EVIDENCE as first-class status | DEMO_PLAN.md, README.md | LOW |

## Checkpoint 3 readiness

| Criterion | Status | Fix needed |
|-----------|--------|-----------|
| Identity matching | Strong | Entity resolution with blocking + feature comparison + pair states per D1 |
| Profile discovery | Strong | Pluggable adapters with allowlist; sandbox corpus for demo; query planner |
| Multi-platform correlation | Strong | Source adapters per domain; entity graph links across platforms |
| Entity resolution | Strong | Deterministic scorer with typed signals; ordinal tiers; no single score |
| Information extraction | Strong | LLM-assisted with Pydantic schema validation and snippet verification |
| Evidence verification | Strong | Verbatim snippet check; content hash; provenance chain |
| Timeline/relationships | Strong | Deterministic timeline; entity edges; React Flow graph |
| False-match robustness | Strong | Contradiction taxonomy; independence clusters; runner-up always shown |
| AI/technical implementation | Strong | 8 agents with clear LLM/deterministic split; fail-closed contracts |
| Privacy/responsible design | Strong | Consent gate; allowlist; EXIF strip; audit; retention; no face search |

## Demo failure modes and mitigations

| Failure | Mitigation | Where documented |
|---------|-----------|-----------------|
| Network unavailable | `DEMO_MODE=replay` with recorded LLM responses and sandbox corpus | CONFIGURATION.md, DEMO_PLAN.md |
| LLM timeout | Deterministic-only report with banner | ARCHITECTURE.md agent table |
| Empty results for a scenario | By design for Scenario C; "what was checked" list | DEMO_PLAN.md |
| Slow pipeline | Pre-seeded database; replay mode eliminates API latency | CONFIGURATION.md |
| Unexpected status | Golden tests (I15) verify expected outcomes before demo | invariants I1-I15 |
