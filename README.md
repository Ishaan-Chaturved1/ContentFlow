# ContentFlow AI — AI Content Workflow Automation Platform

> **AI Generalist Intern Portfolio Project**  
> An enterprise-grade, full-stack social media content planning and workflow automation platform tailored for creative marketing agencies representing luxury interior design, bespoke architecture, and artisan furniture studios.

---

## 1. Overview & System Architecture

**ContentFlow AI** automates the end-to-end creative planning lifecycle for high-end design agencies. Agency strategists enter a structured brand brief, leverage the official **Google Gemini Python SDK (`google-genai`)** or a labelled realistic Demo Provider to generate a cohesive 7-day content calendar, review and refine creative copy and art-direction briefs, manage approval states, and export validated campaigns directly to RFC 4180-compliant CSV or queue them for Google Sheets synchronization.

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Frontend: React + Vite + Tailwind CSS                  │
│                                                                             │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │  Agency Dashboard     │  │  Content Calendar    │  │ Brand Brief Form │  │
│  │  - Metrics & Sign-off │  │  - Table & Card Grid │  │ - Validation     │  │
│  │  - Campaign Index     │  │  - Filter & Search   │  │ - 1-Click Maison │  │
│  └───────────────────────┘  └──────────────────────┘  └──────────────────┘  │
│                                       │                                     │
│                     REST API (HTTP / JSON / CSV Stream)                     │
└───────────────────────────────────────┼─────────────────────────────────────┘
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Backend: FastAPI (Python 3.13)                    │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          FastAPI Routers                              │  │
│  │  - /api/health              : System & provider telemetry             │  │
│  │  - /api/campaigns           : CRUD & calendar generation              │  │
│  │  - /api/campaigns/dashboard : Aggregate metrics calculation           │  │
│  │  - /api/posts/{id}          : Human review (Approve, Reject, Edit)    │  │
│  │  - /api/campaigns/{id}/export: RFC 4180 CSV generation                │  │
│  │  - /api/campaigns/{id}/sync-sheets: Google Sheets service interface  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                 │                                         │                 │
│                 ▼                                         ▼                 │
│  ┌──────────────────────────────┐        ┌──────────────────────────────┐   │
│  │    LLM Provider Abstraction  │        │   SQLite + SQLAlchemy 2.0    │   │
│  │  - BaseLLMProvider (ABC)     │        │  - campaigns table           │   │
│  │  - DemoProvider (Labelled)   │        │  - posts table               │   │
│  │  - GeminiProvider            │        │  - Foreign keys & WAL pragma │   │
│  │    (Official `google-genai`) │        └──────────────────────────────┘   │
│  │  - OpenAIProvider            │                                           │
│  └──────────────────────────────┘                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 3.4, Lucide Icons.
- **Backend**: Python 3.13, FastAPI 0.115+, Pydantic V2, SQLAlchemy 2.0 (ORM), Uvicorn.
- **AI Integration**: Official **`google-genai`** Python SDK (`from google import genai`, `google.genai.types.GenerateContentConfig`).
- **Persistence**: SQLite with Foreign Key constraints and WAL journaling.
- **Testing**: `pytest 9.1+` with in-memory SQLite fixtures and `tsc` frontend type-check validation.
- **Design Philosophy**: Warm off-white canvas (`#FAF8F4`), charcoal typography (`#181B19`), restrained olive (`#5A6B53`) and taupe (`#8C7D71`) accents, Playfair Display editorial serifs, and subtle borders.

---

## 3. Google Gemini API Integration (`google-genai`)

ContentFlow AI uses Google's official, current `google-genai` Python SDK (**not** the deprecated `google-generativeai` package):

```python
from google import genai
from google.genai import types
from google.genai.errors import APIError

client = genai.Client(api_key=self.api_key)

response = await client.aio.models.generate_content(
    model=self.model_name,  # e.g., "gemini-2.5-flash"
    contents=prompt,
    config=types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        response_mime_type="application/json",
        response_schema=GeneratedCalendarSchema,
        temperature=0.7,
    ),
)
```

