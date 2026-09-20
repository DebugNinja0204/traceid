# P7 — Demo hardening, documentation sync, freeze

PRECONDITIONS: P5 and P6 PASS.
READ FIRST: docs/DEMO_PLAN.md, docs/JUDGING_MATRIX.md, rules/40.

GOAL: A demo that cannot fail on stage, and docs that match reality.

TASKS
1. Demo mode: `DEMO_MODE=replay` uses recorded LLM responses and the sandbox corpus; zero network; one-command start (`make demo`) that resets DB, seeds, starts services, and opens the app; one-command reset between runs.
2. Record all LLM responses for scenarios A–E and commit them as replay fixtures.
3. Fault drills (automated where possible): LLM unavailable → deterministic-only report with banner; adapter refusal → shown as an audited refusal; empty results → scenario C path; slow LLM → timeout and continue; malformed page → sanitizer path.
4. Timing: run the 3–5 minute demo script from DEMO_PLAN.md; record actual timings; trim.
5. Docs sync: update docs to match the implementation (endpoints, config keys, table names, commands). Add a "Known limitations" section (honest): synthetic corpus, thresholds tuned on synthetic data and not calibrated, English-language extraction only, etc.
6. Traceability table: each judging criterion → where it is demonstrated (screen/test/doc).
7. Final regression: `make check`, `make demo-scenarios`, invariants I1–I15 all green; tag `v1.0-demo`.

ACCEPTANCE
- `make demo` on a clean clone works with no API key and no internet; paste transcript
- Fault drills produce the documented behaviors
- All invariants I1–I15 pass; `make demo-scenarios` prints A→STRONG MATCH, B→AMBIGUOUS, C→INSUFFICIENT EVIDENCE, D not STRONG (flagged), E→LIKELY DIFFERENT
- Docs contain no claim the code does not back (spot-check 10 statements and list them)

DO NOT: add features; loosen tests; leave TODOs undocumented; claim accuracy figures.
HANDOFF: final gate report, demo script with timings, limitations list, tag `v1.0-demo`.
