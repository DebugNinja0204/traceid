"""Independence engine tests — I2 invariant."""

from datetime import UTC, datetime

from app.core.independence import SourceInfo, compute_independence_clusters


def test_copies_count_once():
    """I2: N pages copying one original form exactly 1 cluster."""
    original_text = "Aarav Mehta is a researcher at Meridian Institute of Technology specializing in cybersecurity."
    # Two copies with identical text
    sources = [
        SourceInfo(
            source_id="s1", domain="meridian.example",
            owner="meridian", content_text=original_text,
            published_at=datetime(2024, 1, 1, tzinfo=UTC),
        ),
        SourceInfo(
            source_id="s2", domain="mirror1.example",
            owner="mirror1", content_text=original_text,
            published_at=datetime(2024, 3, 1, tzinfo=UTC),
        ),
        SourceInfo(
            source_id="s3", domain="mirror2.example",
            owner="mirror2", content_text=original_text,
            published_at=datetime(2024, 6, 1, tzinfo=UTC),
        ),
    ]
    clusters = compute_independence_clusters(sources, similarity_threshold=0.85)
    # All three should be in exactly 1 cluster
    assert len(clusters) == 1
    assert len(clusters[0].member_source_ids) == 3
    # Origin should be the earliest published
    assert clusters[0].origin_source_id == "s1"


def test_attribution_link_merges():
    """Sources with explicit attribution links merge into one cluster."""
    sources = [
        SourceInfo(
            source_id="s1", domain="original.example",
            content_text="Some unique content about research",
            published_at=datetime(2024, 1, 1, tzinfo=UTC),
        ),
        SourceInfo(
            source_id="s2", domain="copy.example",
            content_text="Slightly different paraphrase",
            attribution_links=["s1"],
            published_at=datetime(2024, 6, 1, tzinfo=UTC),
        ),
    ]
    clusters = compute_independence_clusters(sources)
    assert len(clusters) == 1


def test_independent_sources_separate():
    """Unrelated sources with different content stay in separate clusters."""
    sources = [
        SourceInfo(
            source_id="s1", domain="university.example",
            owner="university", content_text="Dr. Smith published a paper on machine learning.",
            published_at=datetime(2024, 1, 1, tzinfo=UTC),
        ),
        SourceInfo(
            source_id="s2", domain="conference.example",
            owner="conference", content_text="Speaker lineup includes keynote on quantum computing.",
            published_at=datetime(2024, 3, 1, tzinfo=UTC),
        ),
    ]
    clusters = compute_independence_clusters(sources, similarity_threshold=0.85)
    assert len(clusters) == 2


def test_same_domain_merges():
    """Layer 1: Same owner/domain → one cluster regardless of content."""
    sources = [
        SourceInfo(
            source_id="s1", domain="company.example",
            owner="company", content_text="Page one about the team.",
        ),
        SourceInfo(
            source_id="s2", domain="company.example",
            owner="company", content_text="Completely different page about products.",
        ),
    ]
    clusters = compute_independence_clusters(sources)
    assert len(clusters) == 1


def test_empty_sources():
    """No sources → no clusters."""
    clusters = compute_independence_clusters([])
    assert clusters == []