### Robust Error Handling & Availability Safeguards
- **Missing API Keys**: Raises a clear, immediate `ValueError` directing the user to set `GEMINI_API_KEY` in `.env` or switch to `LLM_PROVIDER=demo`.
- **Quota & Rate Limits (`429 / RESOURCE_EXHAUSTED`)**: Catches `APIError` and returns a descriptive error message indicating rate limits rather than crashing.
- **Authentication Errors (`400 / 401 / 403 / API_KEY_INVALID`)**: Identifies invalid keys with actionable instructions.
- **Timeouts**: Handles socket and request timeouts with clean user-facing error states.
- **Zero Faked Data Policy**: When Gemini is configured and unavailable, the backend returns an explicit HTTP 502 Bad Gateway with the exact upstream error details—it **never** silently substitutes demo data when live generation was requested.

---

## 4. Quick Start & Installation (Windows)

### Prerequisites
- Python 3.11+ (tested on Python 3.13)
- Node.js 18+ and npm (tested on Node v24.11)
- Git / Windows PowerShell

### Step 1: Clone and Setup Environment Variables

```powershell
cd d:\AIGeneralistIntern

# Setup Backend Environment
Copy-Item backend\.env.example backend\.env

# Setup Frontend Environment
Copy-Item frontend\.env.example frontend\.env
```

### Step 2: Install Backend Dependencies

```powershell
cd d:\AIGeneralistIntern\backend

# Create Python virtual environment and activate
python -m venv venv
.\venv\Scripts\activate

# Install dependencies including google-genai
pip install -r requirements.txt
```

### Step 3: Install Frontend Dependencies

```powershell
cd d:\AIGeneralistIntern\frontend
npm install
```

---

## 5. Running the Application on Windows

### Port Conflict Notice (`[WinError 10013]`)
If you see `ERROR: [WinError 10013] An attempt was made to access a socket in a way forbidden by its access permissions`, port `8000` is already held by a previous process. Run this PowerShell command to free it:
```powershell
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Start Backend & Frontend

**Terminal 1 — Backend (FastAPI)**:
```powershell
cd d:\AIGeneralistIntern\backend
.\venv\Scripts\activate
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*API is live at `http://127.0.0.1:8000` with Swagger docs at `http://127.0.0.1:8000/docs`.*

**Terminal 2 — Frontend (Vite + React)**:
```powershell
cd d:\AIGeneralistIntern\frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
*Web application is live at `http://127.0.0.1:5173`.*

---

## 6. Testing a Real Campaign with Gemini

### A. Testing via Live Gemini API
1. Open `backend\.env` and set:
   ```ini
   LLM_PROVIDER="gemini"
   GEMINI_API_KEY="your_actual_gemini_api_key_from_google_ai_studio"
   GEMINI_MODEL="gemini-2.5-flash"
   ```
2. Start the backend.
3. In PowerShell, trigger campaign creation via HTTP:
   ```powershell
   $body = @{
       brand_name = "Maison Living Studio"
       industry = "Luxury Interior Architecture & Custom Joinery"
       target_audience = "High-net-worth homeowners, art collectors, and architects"
       brand_voice = "Refined, architectural, quiet luxury, tactile"
       products_services = "Turnkey residential renovations and bespoke travertine credenzas"
       campaign_objective = "Launch Autumn/Winter monograph and book 5 commissions"
       platforms = @("Instagram", "LinkedIn")
       content_preferences = "Natural daylight studies, raw travertine textures, zero clutter"
       number_of_days = 7
   } | ConvertTo-Json

   Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/campaigns" -Method Post -Body $body -ContentType "application/json" | Select-Object id, brand_name, generation_provider, is_demo_mode, total_posts | ConvertTo-Json
   ```

### B. Testing via Labelled Demo Mode (Zero API Key Required)
1. Open `http://127.0.0.1:5173` in your browser.
2. Click **Load Maison Demo** in the top navigation bar or hero card.
3. The 7-day content calendar will instantly load with curated architectural strategy for review, editing, approval, and CSV export.

---

## 7. Automated Test Suite (21 Tests Passing)

The backend includes 21 comprehensive tests with `pytest` using an isolated in-memory SQLite database:

```powershell
cd d:\AIGeneralistIntern\backend
.\venv\Scripts\pytest -v
```

### Test Coverage Breakdown:
- `tests/test_gemini.py`:
  - `test_gemini_provider_missing_key_raises_error`: Validates descriptive exception when API key is missing.
  - `test_gemini_provider_success`: Mocks `google-genai` SDK structured generation and verifies 7 posts with correct attributes.
  - `test_gemini_provider_quota_rate_limit_error`: Mocks `APIError` 429 quota exhaustion and verifies user-friendly message.
  - `test_gemini_provider_invalid_api_key_error`: Mocks 400 invalid API key error.
  - `test_gemini_provider_timeout_error`: Mocks timeout behavior.
  - `test_gemini_provider_invalid_json_output`: Mocks malformed LLM response and asserts Pydantic validation catches it.
  - `test_api_route_with_gemini_provider_success`: Tests full FastAPI campaign creation route with Gemini.
  - `test_api_route_with_gemini_provider_failure_returns_502`: Tests proper HTTP 502 error return on upstream model failure without creating zombie DB records.
