"""Live search adapter for discovering public evidence via Tavily API.

Adheres to allowlist constraints, records fetch audits, and formats raw documents
for the sanitization pipeline.
"""

from __future__ import annotations

import datetime
from dataclasses import dataclass, field
import logging
from urllib.parse import urlparse

import httpx

from app.security.allowlist import is_allowed

logger = logging.getLogger("traceid.adapters.live_search")


@dataclass
class DiscoveredDocument:
    url: str
    domain: str
    title: str
    content_raw: str
    published_at: str = field(default_factory=lambda: datetime.datetime.now(datetime.UTC).isoformat())
    source_type: str = "WEB_PUBLIC"
    reliability: str = "MEDIUM"
    reliability_reason: str = "Public web source discovered via live search index."


class TavilySearchAdapter:
    """Discovers public sources using the Tavily Search API."""

    def __init__(
        self,
        api_key: str,
        allowed_domains: list[str] | None = None,
        timeout: int = 20,
    ) -> None:
        self.api_key = api_key
        self.allowed_domains = allowed_domains or []
        self.timeout = timeout

    def search(self, query: str, max_results: int = 5) -> list[DiscoveredDocument]:
        """Execute a live search query and return discovered web documents.

        Args:
            query: Public search query string.
            max_results: Max hits to return.

        Returns:
            List of DiscoveredDocument objects.
        """
        if not self.api_key:
            logger.warning("Tavily API key not configured; skipping live web discovery.")
            return []

        endpoint = "https://api.tavily.com/search"
        payload = {
            "api_key": self.api_key,
            "query": query,
            "search_depth": "advanced",
            "include_raw_content": True,
            "max_results": max_results,
        }

        try:
            with httpx.Client(timeout=float(self.timeout)) as client:
                resp = client.post(endpoint, json=payload)

            if resp.status_code != 200:
                logger.error("Tavily search failed with status %d: %s", resp.status_code, resp.text[:200])
                return []

            data = resp.json()
            results = data.get("results", [])
            documents: list[DiscoveredDocument] = []

            for item in results:
                url = item.get("url", "")
                if not url:
                    continue

                domain = urlparse(url).netloc.lower()
                # If domain allowlist is active (non-wildcard), verify it
                if self.allowed_domains and not any(d in ("*", "*.*", "*.example") for d in self.allowed_domains):
                    if not is_allowed(domain, self.allowed_domains).allowed:
                        logger.info("Skipping domain %s outside allowlist", domain)
                        continue

                title = item.get("title", "")
                content = item.get("content", "") or item.get("raw_content", "") or ""

                # Infer initial source type and reliability
                source_type = "WEB_PUBLIC"
                reliability = "MEDIUM"
                reason = "Public index search result"

                if domain.endswith(".edu") or domain.endswith(".gov"):
                    source_type = "INSTITUTIONAL_OFFICIAL"
                    reliability = "HIGH"
                    reason = "Verified educational or government domain"
                elif "linkedin.com" in domain or "github.com" in domain:
                    source_type = "SELF_AUTHORED_PROFILE"
                    reliability = "MEDIUM"
                    reason = "User-authored public professional/code profile"
                elif "wikipedia.org" in domain:
                    source_type = "COLLABORATIVE_ENCYCLOPEDIA"
                    reliability = "MEDIUM"
                    reason = "Public community-edited reference"

                doc = DiscoveredDocument(
                    url=url,
                    domain=domain,
                    title=title,
                    content_raw=content,
                    published_at=item.get("published_date") or datetime.datetime.now(datetime.UTC).isoformat(),
                    source_type=source_type,
                    reliability=reliability,
                    reliability_reason=reason,
                )
                documents.append(doc)

            return documents

        except Exception as e:
            logger.error("Error communicating with Tavily API: %s", e)
            return []
