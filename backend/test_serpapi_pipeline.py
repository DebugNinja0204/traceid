"""End-to-end SerpApi pipeline integration test.

The /run endpoint is synchronous — it blocks until Tavily + SerpApi + Gemini finish.
We use a 300s httpx timeout. The response body contains the final result directly.
"""
import httpx
import json
import sys

BASE = "http://localhost:8000/api/v1"
SEP = "=" * 62

print(SEP)
print(" TRACEID - SERPAPI PIPELINE INTEGRATION TEST")
print(SEP)

# Step 1: Create investigation
print("\n[1/3] Creating investigation for 'Sundar Pichai'...")
with httpx.Client(timeout=15) as c:
    r = c.post(f"{BASE}/investigations", data={
        "title": "Sundar Pichai",
        "consent_consenter": "demo_analyst",
        "consent_scope": "PUBLIC_PROFILES_ONLY",
        "context": json.dumps({
            "name": "Sundar Pichai",
            "institution": "Google",
            "location": "Mountain View California",
        }),
    })
d = r.json()
inv_id = d.get("investigation_id", "")
print(f"  HTTP {r.status_code} | ID: {inv_id}")
if not inv_id:
    print("ERROR: creation failed:", d)
    sys.exit(1)

# Step 2: Run pipeline (blocks until done — up to 300s)
print("\n[2/3] Running pipeline — Tavily + SerpApi (LinkedIn/GitHub/Twitter/Instagram) + Gemini...")
print("      This will take 60-120s. Please wait...")
with httpx.Client(timeout=300) as c:
    r2 = c.post(f"{BASE}/investigations/{inv_id}/run")
run_result = r2.json()
print(f"  HTTP {r2.status_code}")
print(f"  Pipeline status : {run_result.get('status')}")
print(f"  Case status     : {run_result.get('case_status')}")

# Step 3: Fetch and display results
print("\n[3/3] RESULTS")
print("-" * 62)
with httpx.Client(timeout=15) as c:
    inv   = c.get(f"{BASE}/investigations/{inv_id}").json()
    srcs  = c.get(f"{BASE}/investigations/{inv_id}/sources").json()
    cands = c.get(f"{BASE}/investigations/{inv_id}/candidates").json()

sources    = srcs.get("sources", [])
candidates = cands.get("candidates", [])
serp_srcs  = [s for s in sources if "SerpApi" in s.get("reliability_reason", "")]
tav_srcs   = [s for s in sources if "SerpApi" not in s.get("reliability_reason", "")]

print(f"  Final STATUS      : {inv.get('status')}")
print(f"  Total Sources     : {len(sources)}")
print(f"  Ind. Clusters     : {len(srcs.get('clusters', []))}")
print(f"  Candidates        : {len(candidates)}")
print(f"  Sources-TAVILY    : {len(tav_srcs)}")
print(f"  Sources-SERPAPI   : {len(serp_srcs)}  <- URLs from organic_results")

print("\n  --- ALL DISCOVERED URLS ---")
for s in sources:
    tag   = "[SERPAPI]" if "SerpApi" in s.get("reliability_reason", "") else "[TAVILY] "
    stype = s.get("source_type", "")[:28]
    url   = s.get("url", "")
    rel   = s.get("reliability", "")
    reason = s.get("reliability_reason", "")
    print(f"  {tag} [{rel:6s}] {stype}")
    print(f"           {url}")
    print(f"           {reason}")

if candidates:
    p = candidates[0]
    sup = len(p.get("matrix", {}).get("supporting", []))
    con = len(p.get("matrix", {}).get("contradicting", []))
    print(f"\n  Primary Candidate : {p.get('name')}")
    print(f"  Supporting signals: {sup}")
    print(f"  Contradicting     : {con}")
else:
    print("\n  No candidates resolved.")

print()
print(SEP)
print(" TEST COMPLETE")
print(SEP)