- `tests/test_validation.py`: Pydantic field lengths, invalid platforms, out-of-range days.
- `tests/test_campaigns.py`: Health checks, campaign creation, calendar generation, dashboard metrics, campaign deletion.
- `tests/test_posts.py`: In-place editing, approval, rejection, and reset workflows.
- `tests/test_export.py`: RFC 4180 CSV escaping, approved-only filtering, Google Sheets stub validation.

### Frontend Typecheck & Build Validation:
```powershell
cd d:\AIGeneralistIntern\frontend
npm test
```
*Validates zero TypeScript errors and generates the production bundle.*

---

## 8. API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Telemetry endpoint reporting provider, DB status, and demo mode flag |
| `GET` | `/api/campaigns/dashboard` | Aggregated dashboard metrics & recent campaigns |
| `POST` | `/api/campaigns` | Create campaign brief & generate calendar via LLM |
| `GET` | `/api/campaigns` | List all campaigns |
| `GET` | `/api/campaigns/{id}` | Retrieve single campaign with full post schedule |
| `POST` | `/api/campaigns/{id}/generate` | Regenerate calendar using creative LLM |
| `DELETE`| `/api/campaigns/{id}` | Delete campaign and cascade delete its posts |
| `PATCH`| `/api/posts/{id}` | Edit post topic, caption, CTA, visual prompt, notes |
| `POST` | `/api/posts/{id}/approve` | Approve post for export |
| `POST` | `/api/posts/{id}/reject` | Reject post |
| `POST` | `/api/posts/{id}/pending` | Move post back to Pending Review |
| `GET` | `/api/campaigns/{id}/export` | Export calendar to CSV (`?approved_only=true/false`) |
| `POST` | `/api/campaigns/{id}/sync-sheets`| Test/run Google Sheets sync interface |
| `POST` | `/api/campaigns/seed-demo` | 1-click seed for Maison Living Studio sample campaign |

---

## 9. Google Sheets Production Setup Guide

To connect the backend to real Google Spreadsheets:
1. **Google Cloud Console**: Navigate to [console.cloud.google.com](https://console.cloud.google.com) and create a project.
2. **Enable API**: Search for and enable the **Google Sheets API v4**.
3. **Service Account**: Create a Service Account, generate a JSON Key, and save it as `backend/service-account.json`.
4. **Environment Variable**: Set `GOOGLE_SERVICE_ACCOUNT_JSON=./service-account.json` in `backend/.env`.
5. **Share Sheet**: Create a new Google Spreadsheet and share edit access with the service account email (e.g. `service-account@project.iam.gserviceaccount.com`).
6. Trigger the sync via the UI modal or `POST /api/campaigns/{id}/sync-sheets?spreadsheet_id=YOUR_SHEET_ID`.

---

## 10. Implemented Features vs. Future Enhancements

### Implemented Features
- [x] Full-stack architecture with FastAPI backend and React + Vite frontend.
- [x] Official `google-genai` Python SDK integration (`from google import genai`).
- [x] Pydantic structured output validation for Gemini generation.
- [x] Error handling for missing keys, 429 quota exhaustion, timeouts, and invalid outputs.
- [x] Labelled DEMO MODE with curated Maison Living Studio luxury campaign data.
- [x] SQLite persistence for campaigns and posts across server restarts.
- [x] Interactive human review workflow (Approve, Reject, Reset, Edit).
- [x] Multi-tier RFC 4180 CSV export (Approved Only vs. Complete Campaign).
- [x] Search, platform filters, status filters, and table/grid view toggles.
- [x] Verified Google Sheets service interface and architecture documentation modal.
- [x] 21 passing automated tests in `pytest` and frontend TypeScript validation.

### Future Enhancements (Roadmap)
- [ ] Direct publishing integration with Instagram Graph API and LinkedIn Community API.
- [ ] Native AI image generation preview using Gemini Imagen 3 for visual prompts.
- [ ] Drag-and-drop calendar rescheduling across date slots.
