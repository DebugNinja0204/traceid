"""Full results report for latest investigation."""
import httpx, time

BASE = "http://localhost:8000/api/v1"

# Get latest investigation (first in list)
with httpx.Client(timeout=10) as c:
    invs = c.get(f"{BASE}/investigations").json()

latest = invs[0]
inv_id = latest["id"]
print(f"Checking investigation: {inv_id} — {latest['title']}")
print(f"Current status: {latest['status']}")
print(f"Updated at: {latest['updated_at']}")
print()

# Poll pipeline status
with httpx.Client(timeout=10) as c:
    ps = c.get(f"{BASE}/investigations/{inv_id}/status").json()
print(f"Pipeline status : {ps.get('pipeline_status')}")
print(f"Pipeline stage  : {ps.get('current_stage')}")
print()

# If still running, wait up to 90 more seconds
max_wait = 90
elapsed = 0
while ps.get("pipeline_status") not in ("COMPLETED", "FAILED") and elapsed < max_wait:
    time.sleep(5)
    elapsed += 5
    with httpx.Client(timeout=10) as c:
        ps = c.get(f"{BASE}/investigations/{inv_id}/status").json()
    stage = ps.get("current_stage", "?")
    pstatus = ps.get("pipeline_status", "?")
    print(f"  [{elapsed:3d}s] {stage:30s} {pstatus}")

print()
print("=" * 62)
print(" FINAL RESULTS")
print("=" * 62)

with httpx.Client(timeout=15) as c:
    inv   = c.get(f"{BASE}/investigations/{inv_id}").json()
    srcs  = c.get(f"{BASE}/investigations/{inv_id}/sources").json()
    cands = c.get(f"{BASE}/investigations/{inv_id}/candidates").json()

print(f"Final STATUS      : {inv.get('status')}")
print(f"Pipeline Stage    : {inv.get('pipeline_stage')}")
print(f"Total Sources     : {len(srcs.get('sources', []))}")
print(f"Ind. Clusters     : {len(srcs.get('clusters', []))}")
print(f"Candidates found  : {len(cands.get('candidates', []))}")

sources = srcs.get("sources", [])
serpapi_srcs = [s for s in sources if "SerpApi" in s.get("reliability_reason", "")]
tavily_srcs  = [s for s in sources if "SerpApi" not in s.get("reliability_reason", "")]

print(f"\n  Sources from TAVILY   : {len(tavily_srcs)}")
print(f"  Sources from SERPAPI  : {len(serpapi_srcs)}  ← links from organic_results")

print("\n  --- ALL DISCOVERED URLs ---")
for s in sources:
    tag   = "[SERPAPI]" if "SerpApi" in s.get("reliability_reason", "") else "[TAVILY] "
    stype = s.get("source_type", "")
    url   = s.get("url", "")
    rel   = s.get("reliability", "")
    reason = s.get("reliability_reason", "")
    print(f"  {tag} [{rel:6s}] {stype:30s}")
    print(f"           URL: {url}")
    print(f"           WHY: {reason}")
    print()

candidates = cands.get("candidates", [])
if candidates:
    p = candidates[0]
    supporting    = len(p.get("matrix", {}).get("supporting", []))
    contradicting = len(p.get("matrix", {}).get("contradicting", []))
    print(f"Primary Candidate : {p.get('name')}")
    print(f"Supporting signals: {supporting}")
    print(f"Contradicting     : {contradicting}")
else:
    print("No candidates resolved yet.")

print()
print("=" * 62)
