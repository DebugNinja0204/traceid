"""SerpApi adapter — enhanced web and social-profile discovery.

Architecture:
    Frontend  →  Our Backend (this adapter)  →  SerpApi
    The API key NEVER leaves the backend. It is never sent to the frontend
    or stored in any response payload.

Usage:
    Configure SERPAPI_API_KEY in backend/.env to enable this adapter.
    If the key is absent or empty, all methods return empty results and
    log a clear configuration warning — the application continues normally.

Supported search functions:
    - search_web()              General web search
    - search_social_profile()   Single platform profile search
    - search_all_social_profiles()  Scan all supported platforms at once
"""

from __future__ import annotations

import datetime
import logging
from dataclasses import dataclass, field
from typing import Literal
from urllib.parse import urlparse

import httpx

logger = logging.getLogger("traceid.adapters.serpapi")

# --------------------------------------------------------------------------- #
# Supported social platforms and their site: search patterns
# --------------------------------------------------------------------------- #

SOCIAL_PLATFORMS: dict[str, str] = {
    "instagram": "site:instagram.com",
    "youtube": "site:youtube.com",
    "linkedin": "site:linkedin.com/in",
    "github": "site:github.com",
    "twitter": "site:x.com OR site:twitter.com",
    "facebook": "site:facebook.com",
    "tiktok": "site:tiktok.com",
    "reddit": "site:reddit.com/user",
}

_SERPAPI_ENDPOINT = "https://serpapi.com/search"

SocialPlatform = Literal[
    "instagram", "youtube", "linkedin", "github",
    "twitter", "facebook", "tiktok", "reddit",
]


# --------------------------------------------------------------------------- #
# Result dataclasses
# --------------------------------------------------------------------------- #

@dataclass
class WebResult:
    """A single organic search result from SerpApi."""
    url: str
    domain: str
    title: str
    snippet: str
    position: int
    platform: str = "WEB"
    retrieved_at: str = field(
        default_factory=lambda: datetime.datetime.now(datetime.UTC).isoformat()
    )


@dataclass
class SocialProfileResult:
    """A discovered social-media profile."""
    platform: str
    url: str
    domain: str
    title: str
    snippet: str
    retrieved_at: str = field(
        default_factory=lambda: datetime.datetime.now(datetime.UTC).isoformat()
    )


@dataclass
class SerpApiStatus:
    """Configuration / availability status — safe to send to frontend."""
    configured: bool
    message: str
    platforms_supported: list[str] = field(
        default_factory=lambda: list(SOCIAL_PLATFORMS.keys())
    )


# --------------------------------------------------------------------------- #
# Main adapter
# --------------------------------------------------------------------------- #

