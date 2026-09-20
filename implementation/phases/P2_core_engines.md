# P2 — Deterministic core engines (no DB, no network, no LLM)

PRECONDITIONS: P1 PASS. (P2 and P3 may run in parallel after P1; they share no files.)
READ FIRST: shared-context decisions D1, D5, D7, D9 as reflected in docs/ARCHITECTURE.md and docs/CONFIGURATION.md; rules/10 (I1, I2, I3, I10, I11, I13).

GOAL: The auditable brain. Pure functions over Pydantic/dataclass inputs.

TASKS (each in `backend/app/core/`, each with unit tests)
1. `reliability.py`: source type → tier (HIGH/MEDIUM/LOW) using the rubric in the docs; freshness adjustments if specified; returns tier + reason string.
2. `independence.py`: implement D9 layered method: same owner/domain merge; normalized-text near-duplicate detection (shingling + Jaccard/MinHash, threshold from config); attribution/“via” link edges; earliest-publication origin; conservative merge on uncertainty with `flag`. Output: clusters with origin source_id and member ids + reasons.
3. `resolution.py`: blocking + per-feature comparison (name, username, organization, education, location, bio, link relations); each feature yields a typed Signal(tier, direction, evidence_ids, cluster_id, reason); pair state per D1. Use rapidfuzz/jellyfish-style string similarity (verify package availability); embeddings are OPTIONAL and must not decide alone.
4. `contradiction.py`: rules over structured claims: different org/location/education, impossible timeline, overlapping employment, project attribution, username reuse; each returns Contradiction(kind, hard|soft, involved evidence ids, explained_away?).
5. `timeline.py`: order dated claims; flag impossible/overlapping periods.
6. `matrix.py`: build the evidence matrix (Supporting / Contradicting / Unresolved; missing/negative evidence labelled as weaker) — this is what API and UI show.
7. `status.py`: implement decision rules v1 exactly from the shared context/docs; thresholds from config; input = matrix + clusters + contradictions + candidate list; output = case status + machine-readable reasons + "what would change this". This is the ONLY place a case status is computed (I9).

ACCEPTANCE — golden unit cases (write them from the RULES, not tuned to pass)
- no evidence → INSUFFICIENT EVIDENCE (I1)
- one original + two verbatim copies → exactly 1 cluster; copies with attribution link → derived; unrelated pages → separate clusters (I2)
- two independent clusters + one DISCRIMINATING signal + no contradiction + margin → STRONG MATCH
- one cluster DISCRIMINATING only → POSSIBLE MATCH
- two candidates both POSSIBLE, no separating evidence → AMBIGUOUS
- impossible-timeline hard contradiction, not explained → LIKELY DIFFERENT; hard contradiction present ⇒ never STRONG/POSSIBLE (I3)
- only WEAK signals (name/username similarity) → INSUFFICIENT EVIDENCE
- matrix serialization has no single percentage field (I10)
- `pytest backend/tests/unit -q` and `make check` exit 0; paste the output

DO NOT: import DB/network/LLM code into `core/`; hardcode thresholds; let similarity of names alone exceed WEAK; invent probability math.
STOP AND ASK IF: a rule in docs is ambiguous enough to change a golden outcome; a threshold seems wrong (propose change, do not silently edit).
HANDOFF: gate report with a table of rules → tests + tag `p2-done`.
