## Lucid Loom — Project Specification (Interview‑Ready)

This document is the living blueprint for building and iterating on Lucid Loom.

### 1) Phased Roadmap
- **Phase 1 — Core MVP**
  - Auth: register, login, logout (JWT, “remember me”)
  - Create Dream: title + free‑text
  - AI analysis: poetic narrative, meaning, symbols, emotions, image prompt → image
  - Persist dream + interpretation + image URL (SQLite → SQLAlchemy)
  - Views: Dream List, Dream Detail
- **Phase 2 — UX & Visuals**
  - Masonry/grid gallery with image thumbnails
  - Auto‑tags from symbols/emotions; simple search by title
  - Dark, dreamy theme polish; empty states; skeleton/loading
- **Phase 3 — Smart AI**
  - Multi‑style rewrites (horror / sci‑fi / children’s tale, etc.)
  - Cross‑dream pattern analysis (themes, recurring symbols/emotions)
  - Symbol “encyclopedia” (LLM‑generated explanations)
- **Phase 4 — Engineering Excellence**
  - Background jobs for AI + image generation
  - WebSockets for real‑time processing status
  - Analytics dashboard (counts, trends, emotion distributions)
  - Cloud object storage for images (S3/GCS)

### 2) MVP Feature Set
- Auth: sign up, log in, log out (+ optional “remember me”)
- Create dream (title, text) → “Interpret my dream”
- AI Output: narrative, meaning, symbols, emotions, image URL
- Persisted dreams (Dream, DreamInterpretation)
- Dream List: title, created date, 1‑line preview, optional thumbnail
- Dream Detail: original text + all AI fields + image

### 3) Core UI Flows
- **New user → first dream**
  1) Landing → Sign up → Login → Empty “My Dreams”
  2) “Add your first dream” → New Dream form (title + text) → Submit
  3) Show “Weaving your dream…” → display narrative/meaning/symbols/emotions/image
  4) Persist dream; “Back to list” shows new card
- **Return user → browse & read**
  1) Login → “My Dreams” grid/list
  2) Click card → Dream Detail (title/date, original text, AI outputs)
  3) Optional actions (future): transform style, merge, delete
- **Advanced (later)**
  - From detail: “Rewrite as [style]”
  - From list: “Analyze my patterns”
  - From detail: “Explain symbol”

### 4) Frontend (React + Vite + CSS or Tailwind)
- **Routes**
  - `/login`, `/register`
  - `/` (DreamList, protected)
  - `/new` (NewDream, protected)
  - `/dreams/:id` (DreamDetail, protected)
  - `/analytics` (future)
- **Components**
  - `Navbar` (brand, links, login/logout)
  - `DreamCard` (title, date, preview, thumbnail)
  - `DreamForm` (title, textarea, submit)
  - `DreamResult` (narrative, meaning, symbols, emotions, image)
- **Design**
  - Dark navy/purple background; soft violet accents; rounded cards
  - Max‑width ~1100px container; CSS Grid for gallery
  - Mobile: stack form/result vertically

### 5) Backend (FastAPI) — Folder Structure & Responsibilities
```
lucid_loom_backend/
  app/
    __init__.py
    main.py                          # create_app, include routers, CORS, startup/shutdown
    core/
      config.py                      # env, settings (DB URL, SECRET_KEY, OPENAI_API_KEY)
      security.py                    # bcrypt helpers, JWT create/verify
    db/
      database.py                    # engine, SessionLocal, Base, get_db()
      models.py                      # User, Dream, DreamInterpretation
      schemas.py                     # Pydantic request/response models
    api/
      __init__.py
      deps.py                        # get_db, get_current_user
      routes/
        auth.py                      # /auth/register, /auth/login, /auth/me
        dreams.py                    # /dreams (POST, GET), /dreams/{id}, delete/edit (later)
        analytics.py                 # (later)
    services/
      ai.py                          # analyze_dream, generate_dream_image, rewrites
      dreams.py                      # orchestration + validation around Dream CRUD
      analytics.py                   # pattern mining across dreams (later)
    workers/
      tasks.py                       # Celery/RQ tasks for AI+image jobs (later)
  .env
  requirements.txt
```

### 6) Background Jobs & WebSockets (High‑Level Plan)
- **Why**: AI + image generation can take seconds; blocking HTTP hurts UX.
- **Background Jobs**
  1) Client POSTs `/dreams` with title/text.
  2) API persists `Dream(status='processing')`, enqueues job `interpret_dream(dream_id)`.
  3) Worker runs: calls `services.ai.analyze_dream` and `generate_dream_image`, updates `DreamInterpretation`, sets `status='done'`.
  4) Returns immediately to client with `{id, status:'processing'}`.
- **WebSockets**
  - Client opens `ws://.../ws/dream-status/{dream_id}` after submission.
  - Worker, upon completion, publishes a `done` event (via Redis pub/sub or via app‑level notifier).
  - Server pushes through WebSocket; client refetches `/dreams/{id}` to display results.
- **Implementation Notes**
  - Use Redis + RQ or Celery; define idempotent tasks with retry/backoff.
  - Use Pydantic models for messages: `{dreamId, status, progress?, error?}`.
  - Gracefully handle AI/API failures; keep dream saved with `status='error'` + reason.

### 7) Production‑Readiness Checklist (Condensed)
- Secrets via `.env` + environment variables (no secrets in repo)
- Robust error handling + timeouts for HTTP calls to AI
- Input validation/sanitization; size limits on text
- Pagination on `/dreams`, basic search by title (Phase 2)
- CORS locked to known origins in non‑dev
- Logging & basic metrics; request IDs
- Dockerfiles for backend and frontend (optional)
- CI: lint/type‑check/test (pytest) before deploy

### 8) Phase 1 — Concrete Tasks (MVP Sprint List)
1) Wire up `core/config.py` + `db/database.py` + `models.py` + `schemas.py`
2) Implement `core/security.py` (bcrypt + JWT)
3) `api/routes/auth.py`: register, login; `/auth/me`
4) `api/routes/dreams.py`: POST create (with AI inline for now), GET list, GET by id
5) `services/ai.py`: `analyze_dream`, `generate_dream_image` (OpenAI key from env)
6) CORS for `localhost:5173/5174`; root `/` + `/health`
7) React shell + pages + protected routes + “Remember me”
8) New Dream form + result panel; list & detail pages
9) Basic dark theme CSS; loading/skeletons
10) README + setup scripts (`venv`, `pip install -r`, `OPENAI_API_KEY` helper)

This spec can be adapted as the codebase evolves; treat it as the source of truth for scope, architecture, and milestones.


