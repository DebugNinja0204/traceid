"""Candidate Resolution & Disambiguation Agent.

Clusters multi-source web claims into distinct candidate identities, scores each
candidate against the user's keywords and uploaded photo context, selects the single
most relatable primary candidate (with runner-up if ambiguous per I13), and filters
out unrelated namesakes to synthesize a high-confidence timeline and profile.

Enforces Invariant I9: does NOT import or set case status.
"""

from __future__ import annotations

import datetime
import logging
import re
from dataclasses import dataclass, field
from typing import Any

from rapidfuzz import fuzz

logger = logging.getLogger("traceid.agents.resolution")


@dataclass
class CandidateCluster:
    """A distinct real-world identity candidate formed from consistent sources."""
    candidate_id: str
    name: str
    primary_organization: str = ""
    primary_role: str = ""
    location: str = ""
    source_ids: list[str] = field(default_factory=list)
    evidence_ids: list[str] = field(default_factory=list)
    claims: list[dict[str, Any]] = field(default_factory=list)
    relevance_score: float = 0.0
    relevance_reasons: list[str] = field(default_factory=list)
    bio_summary: str = ""


def _normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip().lower()


def _extract_year_and_range(date_str: str | None) -> tuple[int | None, str | None, str]:
    """Extract start year, end date string, and display string from a date or snippet."""
    if not date_str:
        return None, None, ""
    
    # Check for range: e.g. "2018 - 2022", "2020 to 2024", "2021 - Present"
    range_match = re.search(r"\b(19\d\d|20\d\d)\s*(?:-|–|to)\s*(19\d\d|20\d\d|present|current)\b", date_str, re.IGNORECASE)
    if range_match:
        start_yr = int(range_match.group(1))
        end_str = range_match.group(2).title()
        return start_yr, end_str, f"{start_yr} – {end_str}"

    # Single year match
    match = re.search(r"\b(19\d\d|20\d\d)\b", date_str)
    if match:
        yr = int(match.group(1))
        return yr, None, str(yr)

    return None, None, ""


