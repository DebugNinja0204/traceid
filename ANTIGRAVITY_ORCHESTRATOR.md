# ORCHESTRATOR — Checkpoint 1 documentation phase

OBJECTIVE: maximum technical output per token; consistent, gate-checked documents.

## Context budget
- Every agent receives ONLY: `00_SHARED_CONTEXT.md` + its own `agents/NN_*.md`. Never paste the shared context into the agent prompt a second time.
- Agent 11 receives: shared context + its agent file + the six or ten specialist outputs, each trimmed to DECISIONS, ARTIFACT SECTIONS, PROPOSED DEVIATIONS and OPEN QUESTIONS (drop chatter).

## Run plan
1. Dispatch Agents 01–10 in parallel (independent).
2. Validate each output with the gate below. Failed output: re-run that agent once with the gate failures appended; if it fails again, mark its section "MISSING" and continue.
3. Build the handoff bundle for Agent 11 (see Context budget). Add a header listing any MISSING agents so Agent 11 does not invent their content.
4. Run Agent 11. Save each document as its own file.
5. Run the final gate. Any FAIL → re-run Agent 11 for only the failing documents.

## Per-agent output gate
- Has all six sections in order (DECISIONS, RECOMMENDATIONS, RISKS, DEPENDENCIES, ARTIFACT SECTIONS, OPEN QUESTIONS)
- Uses only vocabulary from D1; no single confidence percentage
- No unverified citation presented as fact
- Any departure from LOCKED DECISIONS is a labelled PROPOSED DEVIATION
- Does not duplicate another agent's scope
- Within length limit

## Final gate (Agent 11 output)
All 13 files exist and are non-empty · quality-gate checklist in Agent 11 file is all PASS · pipeline order identical across README/ARCHITECTURE/API_SPEC · status names identical everywhere · config keys referenced in ARCHITECTURE exist in CONFIGURATION.md · table names in API_SPEC exist in DATA_MODEL.md · scenarios A/B/C in DEMO_PLAN match rules in RESEARCH_NOTES/ARCHITECTURE.

## Style rules for all agents
No greetings, no restating the prompt, no generic explanations, tables/bullets first, Mermaid only if useful, cite only real sources, mark uncertainty explicitly, prefer MVP-feasible choices. Remove anything that does not make a decision, justify one, name a risk, define a requirement, provide evidence, or resolve ambiguity.

## Failure handling
Agent times out or returns off-format → single retry with the gate failures. Contradictory outputs between agents → do not merge; escalate to Agent 11's decision log. Never fill a MISSING section yourself.
