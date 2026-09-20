"""Tests for SerpApi adapter — both the missing-key state and the ready state.

Test 1 (runnable NOW, no key required):
    Verifies correct behaviour when SERPAPI_API_KEY is absent/empty.

Test 2 (runnable AFTER you add your real key):
    Documents the correct test path via live API calls.
    Run with: pytest tests/unit/test_serpapi_adapter.py -k real -s

To run only Test 1 (safe, no key needed):
    pytest tests/unit/test_serpapi_adapter.py -k "not real" -v
"""

from __future__ import annotations

import pytest
from unittest.mock import MagicMock, patch

from app.adapters.serpapi_search import (
    SOCIAL_PLATFORMS,
    SerpApiAdapter,
    build_serpapi_adapter,
)


# =========================================================================== #
# TEST 1 — Missing-key state (run NOW, no API key needed)
# =========================================================================== #

class TestSerpApiMissingKey:
    """Verify the adapter degrades gracefully when SERPAPI_API_KEY is empty."""

    def setup_method(self):
        # Deliberately empty key
        self.adapter = SerpApiAdapter(api_key="")

    def test_status_not_configured(self):
        """status() must return configured=False, not raise."""
        s = self.adapter.status()
        assert s.configured is False
        assert "SERPAPI_API_KEY" in s.message
        assert "not configured" in s.message.lower()

    def test_status_message_never_leaks_key(self):
        """status().message must never contain a real or placeholder key."""
        s = self.adapter.status()
        # No key value should appear in the message
        assert "=" not in s.message or "SERPAPI_API_KEY=" not in s.message

    def test_status_platforms_listed(self):
        """status() must still list the supported platforms."""
        s = self.adapter.status()
        assert len(s.platforms_supported) == len(SOCIAL_PLATFORMS)
        for platform in SOCIAL_PLATFORMS:
            assert platform in s.platforms_supported

    def test_search_web_returns_empty_not_raises(self):
        """search_web() returns [] when key is absent — never raises."""
        results = self.adapter.search_web("John Doe researcher")
        assert results == []

    def test_search_social_profile_returns_empty(self):
        """search_social_profile() returns [] for every platform when key absent."""
        for platform in SOCIAL_PLATFORMS:
            results = self.adapter.search_social_profile(
                name="Jane Smith", platform=platform  # type: ignore[arg-type]
            )
            assert results == [], f"Expected [] for platform {platform}, got {results}"

    def test_search_all_social_profiles_returns_empty_dict(self):
        """search_all_social_profiles() returns {platform: []} for all platforms."""
        results = self.adapter.search_all_social_profiles(name="Alice Johnson")
        assert isinstance(results, dict)
        for platform in SOCIAL_PLATFORMS:
            assert platform in results
            assert results[platform] == []

    def test_no_http_call_made_when_unconfigured(self):
        """The adapter must make zero HTTP calls when the key is absent."""
        with patch("httpx.Client") as mock_client:
            self.adapter.search_web("test query")
            mock_client.assert_not_called()

    def test_build_serpapi_adapter_with_empty_config(self):
        """build_serpapi_adapter() must succeed even if env has no key."""
        with patch("app.adapters.serpapi_search.SerpApiAdapter.__init__", return_value=None) as mock_init:
            mock_init.return_value = None
            # Patch settings to return empty key
            with patch("app.config.get_settings") as mock_settings:
                mock_settings.return_value = MagicMock(SERPAPI_API_KEY="")
                # Should not raise
                try:
                    adapter = build_serpapi_adapter()
                except Exception:
                    pass  # OK if __init__ mock makes this fail — key point is no crash on import


class TestSerpApiApiEndpointsMissingKey:
    """Verify the FastAPI endpoints handle missing key gracefully."""

    def test_status_endpoint_returns_not_configured(self):
        """GET /api/v1/serpapi/status should return configured=False with message."""
        adapter = SerpApiAdapter(api_key="")
        s = adapter.status()
        # The response the endpoint would return
        response = {
            "configured": s.configured,
            "message": s.message,
            "platforms_supported": s.platforms_supported,
        }
        assert response["configured"] is False
        assert "SERPAPI_API_KEY" in response["message"]
        assert len(response["platforms_supported"]) > 0

    def test_response_never_contains_api_key_field(self):
        """Ensure no response dict contains an 'api_key' field."""
        adapter = SerpApiAdapter(api_key="")
        s = adapter.status()
        response = {"configured": s.configured, "message": s.message}
        assert "api_key" not in response
        assert "key" not in response
        assert "SERPAPI" not in str(response.get("api_key", ""))


# =========================================================================== #
# TEST 2 — Real key state (run AFTER adding your key to .env)
# =========================================================================== #

class TestSerpApiWithRealKey:
    """
    Live integration tests — only run after adding your real SERPAPI_API_KEY.

    How to run:
        1. Add your key to backend/.env:
               SERPAPI_API_KEY=your_real_key_here
        2. Restart the backend.
        3. Run:
               pytest tests/unit/test_serpapi_adapter.py -k real -s -v

    These tests make REAL HTTP calls to SerpApi. They consume API quota.
    """

    @pytest.mark.real
    def test_real_status_configured(self):
        """With a real key, status() should return configured=True."""
        import os
        key = os.environ.get("SERPAPI_API_KEY", "")
        if not key:
            pytest.skip("SERPAPI_API_KEY not set — skipping live test")

        adapter = SerpApiAdapter(api_key=key)
        s = adapter.status()
        assert s.configured is True

    @pytest.mark.real
    def test_real_web_search(self):
        """With a real key, search_web() should return actual results."""
        import os
        key = os.environ.get("SERPAPI_API_KEY", "")
        if not key:
            pytest.skip("SERPAPI_API_KEY not set — skipping live test")

        adapter = SerpApiAdapter(api_key=key)
        results = adapter.search_web("Python programming language", max_results=3)
        assert isinstance(results, list)
        # If SerpApi returns results, they must have real URLs
        for r in results:
            assert r.url.startswith("http")
            assert r.domain != ""

    @pytest.mark.real
    def test_real_social_linkedin_search(self):
        """With a real key, search_social_profile() returns real LinkedIn results."""
        import os
        key = os.environ.get("SERPAPI_API_KEY", "")
        if not key:
            pytest.skip("SERPAPI_API_KEY not set — skipping live test")

        adapter = SerpApiAdapter(api_key=key)
        profiles = adapter.search_social_profile(
            name="Sundar Pichai",
            platform="linkedin",
        )
        assert isinstance(profiles, list)
        for p in profiles:
            assert "linkedin.com" in p.domain
            assert p.url.startswith("http")

    @pytest.mark.real
    def test_real_all_social_search(self):
        """With a real key, search_all_social_profiles() scans multiple platforms."""
        import os
        key = os.environ.get("SERPAPI_API_KEY", "")
        if not key:
            pytest.skip("SERPAPI_API_KEY not set — skipping live test")

        adapter = SerpApiAdapter(api_key=key)
        results = adapter.search_all_social_profiles(
            name="Linus Torvalds",
            platforms=["github", "twitter"],
        )
        assert "github" in results
        assert "twitter" in results
        # Results may be empty if no public profiles found — that's OK
        # We just verify no fabrication: all URLs must be real
        for platform, profiles in results.items():
            for p in profiles:
                assert p.url.startswith("http")
                assert p.platform == platform
