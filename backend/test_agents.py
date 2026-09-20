"""
TRACEID — Full Agent Pipeline Test
Tests every agent in the system:
  1. Consent Gate (I8)
  2. Image Analysis Agent (Gemini Vision)
  3. Source Discovery (Tavily)
  4. Claim Extraction Agent (Gemini LLM)
  5. Candidate Resolution Agent
  6. Status Decision Engine
  7. SerpApi standalone endpoints
"""
import httpx
import json
import sys
import time

BASE = "http://localhost:8000/api/v1"
PASS = "[PASS]"
FAIL = "[FAIL]"
SKIP = "[SKIP]"

results = []

def check(label, condition, detail=""):
    status = PASS if condition else FAIL
    results.append((status, label))
    color = "\033[92m" if condition else "\033[91m"
    reset = "\033[0m"
    print(f"  {color}{status}{reset} {label}")
    if detail:
        print(f"         {detail}")
    return condition

print("=" * 65)
print(" TRACEID — AGENT SYSTEM TEST")
print("=" * 65)

# ─────────────────────────────────────────────────────────────
print("\n[1] SYSTEM HEALTH")
# ─────────────────────────────────────────────────────────────
with httpx.Client(timeout=10) as c:
    h = c.get("http://localhost:8000/health").json()

check("Backend is running",           h.get("status") == "ok")
check("Gemini LLM configured",        h.get("llm_provider") == "gemini")
check("Tavily search adapter active", h.get("live_adapter_enabled") is True)
check("SQLite WAL database active",   "sqlite" in h.get("database", ""))
check("SerpApi configured",           h.get("serpapi_configured") is True)

# ─────────────────────────────────────────────────────────────
print("\n[2] CONSENT GATE (I8) — must block without consent")
# ─────────────────────────────────────────────────────────────
with httpx.Client(timeout=10) as c:
    r = c.post(f"{BASE}/investigations", data={
        "title": "Blocked Test",
        "consent_consenter": "",   # empty — should be rejected
        "consent_scope": "",
        "context": "{}",
    })
check("Empty consent is rejected (4xx)", r.status_code in (403, 422),
      f"Got HTTP {r.status_code}")

# ─────────────────────────────────────────────────────────────
print("\n[3] INVESTIGATION CREATE + PIPELINE (Tavily + Gemini agents)")
print("    Subject: 'Jawanth Narra' (real name test)")
print("    This will take ~60-90s for Tavily + Gemini to run...")
# ─────────────────────────────────────────────────────────────
with httpx.Client(timeout=15) as c:
    r_create = c.post(f"{BASE}/investigations", data={
        "title": "Jawanth Narra",
        "consent_consenter": "test_analyst",
        "consent_scope": "PUBLIC_PROFILES_ONLY",
        "context": json.dumps({
            "name": "Jawanth Narra",
            "location": "Hyderabad India",
        }),
    })

created = r_create.json()
inv_id = created.get("investigation_id", "")
check("Investigation created (201)",  r_create.status_code == 201, f"ID: {inv_id}")
check("Consent recorded",             created.get("consent_recorded") is True)

if not inv_id:
    print("\n  ERROR: Cannot continue without investigation ID.")
    sys.exit(1)

# Run pipeline (synchronous — blocks until done)
t0 = time.time()
with httpx.Client(timeout=300) as c:
    r_run = c.post(f"{BASE}/investigations/{inv_id}/run")
elapsed = round(time.time() - t0, 1)
run_result = r_run.json()

check("Pipeline completed (202)",     r_run.status_code == 202,
      f"HTTP {r_run.status_code} in {elapsed}s")
check("Pipeline status = COMPLETED",  run_result.get("status") == "COMPLETED",
      f"status={run_result.get('status')} | case={run_result.get('case_status')}")

# ─────────────────────────────────────────────────────────────
print("\n[4] AGENT OUTPUTS — Sources, Evidence, Candidates")
# ─────────────────────────────────────────────────────────────
with httpx.Client(timeout=15) as c:
    inv   = c.get(f"{BASE}/investigations/{inv_id}").json()
    srcs  = c.get(f"{BASE}/investigations/{inv_id}/sources").json()
    cands = c.get(f"{BASE}/investigations/{inv_id}/candidates").json()
    evid  = c.get(f"{BASE}/investigations/{inv_id}/evidence").json()
    tl    = c.get(f"{BASE}/investigations/{inv_id}/timeline").json()
    rep   = c.get(f"{BASE}/investigations/{inv_id}/report").json()

