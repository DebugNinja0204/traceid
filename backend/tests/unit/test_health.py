"""Health endpoint tests."""


def test_health_returns_200(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "1.0.0"
    assert "demo_mode" in data
    assert "llm_provider" in data


def test_health_no_secrets(client):
    """Health endpoint must not expose secrets."""
    response = client.get("/health")
    data = response.json()
    text = str(data)
    assert "api_key" not in text.lower()
    assert "password" not in text.lower()
    assert "secret" not in text.lower()