def cluster_and_score_candidates(
    subject_name: str,
    user_context: dict[str, Any],
    image_analysis: dict[str, Any] | None,
    sources_with_claims: list[tuple[str, str, list[dict[str, Any]]]],  # [(source_id, domain, [claims])]
    evidence_items: list[dict[str, Any]],
) -> list[CandidateCluster]:
    """Cluster multi-source claims into distinct real-world candidate entities and score

    them against user-supplied keywords and consented photo context.

    Args:
        subject_name: Name of target subject.
        user_context: Context dictionary (institution, event, role, location, etc.).
        image_analysis: Analysis from Gemini Vision (visible_text, detected_logos, visual_context).
        sources_with_claims: List of tuples (source_id, domain, claims_list).
        evidence_items: All verified evidence items.

    Returns:
        Sorted list of CandidateCluster objects from highest relevance to lowest.
    """
    institution_hint = _normalize_text(user_context.get("institution", ""))
    event_hint = _normalize_text(user_context.get("event", ""))
    role_hint = _normalize_text(user_context.get("role", "") or user_context.get("title", ""))
    location_hint = _normalize_text(user_context.get("location", ""))

    # Visual clues from photo
    image_analysis = image_analysis or {}
    visual_text_hints = [_normalize_text(t) for t in (image_analysis.get("visible_text") or []) if t]
    visual_logo_hints = [_normalize_text(l) for l in (image_analysis.get("detected_logos") or []) if l]
    visual_aff_hints = [_normalize_text(a) for a in (image_analysis.get("detected_affiliations") or []) if a]
    visual_role_hint = _normalize_text(image_analysis.get("detected_role") or "")

    # Org and role keyword matchers
    org_attrs = ("employer", "org", "institution", "company", "school", "university", "affiliation", "college", "workplace", "laboratory", "hospital", "institute")
    role_attrs = ("role", "job", "title", "position", "occupation", "headline", "profession", "fellow", "engineer", "student", "researcher", "specialist")
    loc_attrs = ("location", "city", "country", "state", "based", "address")
    edu_attrs = ("degree", "educat", "major", "field", "graduat", "alumn")

    # 1. Map each source to a primary profile footprint
    source_profiles: dict[str, dict[str, Any]] = {}
    for s_id, domain, claims in sources_with_claims:
        orgs = [c.get("value", "") for c in claims if any(k in c.get("attribute", "").lower() for k in org_attrs)]
        roles = [c.get("value", "") for c in claims if any(k in c.get("attribute", "").lower() for k in role_attrs)]
        locs = [c.get("value", "") for c in claims if any(k in c.get("attribute", "").lower() for k in loc_attrs)]
        edus = [c.get("value", "") for c in claims if any(k in c.get("attribute", "").lower() for k in edu_attrs)]
        names = [c.get("value", "") for c in claims if "name" in c.get("attribute", "").lower()]
        ev_ids = [e["id"] for e in evidence_items if e.get("source_id") == s_id]

        source_profiles[s_id] = {
            "source_id": s_id,
            "domain": domain,
            "primary_name": names[0] if names else subject_name,
            "organizations": [o for o in orgs if o],
            "roles": [r for r in roles if r],
            "locations": [l for l in locs if l],
            "educations": [e for e in edus if e],
            "claims": claims,
            "evidence_ids": ev_ids,
        }

    # 2. Cluster sources into candidate groups
    clusters: list[CandidateCluster] = []
    assigned_sources: set[str] = set()

    for s_id, prof in source_profiles.items():
        if s_id in assigned_sources:
            continue

        c_name = prof["primary_name"]
        primary_org = prof["organizations"][0] if prof["organizations"] else ""
        primary_role = prof["roles"][0] if prof["roles"] else ""
        primary_loc = prof["locations"][0] if prof["locations"] else ""

        current_cluster = CandidateCluster(
            candidate_id=f"cand-{len(clusters) + 1}",
            name=c_name,
            primary_organization=primary_org,
            primary_role=primary_role,
            location=primary_loc,
            source_ids=[s_id],
            evidence_ids=list(prof["evidence_ids"]),
            claims=list(prof["claims"]),
        )
        assigned_sources.add(s_id)

        # Merge other sources that share same organization or strong bio overlap
        for other_id, other_prof in source_profiles.items():
            if other_id in assigned_sources:
                continue

            shared_org = False
            if prof["organizations"] and other_prof["organizations"]:
                shared_org = any(
                    fuzz.ratio(_normalize_text(o1), _normalize_text(o2)) > 75
                    for o1 in prof["organizations"]
                    for o2 in other_prof["organizations"]
                )

            # Also check if both sources match specific provided keywords
            shared_keywords = False
            for kw in [institution_hint, event_hint]:
                if kw and len(kw) > 3:
                    kw_in_1 = any(kw in _normalize_text(c.get("value", "") + " " + c.get("snippet", "")) for c in prof["claims"])
                    kw_in_2 = any(kw in _normalize_text(c.get("value", "") + " " + c.get("snippet", "")) for c in other_prof["claims"])
                    if kw_in_1 and kw_in_2:
                        shared_keywords = True
                        break

            name_sim = fuzz.ratio(_normalize_text(c_name), _normalize_text(other_prof["primary_name"]))

            if (shared_org or shared_keywords) and name_sim > 65:
                current_cluster.source_ids.append(other_id)
                current_cluster.evidence_ids.extend(other_prof["evidence_ids"])
                current_cluster.claims.extend(other_prof["claims"])
                assigned_sources.add(other_id)
                if not current_cluster.primary_role and other_prof["roles"]:
                    current_cluster.primary_role = other_prof["roles"][0]
                if not current_cluster.primary_organization and other_prof["organizations"]:
                    current_cluster.primary_organization = other_prof["organizations"][0]
                if not current_cluster.location and other_prof["locations"]:
                    current_cluster.location = other_prof["locations"][0]

        clusters.append(current_cluster)

    # 3. Score each candidate cluster against User Keywords and Consented Photo
    for cand in clusters:
        score = 10.0  # base score
        reasons: list[str] = []

        all_text = _normalize_text(" ".join(
            f"{c.get('attribute','')} {c.get('value','')} {c.get('snippet','')}"
            for c in cand.claims
        ))

        # A. Name similarity
        name_sim = fuzz.ratio(_normalize_text(cand.name), _normalize_text(subject_name))
        score += (name_sim / 10.0)
        if name_sim > 85:
            reasons.append(f"Name match: '{cand.name}'")

        # B. User Keyword Matches (High weight discriminating proof)
        matched_institution = False
        if institution_hint and institution_hint in all_text:
            score += 45.0
            matched_institution = True
            reasons.append(f"Matches provided institution: '{user_context.get('institution')}' (+45)")
        elif institution_hint:
            if any(fuzz.partial_ratio(institution_hint, _normalize_text(c.get("value",""))) > 80 for c in cand.claims):
                score += 35.0
                matched_institution = True
                reasons.append(f"Fuzzy matches institution: '{user_context.get('institution')}' (+35)")

        # Penalize candidate if explicit organizations exist but completely clash with target
        if institution_hint and not matched_institution and cand.primary_organization:
            score -= 20.0
            reasons.append(f"Differs from target institution ({cand.primary_organization}) (-20)")

        if event_hint and event_hint in all_text:
            score += 35.0
            reasons.append(f"Matches target event: '{user_context.get('event')}' (+35)")

        if role_hint and role_hint in all_text:
            score += 25.0
            reasons.append(f"Matches expected role: '{user_context.get('role')}' (+25)")

        if location_hint and location_hint in all_text:
            score += 20.0
            reasons.append(f"Matches location: '{user_context.get('location')}' (+20)")

        # C. Multimodal Photo Context Matches (High weight discriminating proof)
        for v_txt in visual_text_hints:
            if len(v_txt) > 2 and v_txt in all_text:
                score += 50.0
                reasons.append(f"Matches photo badge/sign text: '{v_txt}' (+50)")
                break

        for v_logo in visual_logo_hints:
            if v_logo and (v_logo in all_text or (cand.primary_organization and v_logo in _normalize_text(cand.primary_organization))):
                score += 45.0
                reasons.append(f"Matches photo emblem/logo: '{v_logo}' (+45)")
                break

        for v_aff in visual_aff_hints:
            if v_aff and v_aff in all_text:
                score += 40.0
                reasons.append(f"Matches photo-inferred affiliation: '{v_aff}' (+40)")
                break

        if visual_role_hint and visual_role_hint in all_text:
            score += 20.0
            reasons.append(f"Matches visual setting context: '{visual_role_hint}' (+20)")

        # D. Density of corroborating independent sources
        unique_sources = len(set(cand.source_ids))
        score += min(unique_sources * 8.0, 40.0)
        reasons.append(f"{unique_sources} supporting web sources (+{min(unique_sources * 8.0, 40.0):.0f})")

        cand.relevance_score = max(score, 0.0)
        cand.relevance_reasons = reasons

        # Synthesize an articulate persona bio summary for this candidate
        bio_parts = [cand.name]
        if cand.primary_role:
            bio_parts.append(f"is a {cand.primary_role}")
        else:
            bio_parts.append("is an identified subject")
        if cand.primary_organization:
            bio_parts.append(f"affiliated with {cand.primary_organization}")
        if cand.location:
            bio_parts.append(f"based in {cand.location}")

        # Education
        edus = [c.get("value") for c in cand.claims if any(k in c.get("attribute", "").lower() for k in edu_attrs) and c.get("value")]
        bio_text = " ".join(bio_parts).strip() + "."
        if edus:
            bio_text += f" Education background includes {edus[0]}."

        cand.bio_summary = bio_text

    # Sort descending by relevance score
    clusters.sort(key=lambda c: c.relevance_score, reverse=True)
    return clusters


