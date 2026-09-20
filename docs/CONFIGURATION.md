# TRACEID — Configuration

Every tunable parameter in one place. Values are loaded via `backend/app/config.py` (Pydantic settings from environment variables).

## Configuration keys

| Key | Default | Type | Meaning | Owner |
|-----|---------|------|---------|-------|
| `DATABASE_URL` | `postgresql://traceid:traceid@localhost:5432/traceid` | str | PostgreSQL connection string | System |
| `API_HOST` | `0.0.0.0` | str | FastAPI bind host | System |
| `API_PORT` | `8000` | int | FastAPI bind port | System |
| `DEBUG` | `false` | bool | Enable debug logging | System |
| `LOG_LEVEL` | `INFO` | str | Structured log level | System |
| `DEMO_MODE` | `false` | bool | Enable demo mode (replay LLM, sandbox corpus only) | System |
| **Source adapters** | | | | |
| `ALLOWED_DOMAINS` | `["*.example"]` | list[str] | Approved domains for live fetching | Security |
| `SANDBOX_CORPUS_PATH` | `backend/seed/sandbox_corpus` | str | Path to synthetic scenario files | Adapters |
| `LIVE_ADAPTER_ENABLED` | `false` | bool | Enable live web fetching (disabled by default, D6) | Adapters |
| `ADAPTER_TIMEOUT_SECONDS` | `30` | int | HTTP fetch timeout per source | Adapters |
| `ADAPTER_RATE_LIMIT_PER_DOMAIN` | `5` | int | Max requests per domain per minute | Adapters |
| **Sanitizer** | | | | |
| `SANITIZE_MAX_LENGTH` | `50000` | int | Max character length after sanitization | Security |
| `INJECTION_PATTERNS` | `["ignore previous", "system prompt", "you are now", ...]` | list[str] | Patterns to flag as potential injection | Security |
| **Independence engine** | | | | |
| `INDEPENDENCE_SIMILARITY_THRESHOLD` | `0.85` | float | MinHash/Jaccard threshold for near-duplicate detection (D9) | Core |
| `INDEPENDENCE_SHINGLE_SIZE` | `5` | int | Character shingle size for content hashing | Core |
| `INDEPENDENCE_MERGE_ON_UNCERTAINTY` | `true` | bool | Conservative merge when derivation uncertain (D9) | Core |
| **Resolution engine** | | | | |
| `RESOLUTION_NAME_SIMILARITY_THRESHOLD` | `0.85` | float | String similarity threshold for name matching | Core |
| `RESOLUTION_USERNAME_SIMILARITY_THRESHOLD` | `0.90` | float | String similarity threshold for username matching | Core |
| `RESOLUTION_EMBEDDING_ENABLED` | `false` | bool | Enable optional embedding similarity (never decides alone) | Core |
| `RESOLUTION_EMBEDDING_WEIGHT` | `0.0` | float | Weight for embedding similarity (0.0 = disabled) | Core |
| **Status engine (decision rules v1)** | | | | |
| `STATUS_MIN_CLUSTERS_STRONG` | `2` | int | Minimum independent clusters for STRONG MATCH | Core |
| `STATUS_MIN_DISCRIMINATING_STRONG` | `1` | int | Minimum DISCRIMINATING signals for STRONG MATCH | Core |
| `STATUS_MARGIN_THRESHOLD` | `1` | int | Minimum signal advantage over runner-up for STRONG/POSSIBLE | Core |
| `STATUS_MIN_CLUSTERS_POSSIBLE` | `1` | int | Minimum clusters for POSSIBLE MATCH | Core |
| **Pipeline** | | | | |
| `MAX_ITERATIONS` | `3` | int | Maximum gap-loop iterations (D4) | Orchestrator |
| `PIPELINE_TIMEOUT_SECONDS` | `300` | int | Maximum total pipeline time | Orchestrator |
| **LLM provider** | | | | |
| `LLM_PROVIDER` | `mock` | str | Provider: `mock`, `replay`, `gemini`, `openai` | LLM |
| `LLM_API_KEY` | `` | str | API key for real LLM provider | LLM |
| `LLM_MODEL` | `gemini-2.5-flash` | str | Model name for real provider | LLM |
| `LLM_TEMPERATURE` | `0.1` | float | Low temperature for structured output | LLM |
| `LLM_TIMEOUT_SECONDS` | `60` | int | Per-call timeout | LLM |
| `LLM_MAX_RETRIES` | `2` | int | Max retries on schema validation failure | LLM |
| `LLM_REPLAY_DIR` | `backend/seed/llm_replays` | str | Directory for recorded LLM responses | LLM |
| `LLM_RECORD_MODE` | `false` | bool | Record LLM responses for replay | LLM |
| **Image handling (D2)** | | | | |
| `IMAGE_MAX_SIZE_BYTES` | `10485760` | int | Maximum image file size (10 MB) | Security |
| `IMAGE_STRIP_EXIF` | `true` | bool | Strip EXIF metadata on upload | Security |
| `FACE_SIMILARITY_ENABLED` | `false` | bool | Face similarity vs organizer reference (off by default, D2) | Core |
| `FACE_SIMILARITY_WEIGHT` | `0.0` | float | Weight (0.0 = disabled; never sufficient alone) | Core |
| **OCR** | | | | |
| `OCR_ENABLED` | `true` | bool | Enable OCR processing | Adapters |
| `OCR_ENGINE` | `tesseract` | str | OCR engine (`tesseract` or `fixture`) | Adapters |
| `OCR_FIXTURE_PATH` | `backend/seed/ocr_fixtures` | str | Fallback fixture path when Tesseract unavailable | Adapters |
| **Rate limiting** | | | | |
| `RATE_LIMIT_CASE_CREATE` | `10/minute` | str | Max case creations per client per minute | Security |
| `RATE_LIMIT_COPILOT` | `30/minute` | str | Max copilot queries per client per minute | Security |
| **Retention** | | | | |
| `DATA_RETENTION_DAYS` | `30` | int | Default data retention period | Security |
| `AUTO_DELETE_EXPIRED` | `false` | bool | Automatically delete expired investigations | Security |
| **Frontend** | | | | |
| `VITE_API_BASE_URL` | `http://localhost:8000` | str | Backend API URL for frontend | Frontend |
