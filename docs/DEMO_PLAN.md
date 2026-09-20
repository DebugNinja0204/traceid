# TRACEID — Demo Plan

## Overview

3–5 minute live demonstration using synthetic data only. All scenarios run in `DEMO_MODE=replay` with zero network dependency. Start with `make demo`.

## Pre-demo checklist

- [ ] `make demo` tested on clean clone with no API key
- [ ] Database seeded with sandbox corpus
- [ ] Replay fixtures committed for all scenarios
- [ ] Timer visible to presenter

## Demo script

### Minute 0:00–0:30 — Introduction and consent

1. Open the Investigation Workspace in browser
2. **Key message**: "TRACEID determines whether evidence is sufficient — it never fabricates an identity"
3. Show the case creation form with **mandatory consent checkbox**
4. Enter: Name "Aarav Mehta", Institution "Meridian Institute of Technology", Event "NEURAX Demo Day"
5. Submit — consent gate accepts

### Minute 0:30–1:30 — Scenario A: Strong Match

1. Pipeline runs (visible progress: discovery → extraction → resolution → independence → contradiction → status)
2. **Status banner**: STRONG MATCH
3. **Show evidence graph**: mutual links between portfolio and speaker page (DISCRIMINATING signal)
4. **Show source independence**: "See these three sources? Two are mirrors of the speaker bio — they form ONE cluster, not three confirmations"
5. **Show evidence matrix**: supporting signals with tiers and clusters
6. **Wow moment**: Click a mirror-copy source → cluster badge shows "Derived from Speaker Page" → only 1 independent confirmation counted

### Minute 1:30–2:30 — Scenario B: Ambiguous Identity

1. New case: "Priya Nair", event context only
2. Pipeline runs
3. **Status banner**: AMBIGUOUS
4. **Show candidates side by side**: Priya Nair (data scientist, Bengaluru) vs Priya Nair (designer, Pune)
5. **Show "why not stronger"**: "No separating evidence — both candidates have independent corroborating sources"
6. **Show "what would change this"**: "A mutual link between a candidate and the event would separate them"
7. **Wow moment**: The system doesn't guess. Two plausible candidates, no fabricated answer

### Minute 2:30–3:30 — Scenario C: No Digital Footprint

1. New case: sparse context, common name
2. Pipeline runs
3. **Status banner**: INSUFFICIENT EVIDENCE (green/neutral, not red/error)
4. **Show "what was checked"**: sources attempted, signals found (all WEAK), nothing corroborating
5. **Show "what is missing"**: no DISCRIMINATING signals, no independent clusters
6. **Wow moment**: This is intentional. The system checked and found nothing sufficient. "Unknown" is a first-class result, not a failure

### Minute 3:30–4:00 — Human review and copilot

1. On Scenario A: click "Reject" on a claim → reason field required → submit
2. Show review history (append-only, evidence not deleted)
3. Open copilot: ask "What evidence links Aarav to Meridian?" → cited answer with evidence IDs
4. Ask an out-of-scope question → refusal shown

### Minute 4:00–4:30 — Architecture and security highlights

1. Show the evidence graph with entity types and relationship edges
2. Highlight: "Every claim traces to a verbatim snippet — click any evidence card to see it"
3. Mention: "The LLM helped extract claims, but the status decision is deterministic — it's in `core/status.py`, 100% auditable"
4. Mention: "Prompt injection in source content? We tested it — Scenario D in our automated tests shows it's flagged and ignored"

## Expected outputs per scenario

| Scenario | Input | Expected status | Key evidence | Independence clusters |
|----------|-------|----------------|-------------|---------------------|
| A — Strong Match | Aarav Mehta, Meridian Institute, NEURAX Demo Day | STRONG MATCH | Mutual portfolio↔speaker link (DISCRIMINATING); institution listing (HIGH); publication (MEDIUM); 2 mirror copies (1 cluster) | ≥2 independent clusters |
| B — Ambiguous | Priya Nair, event only | AMBIGUOUS | Two candidates each with independent CORROBORATING evidence; no separating signal | ≥2 clusters per candidate |
| C — No Footprint | Sparse context | INSUFFICIENT EVIDENCE | Only WEAK signals (name similarity, username guess); nothing corroborating | 0–1 clusters |

## Automated test scenarios (not shown to judges)

| Scenario | Expected | Proves |
|----------|----------|--------|
| D — Poisoning/injection | Not STRONG MATCH; injection flagged | Prompt injection defense works; poisoned sources don't inflate confidence |
| E — Contradiction | LIKELY DIFFERENT | Hard contradiction (impossible timeline) blocks match |

## Failure fallbacks

| Failure | What happens | Judge sees |
|---------|-------------|-----------|
| LLM unavailable | Deterministic-only report with "AI narrative unavailable" banner | Report still shows matrix, status, evidence — just no narrative prose |
| Adapter refusal | Audited refusal shown in source list | "Source refused: domain not in allowlist" with audit timestamp |
| Empty results | Scenario C path | INSUFFICIENT EVIDENCE with "what was checked" |
| Slow LLM | Timeout at `LLM_TIMEOUT_SECONDS`, continue with available data | Pipeline completes with partial extraction |
| Network down | Demo runs in replay mode — no network needed | Full demo works offline |

## Judge Q&A — top 10 anticipated questions

| # | Question | Answer (2 sentences) |
|---|---------|---------------------|
| 1 | How do you prevent false matches from copied content? | We detect near-duplicate content via MinHash/shingling and group copies into independence clusters. Status decisions count clusters, not URLs — three copies of one source count as one confirmation. |
| 2 | What happens when the LLM hallucinates evidence? | Every extracted claim must have a verbatim snippet in the stored source text. Claims that fail snippet verification are dropped and counted in metrics. |
| 3 | Can someone inject instructions into a web page to manipulate results? | Web content passes through a sanitizer that flags injection patterns, and is wrapped in a randomized-delimiter data block. LLM output must parse into a strict Pydantic schema — page content never reaches tool selection or status logic. |
| 4 | Why no confidence score? | A single percentage implies calibrated probability, which we can't claim without labeled data. Our interpretable evidence matrix shows supporting, contradicting, and unresolved signals with tiers — judges can see exactly why a status was assigned. |
| 5 | How is this different from a reverse image search? | We don't search the web by face. The image is used for OCR (badge, name) and optionally compared to organizer-provided references. Identity is established through evidence chains, not face matching. |
| 6 | What if two candidates have equal evidence? | The system assigns AMBIGUOUS status and shows both candidates side by side with their evidence matrices. It doesn't guess — a judge can see what would separate them. |
| 7 | How do you handle privacy? | Consent is required before any processing. Only organizer-approved sources are fetched. EXIF is stripped from images. Data has retention limits. All actions are audit-logged. |
| 8 | Is the AI deciding the identity? | No. The LLM assists with text extraction, report narrative, and Q&A. The final status is computed by deterministic rules in `core/status.py` — auditable, configurable, and never overridden by the LLM. |
| 9 | Can this work with real data? | The architecture supports real data via the live adapter (disabled by default, allowlisted domains only). The MVP uses synthetic data to demonstrate the approach without privacy risk. |
| 10 | What technologies did you choose and why? | PostgreSQL for one reliable database (edge tables for the graph), FastAPI for async API, React + React Flow for the evidence graph UI. We rejected Neo4j (MVP doesn't need it), Redis (no caching needed), and face recognition (privacy violation). |
