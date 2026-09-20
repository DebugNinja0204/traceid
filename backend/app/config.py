"""TRACEID configuration â€” loaded from environment via Pydantic settings.
All keys documented in docs/CONFIGURATION.md.
"""

from __future__ import annotations

import json

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://traceid:traceid@localhost:5432/traceid"
    DATABASE_URL_SYNC: str = "postgresql://traceid:traceid@localhost:5432/traceid"
    SQLITE_DB_PATH: str = "traceid.db"

    # API Server
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    # Demo mode
    DEMO_MODE: bool = False

    # Source adapters
    ALLOWED_DOMAINS: list[str] = ["*.example"]
    SANDBOX_CORPUS_PATH: str = "backend/seed/sandbox_corpus"
    LIVE_ADAPTER_ENABLED: bool = False
    ADAPTER_TIMEOUT_SECONDS: int = 30
    ADAPTER_RATE_LIMIT_PER_DOMAIN: int = 5
    TAVILY_API_KEY: str = ""
    SERPAPI_API_KEY: str = ""  # Optional — enables enhanced web/social search via SerpApi

    # Sanitizer
    SANITIZE_MAX_LENGTH: int = 50000

    # Independence engine
    INDEPENDENCE_SIMILARITY_THRESHOLD: float = 0.85
    INDEPENDENCE_SHINGLE_SIZE: int = 5
    INDEPENDENCE_MERGE_ON_UNCERTAINTY: bool = True

    # Resolution engine
    RESOLUTION_NAME_SIMILARITY_THRESHOLD: float = 0.85
    RESOLUTION_USERNAME_SIMILARITY_THRESHOLD: float = 0.90
    RESOLUTION_EMBEDDING_ENABLED: bool = False
    RESOLUTION_EMBEDDING_WEIGHT: float = 0.0

    # Status engine (decision rules v1)
    STATUS_MIN_CLUSTERS_STRONG: int = 2
    STATUS_MIN_DISCRIMINATING_STRONG: int = 1
    STATUS_MARGIN_THRESHOLD: int = 1
    STATUS_MIN_CLUSTERS_POSSIBLE: int = 1

    # Pipeline
    MAX_ITERATIONS: int = 3
    PIPELINE_TIMEOUT_SECONDS: int = 300

    # LLM provider
    LLM_PROVIDER: str = "mock"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gemini-3.5-flash-lite"
    LLM_TEMPERATURE: float = 0.1
    LLM_TIMEOUT_SECONDS: int = 60
    LLM_MAX_RETRIES: int = 2
    LLM_REPLAY_DIR: str = "backend/seed/llm_replays"
    LLM_RECORD_MODE: bool = False

    # Image handling (D2)
    IMAGE_MAX_SIZE_BYTES: int = 10_485_760
    IMAGE_STRIP_EXIF: bool = True
    FACE_SIMILARITY_ENABLED: bool = False
    FACE_SIMILARITY_WEIGHT: float = 0.0

    # OCR
    OCR_ENABLED: bool = True
    OCR_ENGINE: str = "tesseract"
    OCR_FIXTURE_PATH: str = "backend/seed/ocr_fixtures"

    # Rate limiting
    RATE_LIMIT_CASE_CREATE: str = "10/minute"
    RATE_LIMIT_COPILOT: str = "30/minute"

    # Retention
    DATA_RETENTION_DAYS: int = 30
    AUTO_DELETE_EXPIRED: bool = False

    # Frontend
    VITE_API_BASE_URL: str = "http://localhost:8000"

    @field_validator("ALLOWED_DOMAINS", mode="before")
    @classmethod
    def parse_allowed_domains(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return list(json.loads(v))
        return list(v)

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()
