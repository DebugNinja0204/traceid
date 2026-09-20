import httpx

BASE = "http://localhost:8000/api/v1"

with httpx.Client(timeout=10) as c:
    invs = c.get(f"{BASE}/investigations").json()

print("Recent investigations:")
for inv in invs[:5]:
    iid    = inv["id"]
    title  = inv["title"]
    status = inv["status"]
    upd    = inv["updated_at"]
    print(f"  {iid} | {title} | {status} | {upd}")
