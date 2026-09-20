"""Source independence engine — detect copies, cluster sources (D9).

Layered method:
1. Same owner/canonical domain → one cluster
2. Near-duplicate content (shingling + Jaccard/MinHash) → derived
3. Attribution/"via" links → derived
4. Earliest publication → candidate origin
5. Conservative merge on uncertainty
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class SourceInfo:
    """Source metadata for independence analysis."""
    source_id: str
    domain: str
    owner: str | None = None
    content_text: str = ""
    content_hash: str = ""
    published_at: datetime | None = None
    attribution_links: list[str] = field(default_factory=list)  # source_ids this derives from
    url: str = ""


@dataclass
class IndependenceCluster:
    """A cluster of sources that share a common origin."""
    cluster_id: str
    origin_source_id: str | None
    member_source_ids: list[str]
    derivation_reasons: dict[str, str]  # source_id → reason
    flagged: bool = False


def _shingle(text: str, size: int = 5) -> set[str]:
    """Generate character shingles from text."""
    normalized = " ".join(text.lower().split())
    if len(normalized) < size:
        return {normalized}
    return {normalized[i:i + size] for i in range(len(normalized) - size + 1)}


def _jaccard_similarity(set_a: set[str], set_b: set[str]) -> float:
    """Compute Jaccard similarity between two sets."""
    if not set_a and not set_b:
        return 1.0
    if not set_a or not set_b:
        return 0.0
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    return intersection / union if union > 0 else 0.0


def compute_independence_clusters(
    sources: list[SourceInfo],
    *,
    similarity_threshold: float = 0.85,
    shingle_size: int = 5,
    merge_on_uncertainty: bool = True,
) -> list[IndependenceCluster]:
    """Cluster sources by independence using the D9 layered method.

    Returns clusters where each cluster represents one independent confirmation.
    Count CLUSTERS, never URLs.
    """
    if not sources:
        return []

    # Build a union-find structure
    parent: dict[str, str] = {s.source_id: s.source_id for s in sources}
    reasons: dict[str, str] = {}

    def find(x: str) -> str:
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a: str, b: str, reason: str) -> None:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra
            reasons[b] = reason

    source_map = {s.source_id: s for s in sources}

    # Layer 1: Same owner/canonical domain
    domain_groups: dict[str, list[str]] = {}
    for s in sources:
        key = s.owner or s.domain
        domain_groups.setdefault(key, []).append(s.source_id)
    for group in domain_groups.values():
        for sid in group[1:]:
            union(group[0], sid, f"Same owner/domain: {source_map[group[0]].domain}")

    # Layer 2: Near-duplicate content (shingling + Jaccard)
    shingles: dict[str, set[str]] = {}
    for s in sources:
        if s.content_text:
            shingles[s.source_id] = _shingle(s.content_text, shingle_size)

    source_ids_with_content = list(shingles.keys())
    for i, sid_a in enumerate(source_ids_with_content):
        for sid_b in source_ids_with_content[i + 1:]:
            if find(sid_a) == find(sid_b):
                continue  # Already in same cluster
            sim = _jaccard_similarity(shingles[sid_a], shingles[sid_b])
            if sim >= similarity_threshold:
                union(sid_a, sid_b, f"Near-duplicate content (similarity={sim:.2f})")

    # Layer 3: Explicit attribution/citation links
    for s in sources:
        for attributed_to in s.attribution_links:
            if attributed_to in source_map:
                union(attributed_to, s.source_id, f"Attribution link from {s.source_id}")

    # Layer 4: Determine origin per cluster (earliest publication)
    clusters_map: dict[str, list[str]] = {}
    for s in sources:
        root = find(s.source_id)
        clusters_map.setdefault(root, []).append(s.source_id)

    result: list[IndependenceCluster] = []
    for idx, (root, members) in enumerate(clusters_map.items()):
        # Find earliest published source as origin
        origin = None
        earliest: datetime | None = None
        for sid in members:
            pub = source_map[sid].published_at
            if pub is not None and (earliest is None or pub < earliest):
                earliest = pub
                origin = sid

        cluster_reasons = {sid: reasons.get(sid, "Origin or independent") for sid in members}
        flagged = merge_on_uncertainty and len(members) > 1 and origin is None

        result.append(IndependenceCluster(
            cluster_id=f"cluster-{idx}",
            origin_source_id=origin or root,
            member_source_ids=sorted(members),
            derivation_reasons=cluster_reasons,
            flagged=flagged,
        ))

    return result