def synthesize_confident_timeline(
    claims: list[dict[str, Any]],
    evidence_items: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Synthesize a chronological, non-conflicting, high-confidence timeline

    specifically for the winning candidate's verified narrative.

    Args:
        claims: Verified claims of the winning candidate.
        evidence_items: Evidence items list for ID lookup.

    Returns:
        Sorted list of deduplicated timeline events with date, description, and evidence citations.
    """
    ev_map = {e.get("snippet", ""): e.get("id", "") for e in evidence_items if e.get("id")}

    timeline_candidates: list[dict[str, Any]] = []

    for c in claims:
        raw_date = c.get("date")
        attr = c.get("attribute", "").strip()
        val = c.get("value", "").strip()
        snip = c.get("snippet", "").strip()

        year, end_date_str, date_display = _extract_year_and_range(raw_date)
        if not year:
            year, end_date_str, date_display = _extract_year_and_range(snip)
        if not year:
            continue

        # Look for role, education, affiliation, or key project events
        attr_lower = attr.lower()
        is_relevant_milestone = any(k in attr_lower for k in (
            "employ", "job", "title", "role", "found", "work", "graduat",
            "degree", "stud", "educat", "publish", "speak", "participat", "lead"
        ))

        if is_relevant_milestone or raw_date:
            ev_id = ev_map.get(snip, "")
            desc = f"{attr.title()}: {val}" if val else snip[:80]
            timeline_candidates.append({
                "year": year,
                "end_date": end_date_str,
                "date_display": date_display or raw_date or str(year),
                "description": desc,
                "evidence_id": ev_id,
                "snippet": snip,
            })

    # Sort ascending chronologically by start year
    timeline_candidates.sort(key=lambda t: t["year"])
    clean_events: list[dict[str, Any]] = []
    seen_keys: set[str] = set()

    for item in timeline_candidates:
        key = f"{item['year']}_{_normalize_text(item['description'][:25])}"
        if key in seen_keys:
            continue
        seen_keys.add(key)
        clean_events.append({
            "id": f"tl-ev-{len(clean_events) + 1}",
            "date": item["date_display"],
            "end_date": item["end_date"],
            "description": item["description"],
            "claim_id": f"claim-tl-{len(clean_events) + 1}",
            "is_impossible": False,
            "conflicts_with": [],
            "evidence_id": item["evidence_id"],
        })

    return clean_events
