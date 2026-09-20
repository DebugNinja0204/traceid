# MASTER README PROMPT (give to Agent 11 together with 00_SHARED_CONTEXT.md and the specialist outputs)

ROLE: Chief Architect and technical writer for TRACEID, NEURAX Hackathon 3.0 (Domain 3, AI in Cybersecurity). Write the final README.md that judges read first: pitch plus index of the Checkpoint 1 documentation.

AUDIENCE/GOAL: technical judges reviewing ~50 teams, 2–3 minutes each. Maximize Problem Understanding (5), Architecture (5), Approach (5). Every section maps to at least one.

POSITIONING (verbatim near the top): "An evidence-first, explainable, multi-agent digital identity intelligence platform." Core principle: TRACEID does not identify a person at any cost; it decides whether authorized public evidence is sufficient. Insufficient evidence is a first-class outcome.

REQUIRED STRUCTURE (in order)
1. Title, positioning line, 3-line summary.
2. Problem understanding: why naive identity discovery fails (false matches, copied content, namesakes, poisoned sources, privacy harm); official problem in your own words.
3. Why common approaches fail and how TRACEID differs (table): generic scraper, reverse-image-search clone, single LLM prompt, URL aggregator, unexplained confidence score, face-recognition-only.
4. The 10 differentiators, one line each (what it does, why it matters).
5. Architecture: one Mermaid diagram (React workspace → FastAPI gateway with consent gate + allowlist → orchestrator with LLM-assisted agents vs deterministic core → source adapters, PostgreSQL, LLM provider) and the pipeline INPUT → CONSENT/VALIDATION → CANDIDATE GENERATION → SOURCE DISCOVERY → EVIDENCE EXTRACTION → ENTITY RESOLUTION → SOURCE RELIABILITY → SOURCE INDEPENDENCE → CONTRADICTION SEARCH → (gap loop) → TIMELINE/GRAPH → HUMAN REVIEW → FINAL STATUS.
6. Where AI belongs: table of LLM / embeddings / deterministic rules / human per stage. State that reliability, independence, contradiction rules and status are deterministic and auditable; the LLM never issues the verdict.
7. Evidence-first model and source independence (A publishes, B and C copy → ONE confirmation).
8. Decision model: pair states and case statuses defined in one sentence each; the interpretable evidence matrix (supporting / contradicting / unresolved). No single confidence percentage.
9. Security, privacy and responsible design: consent gate, allowlist, public/synthetic data only, no private accounts/leaked data/credentials/bypass, webpages as untrusted data, minimization, retention, audit, human review; link THREAT_MODEL.md. State the image-handling decision (D2).
10. Demo scenarios (3–5 min): A, B, C — input, what the judge sees, what it proves. Synthetic data only.
11. MVP vs roadmap; justify each technology; list what was NOT used and why.
12. Documentation index: all 13 files, one line each.
13. Scoring map: README sections → Problem Understanding / Architecture / Approach.
14. Honest limitations.

HARD RULES: no unsupported claims; no fabricated citations, statistics or accuracy numbers; no identity-certainty or real-time-scale claims; no technology without a justified role; consistent terminology with all other docs; documentation only.
STYLE: professional, dense, tables and bullets, sentence-case headings, 900–1300 words plus diagram.
OUTPUT: README.md content only, in Markdown.
