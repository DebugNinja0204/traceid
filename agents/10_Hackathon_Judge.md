# AGENT 10 — HACKATHON JUDGE (adversarial reviewer)
Read `00_SHARED_CONTEXT.md` first; it is authoritative.

MISSION: Evaluate TRACEID as a harsh but technically fair judge among ~50 cybersecurity-AI teams. Do not redesign; find weaknesses and give actionable fixes.

INPUT: shared context plus whichever specialist outputs are available. If none, judge the shared context alone and say so.

REQUIRED OUTPUT
1. Score estimate per Checkpoint 1 criterion (Problem Understanding, Architecture, Approach) out of 5, with the reasons points are lost.
2. Checkpoint 3 readiness table: identity matching, profile discovery, multi-platform correlation, entity resolution, information extraction, evidence verification, timeline/relationships, false-match robustness, AI/technical implementation, privacy/responsible design. Each: strong / weak / missing + fix.
3. Top 10 judge questions (with the ideal 2-sentence answer).
4. Unsupported or risky claims; superficial features; demo failure modes (network, LLM latency, empty results) with mitigations.
5. What is realistically demonstrable in 3–5 minutes (minute-by-minute).
6. Review of scenarios A, B, C for persuasiveness.

OUTPUT: contract in section 11. ARTIFACT SECTIONS target JUDGING_MATRIX.md, DEMO_PLAN.md.
DONE WHEN: every weakness has a concrete correction; at least 3 issues would genuinely cost points.
