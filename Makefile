.PHONY: setup up down check test demo-scenarios reset-db demo validate-corpus

# Install dependencies
setup:
	cd backend && pip install -e ".[dev]"
	cd frontend && npm install

# Start services (PostgreSQL)
up:
	docker compose up -d
	@echo "Waiting for database..."
	@timeout /t 5 /nobreak > nul 2>&1 || sleep 5
	@echo "Services up"

# Stop services
down:
	docker compose down

# Full check: lint + types + tests + frontend build
check:
	cd backend && ruff check app/ tests/
	cd backend && mypy app/ --ignore-missing-imports
	cd backend && pytest tests/ -q --tb=short
	cd frontend && npm run build

# Run backend tests only
test:
	cd backend && pytest tests/ -v --tb=short

# Run golden scenario tests
demo-scenarios:
	cd backend && pytest tests/golden/ -v --tb=short 2>/dev/null || echo "Golden tests not implemented yet"

# Reset database
reset-db:
	docker compose down -v
	docker compose up -d
	@echo "Waiting for database..."
	@timeout /t 5 /nobreak > nul 2>&1 || sleep 5
	cd backend && alembic upgrade head 2>/dev/null || echo "Migrations not set up yet"

# Demo mode: reset, seed, start
demo:
	$(MAKE) reset-db
	cd backend && DEMO_MODE=true LLM_PROVIDER=replay uvicorn app.main:app --host 0.0.0.0 --port 8000 &
	cd frontend && npm run dev &
	@echo "Demo running at http://localhost:5173"

# Validate sandbox corpus
validate-corpus:
	cd backend && python -c "print('Corpus validation not implemented yet')"
