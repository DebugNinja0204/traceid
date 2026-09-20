# Stack and structure

## Repository layout (follow docs/PROJECT_STRUCTURE.md if it differs; report differences)
```
traceid/
  AGENTS.md  Makefile  docker-compose.yml  .env.example  docs/
  backend/
    app/
      main.py  config.py
      api/        # thin routers only; no business logic
      core/       # DETERMINISTIC engines: reliability, independence, resolution, contradiction, timeline, matrix, status
      agents/     # LLM-assisted: planner, extraction, report, copilot (no status writes)
      llm/        # provider interface, mock, record/replay cache, schemas
      adapters/   # base, sandbox_corpus, live_allowlisted (disabled by default), ocr
      security/   # consent, allowlist, sanitize, audit, ratelimit
      orchestrator/  # state machine, loop control
      db/         # models, session, migrations
    seed/sandbox_corpus/{A,B,C,D,E}/  # synthetic pages + manifest
    tests/{unit,golden,security,e2e}/
  frontend/  # React + Vite + TS + Tailwind + React Flow
```

## Layering rules
- `core/` is pure Python over dataclasses/Pydantic models: no DB, no network, no LLM. Everything in it is unit-testable.
- `api/` calls the orchestrator or services; routers contain no logic beyond validation/serialization.
- `agents/` and `llm/` never import `core/status.py` writers.
- Adapters return raw documents only. They never call the LLM and never write to the DB.
- All thresholds and weights come from `config.py` (loaded from env/`CONFIGURATION.md` keys). No magic numbers in engines.

## Standards
- Type hints everywhere; `ruff` and `mypy` (or pyright) clean; Pydantic models for every boundary.
- Deterministic: seed RNGs; sort collections before hashing/comparing.
- Errors: fail closed. Unknown or invalid ⇒ INSUFFICIENT EVIDENCE / rejected output, never a guess.
- Logging: structured; never log raw images, secrets or full page bodies.
- Frontend: strict TypeScript; generate API types from the OpenAPI schema; every panel handles loading/empty/error/partial states.

## Commands
`make setup` (install deps) · `make up` (docker compose: Postgres) · `make check` · `make test` · `make demo-scenarios` (prints expected vs actual status for A–E) · `make reset-db`.

## Package hygiene
Before adding a dependency: confirm it exists and is maintained (run the install; read its docs/`--help`), pin the version, note it in `docs/RESEARCH_NOTES.md`. LangGraph is optional: use it only if it installs cleanly and reduces code; otherwise implement the explicit state machine in `orchestrator/`.