class SerpApiAdapter:
    """Reusable SerpApi client for TRACEID.

    Instantiate with the key from config.SERPAPI_API_KEY.
    If the key is empty the adapter operates in disabled mode: all search
    methods return empty lists, status() returns configured=False with a
    helpful message, and NO exception is raised.
    """

    def __init__(self, api_key: str, timeout: int = 20) -> None:
        # Store the key privately — it is never logged or returned to callers.
        self._api_key = api_key
        self._timeout = timeout
        self._configured = bool(api_key and api_key.strip())

        if not self._configured:
            logger.warning(
                "SerpApi is not configured. "
                "Add your SERPAPI_API_KEY to the .env file to enable "
                "enhanced web/social search."
            )

    # ---------------------------------------------------------------------- #
    # Public API
    # ---------------------------------------------------------------------- #

    def status(self) -> SerpApiStatus:
        """Return configuration status — safe to expose to frontend (no key)."""
        if self._configured:
            return SerpApiStatus(
                configured=True,
                message="SerpApi is configured and ready.",
            )
        return SerpApiStatus(
            configured=False,
            message=(
                "SerpApi is not configured. "
                "Add your SERPAPI_API_KEY to the .env file to enable "
                "enhanced web/social search."
            ),
        )

    def search_web(
        self,
        query: str,
        max_results: int = 10,
    ) -> list[WebResult]:
        """Execute a general web search.

        Args:
            query:       The search query string.
            max_results: Maximum number of organic results to return.

        Returns:
            List of WebResult objects. Empty list if not configured or no results.
        """
        if not self._configured:
            logger.info("SerpApi web search skipped — adapter not configured.")
            return []

        raw = self._call_serpapi({"q": query, "num": max_results})
        return self._parse_web_results(raw, platform="WEB")

    def search_social_profile(
        self,
        name: str,
        platform: SocialPlatform,
        extra_terms: str = "",
    ) -> list[SocialProfileResult]:
        """Search for a person's profile on a specific social platform.

        Builds a site-scoped query such as:
            site:linkedin.com/in "John Doe" company_name

        Args:
            name:        Full name or username to search.
            platform:    One of the supported platform keys.
            extra_terms: Optional additional context (company, location, etc.).

        Returns:
            List of SocialProfileResult objects.
        """
        if not self._configured:
            logger.info("SerpApi social search skipped — adapter not configured.")
            return []

        site_filter = SOCIAL_PLATFORMS.get(platform, "")
        if not site_filter:
            logger.warning("Unknown platform: %s", platform)
            return []

        query_parts = [site_filter, f'"{name}"']
        if extra_terms:
            query_parts.append(extra_terms)
        query = " ".join(query_parts)

        raw = self._call_serpapi({"q": query, "num": 5})
        web_results = self._parse_web_results(raw, platform=platform)

        return [
            SocialProfileResult(
                platform=platform,
                url=r.url,
                domain=r.domain,
                title=r.title,
                snippet=r.snippet,
                retrieved_at=r.retrieved_at,
            )
            for r in web_results
        ]

    def search_all_social_profiles(
        self,
        name: str,
        extra_terms: str = "",
        platforms: list[SocialPlatform] | None = None,
    ) -> dict[str, list[SocialProfileResult]]:
        """Scan multiple social platforms for a person's profiles.

        Args:
            name:        Full name or username to search.
            extra_terms: Optional additional context (company, location, etc.).
            platforms:   Subset of platforms to search. Defaults to all supported.

        Returns:
            Dict mapping platform name → list of SocialProfileResult objects.
            Platforms with no results return an empty list (not omitted).
            Never fabricates results — if SerpApi returns nothing, returns [].
        """
        if not self._configured:
            logger.info("SerpApi multi-platform search skipped — adapter not configured.")
            return {p: [] for p in (platforms or list(SOCIAL_PLATFORMS.keys()))}

        target_platforms: list[str] = platforms or list(SOCIAL_PLATFORMS.keys())
        results: dict[str, list[SocialProfileResult]] = {}

        for platform in target_platforms:
            try:
                results[platform] = self.search_social_profile(
                    name=name,
                    platform=platform,  # type: ignore[arg-type]
                    extra_terms=extra_terms,
                )
            except Exception as exc:
                logger.error(
                    "SerpApi error searching platform %s for %r: %s",
                    platform,
                    name,
                    exc,
                )
                results[platform] = []

        return results

    # ---------------------------------------------------------------------- #
    # Internal helpers
    # ---------------------------------------------------------------------- #

    def _call_serpapi(self, params: dict) -> dict:
        """Make a GET request to SerpApi. Returns raw JSON dict or empty dict on error.

        The API key is injected here only — it never appears in logs or responses.
        """
        request_params = {
            **params,
            "api_key": self._api_key,  # Added server-side only
            "engine": "google",
            "hl": "en",
            "gl": "us",
        }

        try:
            with httpx.Client(timeout=float(self._timeout)) as client:
                resp = client.get(_SERPAPI_ENDPOINT, params=request_params)

            if resp.status_code == 401:
                logger.error(
                    "SerpApi authentication failed. "
                    "Check that SERPAPI_API_KEY in .env is valid."
                )
                return {}

            if resp.status_code == 429:
                logger.warning("SerpApi rate limit reached.")
                return {}

            if resp.status_code != 200:
                logger.error(
                    "SerpApi returned HTTP %d. Response: %s",
                    resp.status_code,
                    resp.text[:300],
                )
                return {}

            return resp.json()

        except httpx.TimeoutException:
            logger.error("SerpApi request timed out after %ds.", self._timeout)
            return {}
        except Exception as exc:
            logger.error("SerpApi request failed: %s", exc)
            return {}

    @staticmethod
    def _parse_web_results(raw: dict, platform: str = "WEB") -> list[WebResult]:
        """Extract organic_results from a SerpApi response.

        Never fabricates data — returns only what SerpApi actually returned.
        """
        organic = raw.get("organic_results", [])
        results: list[WebResult] = []

        for i, item in enumerate(organic):
            url = item.get("link", "")
            if not url:
                continue
            domain = urlparse(url).netloc.lower()
            results.append(
                WebResult(
                    url=url,
                    domain=domain,
                    title=item.get("title", ""),
                    snippet=item.get("snippet", ""),
                    position=i + 1,
                    platform=platform,
                )
            )

        return results


# --------------------------------------------------------------------------- #
# Module-level factory — builds adapter from app config
# --------------------------------------------------------------------------- #

def build_serpapi_adapter() -> SerpApiAdapter:
    """Build a SerpApiAdapter from the application's config settings.

    Always returns a valid adapter object. If SERPAPI_API_KEY is empty,
    the adapter runs in disabled mode (no crash, clear warning logged).
    """
    from app.config import get_settings
    settings = get_settings()
    return SerpApiAdapter(api_key=settings.SERPAPI_API_KEY)
