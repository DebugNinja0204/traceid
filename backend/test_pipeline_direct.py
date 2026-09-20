import httpx, json, time

BASE = "http://localhost:8000/api/v1"

r = httpx.post(f"{BASE}/investigations", data={
    "title": "Test Agent Run",
    "consent_consenter": "analyst",
    "consent_scope": "PUBLIC_PROFILES_ONLY",
    "context": json.dumps({"name": "Jawanth Narra", "location": "Hyderabad India"}),
}, timeout=15)
inv_id = r.json().get("investigation_id")
print("Created:", inv_id)

t0 = time.time()
r2 = httpx.post(f"{BASE}/investigations/{inv_id}/run", timeout=300)
elapsed = time.time() - t0
print(f"Run response ({elapsed:.1f}s): HTTP {r2.status_code}")
print("Body:", r2.json())

srcs = httpx.get(f"{BASE}/investigations/{inv_id}/sources", timeout=10).json()
print("Sources:", len(srcs.get("sources", [])))
print("Clusters:", len(srcs.get("clusters", [])))
