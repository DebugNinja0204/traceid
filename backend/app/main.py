"""TRACEID — FastAPI application entry point."""

from __future__ import annotations

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import router as api_router
from app.config import get_settings

# Structured logging setup
logging.basicConfig(
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
    level=logging.INFO,
    stream=sys.stdout,
)
logger = logging.getLogger("traceid")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown."""
    settings = get_settings()
    logger.info(
        "TRACEID starting — demo_mode=%s, llm_provider=%s",
        settings.DEMO_MODE,
        settings.LLM_PROVIDER,
    )

    # SerpApi configuration check — warns clearly if key is absent.
    # Application continues normally without it.
    if not settings.SERPAPI_API_KEY:
        logger.warning(
            "SerpApi is not configured. "
            "Add your SERPAPI_API_KEY to the .env file to enable "
            "enhanced web/social search."
        )
    else:
        logger.info("SerpApi adapter: configured ✓")

    yield
    logger.info("TRACEID shutting down")


app = FastAPI(
    title="TRACEID",
    description="Evidence-Based Digital Identity Intelligence",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
async def health():
    """Health check — returns status and config sanity (no secrets)."""
    settings = get_settings()
    return {
        "status": "ok",
        "version": "1.0.0",
        "demo_mode": settings.DEMO_MODE,
        "llm_provider": settings.LLM_PROVIDER,
        "database": "sqlite_wal_realtime",
        "live_adapter_enabled": settings.LIVE_ADAPTER_ENABLED,
        "face_similarity_enabled": settings.FACE_SIMILARITY_ENABLED,
        # SerpApi: only exposes configured boolean — never the key itself
        "serpapi_configured": bool(settings.SERPAPI_API_KEY),
        "serpapi_message": (
            "SerpApi ready."
            if settings.SERPAPI_API_KEY
            else (
                "SerpApi is not configured. "
                "Add your SERPAPI_API_KEY to the .env file to enable enhanced web/social search."
            )
        ),
    }
