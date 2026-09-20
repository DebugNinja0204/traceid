# Implementation guide — running TRACEID in Google Antigravity

No prompt is failproof. This setup makes failure visible and cheap: invariants are tests, phases are gated, the agent must paste real command output, and recovery prompts are ready.

## 1. Setup (once)
1. Create the repo. Put the 13 approved Checkpoint 1 docs in `docs/`.
2. Copy `implementation/AGENTS.md` to the repo root.
3. Copy `implementation/rules/*.md` to `.agents/rules/` (Antigravity 2.0 documents `.agents/rules`; older builds use `.agent/rules`, and the CLI reads `AGENTS.md`/`GEMINI.md`). Set all four rules to Always On. Each file is well under the documented 12,000-character rule limit. Verify the location and activation mode in your installed version's Rules/Customizations panel.
4. Keep `implementation/phases/*.md` outside the rules folder; paste one phase at a time as the task prompt.
5. Model choice: use the strongest reasoning setting for P2, P4, P5; a faster model is fine for P0, P6 UI polish and P7 chores.

## 2. Phase graph
```
P0 → P1 → ( P2 ∥ P3 ) → P4 → P5 → P7
                              ↘ P6 (start once frontend/openapi.json is frozen) ↗
```
Run P2 and P3 as separate agents in the Manager view (no shared files). Everything else is sequential. Never run two agents on the same folder.

## 3. Per-phase procedure
1. Paste the phase file as the task. Add one line: "Follow AGENTS.md and .agents/rules. Produce a plan first and wait for my approval."
2. Review the plan artifact: files, tests, questions, deviations. Answer or reject.
3. Approve. Let it implement.
4. Read the gate report. Check that command output is pasted and that invariants touched show PASS.
5. Run the acceptance commands yourself once: `make check` (+ `make demo-scenarios` from P5).
6. Tag the commit (`p<n>-done`). Only then start the next phase.

## 4. Review checklist (2 minutes per phase)
- Any test skipped, xfailed, deleted, or loosened? (search the diff)
- Any new dependency or service not in the docs?
- Any magic-number threshold outside `config.py`?
- Any import of the status writer from `agents/` or `llm/`?
- Any real name, real URL, key, or `.env` in the diff?
- Does the gate report contain "Known gaps"? (An empty list is suspicious.)

## 5. Recovery prompts (paste when needed)
**Test loop / repeated failure**
"Stop. Do not change tests or invariants. In 5 lines: the failing command, the exact error, your hypothesis, what you tried, what you will try next. If two attempts have failed, list options and wait for me."

**Claims done without proof**
"You reported completion without command output. Re-run every ACCEPTANCE command from the phase file and paste the raw output. Mark anything you cannot run as BLOCKED."

**Scope creep**
"Revert everything not listed under TASKS for this phase. Move it to 'Known gaps'. Confirm with `git diff --stat`."

**Invented package/API**
"Verify every third-party symbol you used: install the package, import it, print its version, and show the signature or docs you relied on. Replace anything you cannot verify."

**Doc/code conflict**
"Stop coding. Show the conflicting doc lines and the code lines side by side. Propose a diff to the docs or to the code and wait for my choice."

**Context drift / forgot rules**
"Re-read AGENTS.md and .agents/rules/10-invariants.md. List which invariants your current changes touch and the test for each. Then continue."

**Weakened invariant**
"You changed an invariant test. Revert it. If you believe the invariant is wrong, write the argument and wait for my decision."

## 6. What the final demo must prove
A Strong Match with mirror copies counted once · B Ambiguous with both candidates visible · C Insufficient evidence shown as an intentional result · D poisoning/injection ignored and flagged · E contradiction blocks a match · offline replay mode works · every claim traces to a snippet.
