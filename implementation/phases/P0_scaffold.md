# P0 — Scaffold and infrastructure

PRECONDITIONS: `docs/` contains all 13 approved documents. If any is missing or empty, STOP and report.
READ FIRST: AGENTS.md, rules/10–40, docs/PROJECT_STRUCTURE.md, docs/CONFIGURATION.md, docs/.env.example.

GOAL: A green, empty skeleton that every later phase builds on.

TASKS
1. Create the repo layout from rules/20 (folders with minimal `__init__.py`/placeholders only).
2. `docker-compose.yml`: PostgreSQL 16 (image with pgvector only if docs require embeddings), healthcheck, named volume.
3. Backend: FastAPI app with `GET /health` (returns status + config sanity, no secrets), `config.py` loading keys defined in docs/CONFIGURATION.md via Pydantic settings, structured logging.
4. Tooling: ruff, mypy (or pyright), pytest configured; pre-commit optional.
5. Makefile targets: setup, up, check, test, demo-scenarios (prints "not implemented yet" for now), reset-db.
6. Frontend: Vite + React + TS + Tailwind skeleton that builds; placeholder page only.
7. `.env.example` copied from docs; `.gitignore` excludes `.env`, DB volumes, node_modules, caches.
8. Copy `.agents/rules/*` and `AGENTS.md` into place if not already present.

FILES: docker-compose.yml, Makefile, backend/app/{main,config}.py, backend/pyproject.toml, frontend/*, .gitignore.

ACCEPTANCE (run and paste output)
- `make up` then `curl -s localhost:8000/health` returns 200 JSON
- `make check` exits 0
- `git status` shows no `.env` or secrets tracked

DO NOT: add any business logic, extra services, or dependencies beyond what the docs justify.
STOP AND ASK IF: docs disagree on ports, stack, or config keys.
HANDOFF: gate report + tag `p0-done`.
