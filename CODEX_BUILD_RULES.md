# CODEX BUILD RULES — SPECTRA

## Core Rules

1. Build phase by phase only. Never attempt to build the entire project at once.
2. Never rewrite the whole project in a single response.
3. Never delete or rename existing folders or files.
4. Never touch files outside the current phase scope.
5. Always list the exact files you will edit BEFORE editing them.
6. After every phase, give the exact terminal command to test it.
7. Stop after each phase and wait for confirmation before proceeding.
8. SPECTRA_BUILD_PROMPT.md is the single source of truth for all logic, naming, and structure.
9. If anything is unclear, ask before building. Do not guess.
10. If a file already exists, read it first before editing.

## Naming Rules — Non-Negotiable

- Product name: **SPECTRA** everywhere in code, UI, comments, and API responses
- Cycle classification system: **"Lifecycle Engine"** in all code and comments
- Mode B UI display label: **"SPECTRA ENGINE"** — only in the UI text the user sees
- All Swarms agent names: **"SPECTRA-[AGENTNAME]"** format
- Never use "MLO", "Membrane Oracle", or "RADAR" anywhere in this project

## Build Phases — In Order

```
Phase 1  → backend/requirements.txt + .env.example + main.py (health route only)
Phase 2  → backend/lifecycle/engine.py
Phase 3  → backend/tools/ (moralis_tools.py, birdeye_tools.py, defillama_tools.py)
Phase 4  → backend/agents.py
Phase 5  → backend/main.py (full SSE endpoints + agent-to-agent routes)
Phase 6  → frontend setup (package.json, vite.config.js, index.html, tailwind.config.js)
Phase 7  → frontend/src/shared/ (Header.jsx, LoadingSkeleton.jsx, ErrorBoundary.jsx)
Phase 8  → frontend/src/App.jsx + ModeToggle.jsx + lib/chainDetector.js
Phase 9  → frontend/src/components/ModeA/ (all 4 components)
Phase 10 → frontend/src/components/ModeB/ (all 10 components)
Phase 11 → Integration testing + debugging
Phase 12 → README.md + Swarms marketplace publishing script
```

## Phase Commands — Reference

| Phase | Test Command |
|-------|-------------|
| 1 | `cd backend && uvicorn main:app --reload` then `curl http://localhost:8000/` |
| 2 | `cd backend && python -c "from lifecycle.engine import classify; print(classify(0.5,0.5,0.5,'eth','TEST'))"` |
| 3 | `cd backend && python -c "from tools.defillama_tools import get_recent_hacks; print(get_recent_hacks())"` |
| 4 | `cd backend && python -c "from agents import build_mode_a_workflow; print('agents ok')"` |
| 5 | `curl http://localhost:8000/api/mode-a/scan` (should stream SSE events) |
| 6 | `cd frontend && npm install && npm run dev` |
| 7-10 | Visual check at `http://localhost:5173` |

## File Ownership — Do Not Cross These Lines

```
backend/    → Python only. No JS. No JSX.
frontend/   → JS/JSX/CSS only. No Python.
lifecycle/  → engine.py only. Classification logic only.
tools/      → One file per data source. No agent logic here.
agents.py   → Agent definitions only. No FastAPI routes here.
main.py     → FastAPI routes only. No agent definitions here.
```

## API Keys Required (all free tier)

```
OPENAI_API_KEY    → platform.openai.com
SWARMS_API_KEY    → swarms.world/platform/dashboard
BIRDEYE_API_KEY   → birdeye.so/developers
MORALIS_API_KEY   → moralis.io
```

## Port Assignments

```
Backend  → http://localhost:8000
Frontend → http://localhost:5173
```

## Tech Stack — Confirmed

```
Backend:  Python 3.10 or 3.11 (NOT 3.13) + swarms + fastapi + uvicorn + httpx + sse-starlette + python-dotenv
Frontend: React 19 + Vite + Tailwind CSS v4 + Framer Motion + Canvas API + EventSource API
```

---

*This file is the law. SPECTRA_BUILD_PROMPT.md is the spec. Build phase by phase.*