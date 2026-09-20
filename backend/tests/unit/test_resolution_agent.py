"""Unit tests for Candidate Resolution & Disambiguation Agent."""

import pytest
from app.agents.resolution_agent import (
    cluster_and_score_candidates,
    synthesize_confident_timeline,
    _extract_year_and_range,
)


def test_extract_year_and_range():
    """Verify single year and year range parsing."""
    yr, end, disp = _extract_year_and_range("2018 - 2022")
    assert yr == 2018
    assert end == "2022"
    assert "2018 – 2022" in disp

    yr, end, disp = _extract_year_and_range("2021 - Present")
    assert yr == 2021
    assert end == "Present"

    yr, end, disp = _extract_year_and_range("Graduated in May 2020")
    assert yr == 2020
    assert end is None
    assert disp == "2020"


def test_disambiguate_multiple_namesakes():
    """Verify that multiple namesakes are clustered and the matching one is selected."""
    subject_name = "Harish"
    user_context = {
        "institution": "American High School",
        "role": "Software Engineer",
    }
    image_analysis = {
        "visible_text": ["American High", "Honor Roll"],
        "detected_logos": ["AHS Eagle Crest"],
        "detected_affiliations": ["American High School"],
        "detected_role": "Student Engineer",
    }

    # Sources representing 3 distinct real-world people with the same first name
    sources_with_claims = [
        # Candidate 1: The true target
        (
            "src-ahs-1",
            "americanhigh.edu",
            [
                {"attribute": "name", "value": "Harish", "snippet": "Harish is an alumnus of American High School."},
                {"attribute": "institution", "value": "American High School", "snippet": "American High School Honor Roll includes Harish."},
                {"attribute": "role", "value": "Software Engineer", "snippet": "Harish now works as Software Engineer."},
                {"attribute": "education", "value": "Computer Science", "snippet": "Studied Computer Science."},
            ],
        ),
        (
            "src-ahs-2",
            "github.com",
            [
                {"attribute": "name", "value": "Harish", "snippet": "Harish (American High School robotics lead)."},
                {"attribute": "company", "value": "American High School", "snippet": "Robotics team lead at American High School."},
                {"attribute": "role", "value": "Software Engineer", "snippet": "Software Engineer & Open Source Developer."},
            ],
        ),
        # Candidate 2: Unrelated Cardiologist
        (
            "src-mayo-1",
            "mayoclinic.org",
            [
                {"attribute": "name", "value": "Dr. Harish", "snippet": "Dr. Harish is a physician at Mayo Clinic."},
                {"attribute": "hospital", "value": "Mayo Clinic", "snippet": "Cardiologist at Mayo Clinic Rochester."},
                {"attribute": "role", "value": "Cardiologist", "snippet": "Board-certified Cardiologist."},
            ],
        ),
        # Candidate 3: Unrelated Musician
        (
            "src-spotify-1",
            "spotify.com",
            [
                {"attribute": "name", "value": "Harish", "snippet": "Harish is an indie vocalist and songwriter."},
                {"attribute": "role", "value": "Singer", "snippet": "Indie Pop Singer."},
                {"attribute": "location", "value": "Austin, TX", "snippet": "Singer based in Austin, TX."},
            ],
        ),
    ]

    evidence_items = [
        {"id": "ev-1", "source_id": "src-ahs-1"},
        {"id": "ev-2", "source_id": "src-ahs-2"},
        {"id": "ev-3", "source_id": "src-mayo-1"},
        {"id": "ev-4", "source_id": "src-spotify-1"},
    ]

    clusters = cluster_and_score_candidates(
        subject_name=subject_name,
        user_context=user_context,
        image_analysis=image_analysis,
        sources_with_claims=sources_with_claims,
        evidence_items=evidence_items,
    )

    # Must find distinct clusters
    assert len(clusters) >= 2

    # Winning candidate must be Candidate 1 (American High School / Software Engineer)
    winner = clusters[0]
    assert "American High" in winner.primary_organization
    assert "src-ahs-1" in winner.source_ids
    assert "src-ahs-2" in winner.source_ids
    assert winner.relevance_score > 80.0

    # Bio summary must be synthesized and articulate
    assert "Harish" in winner.bio_summary
    assert "American High School" in winner.bio_summary
    assert len(winner.relevance_reasons) >= 3

    # Unrelated candidates must be ranked lower
    other_orgs = [c.primary_organization for c in clusters[1:]]
    assert any("Mayo Clinic" in o for o in other_orgs) or any("Singer" in c.primary_role for c in clusters[1:])
    for other in clusters[1:]:
        assert other.relevance_score < winner.relevance_score


def test_synthesize_confident_timeline_chronological():
    """Verify that timeline claims are sorted chronologically ascending with date ranges."""
    claims = [
        {
            "attribute": "role",
            "value": "Staff Engineer",
            "snippet": "Promoted to Staff Engineer in 2024.",
            "date": "2024",
        },
        {
            "attribute": "education",
            "value": "B.S. in Computer Science",
            "snippet": "Studied Computer Science from 2016 to 2020.",
            "date": "2016 - 2020",
        },
        {
            "attribute": "role",
            "value": "Software Engineer",
            "snippet": "Joined as Software Engineer in 2020.",
            "date": "2020 - 2023",
        },
    ]

    evidence_items = [
        {"id": "ev-1", "snippet": "Promoted to Staff Engineer in 2024."},
        {"id": "ev-2", "snippet": "Studied Computer Science from 2016 to 2020."},
        {"id": "ev-3", "snippet": "Joined as Software Engineer in 2020."},
    ]

    events = synthesize_confident_timeline(claims, evidence_items)

    assert len(events) == 3
    # Check ascending order: 2016 -> 2020 -> 2024
    assert "2016" in events[0]["date"]
    assert events[0]["end_date"] == "2020"
    assert "2020" in events[1]["date"]
    assert "2024" in events[2]["date"]