sources    = srcs.get("sources", [])
clusters   = srcs.get("clusters", [])
candidates = cands.get("candidates", [])
evidence   = evid.get("evidence", []) if isinstance(evid, dict) else evid

final_status = inv.get("status", "")

check("Source Discovery Agent found sources",       len(sources) > 0,
      f"{len(sources)} sources found")
check("Independence Clustering computed clusters",  len(clusters) > 0,
      f"{len(clusters)} independent clusters")
check("Claim Extraction Agent found evidence",      len(evidence) > 0,
      f"{len(evidence)} evidence items")
check("Candidate Resolution Agent ran",             "candidates" in cands)
check("Dossier Report Agent produced report",       rep.get("status") is not None)
check("Final status verdict issued",                final_status != "",
      f"verdict = {final_status}")

print(f"\n  Pipeline ran in {elapsed}s")
print(f"  Sources discovered : {len(sources)}")
print(f"  Ind. clusters      : {len(clusters)}")
print(f"  Evidence items     : {len(evidence)}")
print(f"  Candidates         : {len(candidates)}")
print(f"  Final verdict      : {final_status}")

if candidates:
    p = candidates[0]
    sup = len(p.get("matrix", {}).get("supporting", []))
    con = len(p.get("matrix", {}).get("contradicting", []))
    print(f"  Primary candidate  : {p.get('name')}")
    print(f"  Supporting signals : {sup}")
    print(f"  Contradicting      : {con}")

print("\n  --- Sources found by Tavily ---")
for s in sources[:8]:
    print(f"  [{s.get('reliability','?'):6s}] {s.get('source_type','')[:26]:26s}  {s.get('url','')}")

# ─────────────────────────────────────────────────────────────
print("\n[5] SERPAPI STANDALONE AGENTS (separate from pipeline)")
# ─────────────────────────────────────────────────────────────
with httpx.Client(timeout=15) as c:
    s_status = c.get(f"{BASE}/serpapi/status").json()
check("SerpApi status endpoint live",       s_status.get("configured") is True)
check("SerpApi lists 8 platforms",          len(s_status.get("platforms_supported", [])) == 8,
      str(s_status.get("platforms_supported", [])))

with httpx.Client(timeout=30) as c:
    s_web = c.post(f"{BASE}/serpapi/web",
                   json={"query": "Jawanth Narra Hyderabad", "max_results": 3}).json()
check("SerpApi web search returns results", s_web.get("result_count", 0) > 0,
      f"{s_web.get('result_count')} results")

with httpx.Client(timeout=30) as c:
    s_soc = c.post(f"{BASE}/serpapi/social",
                   json={"name": "Jawanth Narra", "platform": "linkedin"}).json()
check("SerpApi social search works",        s_soc.get("configured") is True,
      f"{s_soc.get('profile_count', 0)} LinkedIn profiles")

# ─────────────────────────────────────────────────────────────
print("\n[6] DEMO SCENARIOS — Pre-loaded golden test cases")
# ─────────────────────────────────────────────────────────────
scenarios = {
    "scenario-a-strong-match":          "STRONG_MATCH",
    "scenario-b-ambiguous-candidates":  "AMBIGUOUS",
    "scenario-c-insufficient-evidence": "INSUFFICIENT_EVIDENCE",
    "scenario-d-prompt-injection":      "INSUFFICIENT_EVIDENCE",
    "scenario-e-hard-contradiction":    "LIKELY_DIFFERENT",
}
with httpx.Client(timeout=10) as c:
    all_invs = {i["id"]: i for i in c.get(f"{BASE}/investigations").json()}

for sid, expected in scenarios.items():
    inv_data = all_invs.get(sid)
    if inv_data:
        actual = inv_data.get("status")
        check(f"Scenario {sid[-1].upper()} = {expected}", actual == expected,
              f"actual={actual}")
    else:
        results.append((SKIP, f"Scenario {sid} not found"))
        print(f"  {SKIP} Scenario {sid} not seeded")

# ─────────────────────────────────────────────────────────────
print("\n" + "=" * 65)
passed = sum(1 for s, _ in results if s == PASS)
failed = sum(1 for s, _ in results if s == FAIL)
skipped = sum(1 for s, _ in results if s == SKIP)
total = len(results)
print(f" RESULT: {passed}/{total} passed  |  {failed} failed  |  {skipped} skipped")
print("=" * 65)
if failed == 0:
    print(" ALL AGENTS WORKING CORRECTLY")
else:
    print(" SOME AGENTS NEED ATTENTION")
    for s, label in results:
        if s == FAIL:
            print(f"   FAILED: {label}")
print("=" * 65)
