# TRACEID — Developer Setup Guide

## SerpApi Integration Setup

TRACEID uses SerpApi for enhanced web and social-media profile discovery.
This guide explains how to obtain an API key and connect it to the application.

---

### 1. Create a SerpApi Account

1. Go to **https://serpapi.com/**
2. Click **Sign Up** and create a free account.
   - The free tier includes 100 searches/month, which is enough for development.
3. Verify your email address.

---

### 2. Find Your API Key

1. Log in to your SerpApi account.
2. In the dashboard, click your username → **API Key** (or go to  
   **https://serpapi.com/manage-api-key**).
3. Copy the key shown (it looks like a long alphanumeric string).

> **Security:** Treat this key like a password. Never share it or commit it to Git.

---

### 3. Add the Key to Your `.env` File

Open the file:

```
traceid_pack_v2/backend/.env
```

Find this line:

```env
SERPAPI_API_KEY=
```

Replace it with your real key:

```env
SERPAPI_API_KEY=YOUR_REAL_KEY_HERE
```

> **Important:** Use your actual key, not the placeholder text above.

---

### 4. Restart the Backend

```powershell
# From the backend directory:
cd "d:\Desktop\trace id\traceid_pack_v2\backend"
uvicorn app.main:app --reload --port 8000
```

When the key is present, you will see this in the server log:

```
INFO  traceid  SerpApi adapter: configured ✓
```

When the key is absent (or blank), you will see:

```
WARNING  traceid.adapters.serpapi  SerpApi is not configured.
Add your SERPAPI_API_KEY to the .env file to enable enhanced web/social search.
```

The application runs normally in both cases.

---

### 5. Verify the Integration Works

#### 5a. Check the health endpoint

```
GET http://localhost:8000/health
```

Expected response when key is configured:

```json
{
  "status": "ok",
  "serpapi_configured": true,
  "serpapi_message": "SerpApi ready."
}
```

Expected response when key is absent:

```json
{
  "status": "ok",
  "serpapi_configured": false,
  "serpapi_message": "SerpApi is not configured. Add your SERPAPI_API_KEY to the .env file..."
}
```

#### 5b. Check the SerpApi status endpoint

```
GET http://localhost:8000/api/v1/serpapi/status
```

Returns:

```json
{
  "configured": true,
  "message": "SerpApi is configured and ready.",
  "platforms_supported": ["instagram", "youtube", "linkedin", "github", "twitter", "facebook", "tiktok", "reddit"]
}
```

#### 5c. Run a web search

```
POST http://localhost:8000/api/v1/serpapi/web
Content-Type: application/json

{
  "query": "John Doe cybersecurity researcher",
  "max_results": 5
}
```

#### 5d. Search a social profile on one platform

```
POST http://localhost:8000/api/v1/serpapi/social
Content-Type: application/json

{
  "name": "John Doe",
  "platform": "linkedin",
  "extra_terms": "software engineer"
}
```

Supported platforms: `instagram`, `youtube`, `linkedin`, `github`, `twitter`, `facebook`, `tiktok`, `reddit`

#### 5e. Scan all platforms at once

```
POST http://localhost:8000/api/v1/serpapi/social/all
Content-Type: application/json

{
  "name": "John Doe",
  "extra_terms": "India engineer"
}
```

---

### 6. Run the Tests

#### Test 1 — Missing-key state (run NOW, no key needed)

```powershell
cd "d:\Desktop\trace id\traceid_pack_v2\backend"
pytest tests/unit/test_serpapi_adapter.py -k "not real" -v
```

This verifies the application handles a missing key correctly.

#### Test 2 — Live API test (run AFTER adding your key)

```powershell
pytest tests/unit/test_serpapi_adapter.py -k real -s -v
```

This makes **real HTTP calls to SerpApi** and consumes API quota.
Only run this after setting your real key.

---

### 7. Architecture Notes

The API key is **strictly server-side**:

```
Browser/Frontend
      ↓  (NEVER sends API key)
TRACEID Backend (holds SERPAPI_API_KEY in .env)
      ↓  (sends key to SerpApi)
SerpApi
```

The key:
- Lives only in `backend/.env`
- Is read by `app/config.py` → `Settings.SERPAPI_API_KEY`
- Is used only inside `app/adapters/serpapi_search.py`
- Is **never** returned in any API response
- Is **never** logged
- Is **never** sent to the frontend

---

### 8. What Happens Without a Key

If `SERPAPI_API_KEY` is empty:

| Feature | Behaviour |
|---|---|
| Application startup | ✅ Works normally |
| All existing features | ✅ Work normally |
| `GET /health` | ✅ Returns `serpapi_configured: false` |
| `GET /api/v1/serpapi/status` | ✅ Returns `configured: false` with setup instructions |
| `POST /api/v1/serpapi/web` | ✅ Returns `{"configured": false, "results": []}` |
| `POST /api/v1/serpapi/social` | ✅ Returns `{"configured": false, "profiles": []}` |
| `POST /api/v1/serpapi/social/all` | ✅ Returns `{"configured": false, "results": {platform: []}}` |

No crash. No error. No fabricated results.

---

### File Reference

| File | Purpose |
|---|---|
| `backend/.env` | Your real keys (never commit this) |
| `backend/.env.example` | Template with placeholders (safe to commit) |
| `backend/app/config.py` | `SERPAPI_API_KEY` setting definition |
| `backend/app/adapters/serpapi_search.py` | SerpApi service (all search functions) |
| `backend/app/api/router.py` | `/serpapi/status`, `/serpapi/web`, `/serpapi/social`, `/serpapi/social/all` endpoints |
| `backend/app/main.py` | Startup warning + health endpoint |
| `backend/tests/unit/test_serpapi_adapter.py` | Tests (missing-key + real-key) |
| `.gitignore` | Ensures `.env` is never committed |
