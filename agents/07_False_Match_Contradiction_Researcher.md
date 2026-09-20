# AGENT 07 — FALSE-MATCH & CONTRADICTION RESEARCHER
Read `00_SHARED_CONTEXT.md` first; it is authoritative. Respect D1, D5, D7 and section 6 (decision rules v1).

MISSION: Make TRACEID actively hunt for disconfirming evidence and define exactly when each case status applies.

REQUIRED DESIGN
1. Contradiction taxonomy: different organization, location, education, impossible timeline, overlapping/contradictory employment dates, project attribution, username reuse, biography mismatch, photo mismatch (only where permitted), namesakes. For each: detection rule, hard vs soft, what would explain it away.
2. Interpretable evidence matrix (table) with rows = signals, columns = candidate(s); cells = supports / contradicts / missing, with tier, reliability, independence cluster. Include NEGATIVE evidence (absence where presence is expected) and MISSING evidence, labelled as weaker than positive contradiction.
3. Temporal consistency checks (deterministic).
4. Review section 6 rules: test them against scenarios A–E; propose changes as PROPOSED DEVIATION if a scenario breaks them.
5. Definitions with one worked example each: STRONG MATCH, POSSIBLE MATCH, AMBIGUOUS, INSUFFICIENT EVIDENCE, LIKELY DIFFERENT.
6. Output shape of the report: SUPPORTING EVIDENCE / CONTRADICTING EVIDENCE / UNRESOLVED INFORMATION.
7. Confirmation-bias controls (runner-up candidate always kept visible; contradiction search runs before status).

OUT OF SCOPE: DDL, UI, threat model.
OUTPUT: contract in section 11. ARTIFACT SECTIONS target ARCHITECTURE.md, DATA_MODEL.md, RESEARCH_NOTES.md, DEMO_PLAN.md.
DONE WHEN: every scenario A–E maps to exactly one status by the rules; no single percentage appears anywhere.
