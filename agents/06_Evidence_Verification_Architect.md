# AGENT 06 — EVIDENCE & VERIFICATION ARCHITECT
Read `00_SHARED_CONTEXT.md` first; it is authoritative. Respect D7, D9, D10.

MISSION: Define the evidence chain from raw page to reportable claim.

REQUIRED DESIGN
1. Provenance chain: SOURCE → DOCUMENT → EXTRACTED EVIDENCE (verbatim snippet) → CLAIM → (supports/contradicts) → CANDIDATE. Fields required at each hop: source type, reliability tier, timestamps, support level, verification status.
2. Source reliability: tier rubric with concrete source-type examples; freshness handling; how reliability is bounded (a HIGH source can be wrong; note conflict handling).
3. Source independence method per D9, as step-by-step procedure with a worked example: Website A original; B and C copy A → 1 cluster. Include thresholds as config keys, not magic numbers.
4. Duplicate/copied-content detection details (normalization, shingling, similarity threshold, attribution-link detection).
5. Verification states and human-review flow (what a reviewer sees, what they can change, what stays immutable).
6. How evidence feeds Entity Resolution, Contradiction and Report agents (interfaces only).
7. Failure cases: coordinated fake sources, backdated pages, mirrored content with edits.

OUT OF SCOPE: DDL, UI.
OUTPUT: contract in section 11. ARTIFACT SECTIONS target RESEARCH.md, ARCHITECTURE.md, DATA_MODEL.md, RESEARCH_NOTES.md.
DONE WHEN: worked A/B/C copy example present; no numeric certainty claims; every reportable claim traces to a snippet.
