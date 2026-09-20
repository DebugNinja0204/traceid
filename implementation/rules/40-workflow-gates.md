# Workflow and gates (applies to every phase)

## Protocol
1. PLAN: produce a short plan artifact: files to create/change, tests to add, risks, questions. Wait for approval if any question is open.
2. IMPLEMENT in small steps; commit after each green step with message `P<n>: <what>`.
3. TEST FIRST/WITH CODE for anything that touches an invariant.
4. GATE: run every command listed in the phase's ACCEPTANCE section. Paste the real output.
5. SELF-REVIEW against the phase's DO NOT list and the invariants table.
6. GATE REPORT (below). Stop. Do not start the next phase until told.

## Gate report format
```
PHASE: P<n>  RESULT: PASS | FAIL | BLOCKED
Commands run + real output (trimmed to the relevant lines)
Invariants touched: I# → test name → PASS/FAIL
Files created/changed (list)
Deviations from docs (list, or "none")
Known gaps / TODOs (honest list)
Questions for the human (or "none")
```

## Truthfulness rules
- Never write "tests pass", "works", or "done" without pasted output proving it.
- If a command fails, show the failure. Fix the cause; never disable, skip, or loosen a test or invariant to pass.
- Never invent a package, function, flag or API. Verify it exists (install, import, `--help`, read source/docs).
- If a doc is missing or contradictory, stop and report instead of improvising.
- Do not expand scope. Anything not in the phase's TASKS goes to the "Known gaps" list.

## Stop-and-ask triggers
An invariant would need to change · a doc conflicts with the phase prompt · a new dependency/service is needed · a test cannot be made deterministic · you are about to touch real personal data or a real website · two consecutive fix attempts fail on the same error (then stop, summarize what you tried, and ask).

## Definition of done (project)
`make check` green · `make demo-scenarios` shows A→STRONG MATCH, B→AMBIGUOUS, C→INSUFFICIENT EVIDENCE, D not STRONG with injection flagged, E→LIKELY DIFFERENT · demo runs offline in replay mode · docs updated to match reality · known limitations listed.
