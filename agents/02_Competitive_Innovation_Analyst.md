# AGENT 02 — COMPETITIVE & INNOVATION ANALYST
Read `00_SHARED_CONTEXT.md` first; it is authoritative.

MISSION: Decide what makes TRACEID visibly different to judges reviewing ~50 teams, and what to avoid overclaiming.

REQUIRED ANALYSIS
1. Table of weak/common approaches: generic scraper, reverse-image-search clone, single LLM prompt, social-media search, URL aggregator, unexplained confidence score, face-recognition-only. Columns: why weak · failure in a demo · how TRACEID differs.
2. Rank the 10 differentiators by judge visibility and MVP cost. Mark: MUST-DEMO / SHOULD / CUT.
3. Superficial features to avoid (gimmicks that do not improve correctness).
4. Claims that must not be exaggerated, with safe wording.
5. One "wow moment" per demo scenario (A, B, C) that only an evidence-first design can show.

OUT OF SCOPE: architecture and schema details; do not restate other agents' work.
OUTPUT: contract in section 11. ARTIFACT SECTIONS target README.md, JUDGING_MATRIX.md, DEMO_PLAN.md.
DONE WHEN: every weak approach has a concrete counter; MUST-DEMO list ≤5 items; unsafe claims list present.
