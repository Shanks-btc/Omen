# SPECTRA — Web3 Intelligence Swarm
### Built on Swarms Framework | ACM Hackathon 2026

---

## FOR CODEX — READ THIS FIRST

This README is your source of truth for the entire project.
Read every section before touching any file.
Build phase by phase only using SPECTRA_PHASE_PROMPTS.md.
Never build everything at once.
CODEX_BUILD_RULES.md contains the rules you must follow at all times.

---

## What SPECTRA Is

SPECTRA is a premium multi-agent Web3 intelligence platform built on the Swarms framework.
It gives serious crypto traders and AI agents real-time on-chain intelligence across
Ethereum, Solana, BNB Chain, Base, and Arbitrum — before the timeline notices.

---

## Two Modes

### MODE A — Multi-Chain Market Scan
- Zero input required
- Five Swarms agents fire concurrently and scan all major chains simultaneously
- Live streaming war room experience — agents stream findings character by character
- Covers: whale movements, airdrop opportunities, token unlock risks, VC funding signals
- Ends with one synthesised SPECTRA Daily Brief
- Any human or AI agent can call it via REST API

### MODE B — SPECTRA ENGINE
- User pastes any token contract address from any supported chain
- SPECTRA auto-detects chain from address format
- Runs the SPECTRA Lifecycle Engine — classifies exact cycle phase
- Five stages: SEEDING → IGNITION → PEAK → DISTRIBUTION → DEAD
- Plus: attention timing, market psychology, asymmetric trade logic
- Visual dashboard inspired by MLO — membrane waveform, confidence gauge, signal cards
- Supports: Solana (via Birdeye) + Ethereum, BNB, Base, Arbitrum (via Moralis)

---

## Naming Rules — Non-Negotiable

| What | Name to use | Never use |
|------|-------------|-----------|
| Product | SPECTRA | Radar, Signal, anything else |
| Cycle system | Lifecycle Engine | MLO, Membrane Oracle |
| Mode B UI label | SPECTRA ENGINE | Lifecycle Engine (in UI only) |
| All Swarms agents | SPECTRA-[NAME] | Any other prefix |

---

## Complete Folder Structure

```
SPECTRA/
├── README.md                          ← This file. Source of truth.
├── SPECTRA_BUILD_PROMPT.md            ← Full technical spec
├── CODEX_BUILD_RULES.md               ← Build rules for Codex
├── SPECTRA_PHASE_PROMPTS.md           ← 10 phase prompts copy-paste ready
│
├── backend/
│   ├── main.py                        ← FastAPI server + all SSE endpoints
│   ├── agents.py                      ← All 9 Swarms agent definitions
│   ├── requirements.txt               ← Python dependencies
│   ├── .env.example                   ← API key template (copy to .env)
│   ├── lifecycle/
│   │   ├── __init__.py
│   │   └── engine.py                  ← SPECTRA Lifecycle Engine classifier
│   └── tools/
│       ├── __init__.py
│       ├── birdeye_tools.py           ← Solana token data
│       ├── moralis_tools.py           ← EVM token data
│       ├── defillama_tools.py         ← TVL, airdrops, unlocks, hacks, raises
│       └── coingecko_tools.py         ← Market data (supplementary)
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx                    ← Root component, mode toggle state
│       ├── main.jsx                   ← React 19 entry point
│       ├── index.css                  ← Tailwind + base styles
│       ├── lib/
│       │   └── chainDetector.js       ← Auto-detect EVM vs Solana from address
│       ├── hooks/
│       │   ├── useModeAScan.js        ← SSE hook for Mode A
│       │   └── useModeBScan.js        ← SSE hook for Mode B
│       └── components/
│           ├── ModeToggle.jsx         ← Switch between Mode A and Mode B
│           ├── shared/
│           │   ├── Header.jsx         ← SPECTRA header + LIVE indicator
│           │   ├── LoadingSkeleton.jsx
│           │   └── ErrorBoundary.jsx
│           ├── ModeA/
│           │   ├── ScanDashboard.jsx  ← Main Mode A container
│           │   ├── AgentHuntCard.jsx  ← Live streaming agent card
│           │   ├── BriefPanel.jsx     ← Final daily brief output
│           │   └── FrenzyMode.jsx     ← Frenzy Mode placeholder panel
│           └── ModeB/
│               ├── CycleScanner.jsx   ← Main Mode B container
│               ├── TokenInput.jsx     ← Address input + chain selector
│               ├── MembraneSurface.jsx ← Canvas waveform animation (60fps)
│               ├── StageDisplay.jsx   ← Current stage + score bars
│               ├── ConfidenceGauge.jsx ← Canvas circular arc gauge
│               ├── LaunchParams.jsx   ← Entry window + slippage + liquidity
│               ├── SignalCards.jsx    ← Short/Mid/Long bar charts
│               ├── SocialMembrane.jsx ← Attention + social decay panel
│               ├── TradeLogicPanel.jsx ← Trade logic output
│               └── AgentStatusBar.jsx ← Live agent status stream
```

---

## Tech Stack

### Backend
```
Language:     Python 3.11 (use 3.11 not 3.13)
Framework:    FastAPI
Server:       Uvicorn
HTTP client:  httpx (async-compatible, replaces requests)
AI agents:    swarms (ConcurrentWorkflow + SequentialWorkflow)
Streaming:    sse-starlette (Server-Sent Events)
Config:       python-dotenv
```

### Frontend
```
Framework:    React 19 + Vite
Styling:      Tailwind CSS v4
Animation:    Framer Motion
Canvas:       Native Canvas API (waveform + gauge)
Streaming:    EventSource API (SSE from FastAPI)
```

### Data Sources
```
Birdeye API     → Solana token data (free tier, X-API-KEY header)
Moralis API     → EVM token data (free tier, X-API-Key header)
DeFiLlama API   → TVL, protocols, unlocks, hacks, raises (free, no auth)
CoinGecko API   → Market data (free, no auth)
```

---

## Backend Architecture

### Lifecycle Engine (lifecycle/engine.py)
The core of Mode B. Classifies any token into its market cycle stage.

**Five stages:**
- SEEDING: Low velocity, thin liquidity → MONITOR
- IGNITION: Building pressure, accumulating liquidity → OPTIMAL ENTRY
- PEAK: Maximum velocity, deep liquidity → TAKE PROFIT
- DISTRIBUTION: Selling pressure, liquidity exiting → AVOID
- DEAD: Zero activity → IGNORE

**Classification algorithm:**
```
DEAD:         velocity < 0.05 AND liquidity < 0.1
DISTRIBUTION: 0.3 < velocity < 0.6 AND liquidity > 0.4 AND age < 0.4
PEAK:         velocity > 0.7 AND liquidity > 0.6
IGNITION:     0.2 < velocity < 0.7 AND liquidity > 0.2 AND age > 0.3
SEEDING:      default fallback
```

**Confidence formula:**
```
confidence = min(95.0, 60.0 + velocity*20.0 + liquidity*20.0)
```

**Score mapping from API data:**
```
EVM (Moralis):   velocity = transfers_24h / 43200
                 liquidity = liquidity_usd / 1_000_000
                 age = total_holders / 10000

Solana (Birdeye): velocity = trade24h / 43200
                  liquidity = liquidity / 1_000_000
                  age = holder / 10000

All scores capped at 1.0
```

**Chain auto-detection:**
```
0x prefix + 42 chars total = EVM
Everything else = Solana
```

### Swarms Agents (agents.py)

**Mode A — 5 agents:**
```
SPECTRA-WHALE-AGENT      → scans smart money across all chains
SPECTRA-AIRDROP-AGENT    → finds high-TVL protocols with no token yet
SPECTRA-RISK-AGENT       → flags unlocks, exploits, governance risks
SPECTRA-VC-AGENT         → tracks funding patterns before narrative
SPECTRA-BRIEF-WRITER     → synthesises all 4 into SPECTRA Daily Brief
```

**Mode B — 4 agents:**
```
SPECTRA-LIFECYCLE-DETECTOR → runs Lifecycle Engine classification
SPECTRA-ATTENTION-AGENT    → attention timing + virality scoring
SPECTRA-PSYCHOLOGY-AGENT   → crowd psychology diagnosis
SPECTRA-TRADE-LOGIC        → asymmetric trade opportunity synthesis
```

**Workflow pattern:**
```
Mode A: ConcurrentWorkflow(whale + airdrop + risk + vc) → SequentialWorkflow(brief writer)
Mode B: ConcurrentWorkflow(lifecycle + attention + psychology) → SequentialWorkflow(trade logic)
```

### FastAPI Endpoints (main.py)

**SSE Endpoints (streaming):**
```
GET /api/mode-a/scan
    → Zero input. Streams all 5 agents live. Returns daily brief.

GET /api/mode-b/analyse?token_address=X&chain=auto
    → Any ERC-20 or Solana address. Streams lifecycle + analysis + trade logic.
```

**SSE Events emitted by Mode A:**
```
agent_start      → {agent, message, status}
scan_results     → {results}
brief_complete   → {brief}
scan_complete    → {status}
error            → {error}
```

**SSE Events emitted by Mode B:**
```
chain_detected       → {chain, label, message}
agent_start          → {agent, message, status}
token_resolved       → {symbol, name, price, liquidity, holders, priceChange24h, chain}
lifecycle_classified → {stage, confidence, velocity_score, liquidity_score, age_score,
                        description, trader_action, visual_signature, chain,
                        tx_velocity_pct, liquidity_depth_pct, optimal_entry_window,
                        slippage_recommendation, short_signal, mid_signal, long_signal,
                        social_decay_pct, stage_color, stage_bias}
analysis_complete    → {results}
trade_complete       → {output}
scan_complete        → {status, token}
error                → {error}
```

**Agent-to-Agent REST Endpoints (JSON):**
```
GET /api/agents/whale-scan
GET /api/agents/airdrops
GET /api/agents/unlocks
GET /api/agents/vc-funding
GET /api/agents/lifecycle/{token_address}?chain=auto
```

---

## Frontend Architecture

### Design System
```
Background:     #0a0a0f (near black)
Panels:         bg-white/3 or bg-white/5 + border-white/10 + rounded-xl
Mode A accent:  #06b6d4 (cyan)
Mode B accent:  #a855f7 (purple)
Font:           monospace throughout
Animations:     Framer Motion for all transitions
Canvas:         60fps requestAnimationFrame for waveform and gauge
```

### Stage Color System
```
SEEDING:      #22c55e (green)
IGNITION:     #06b6d4 (cyan)
PEAK:         #ef4444 (red)
DISTRIBUTION: #f97316 (orange)
DEAD:         #6b7280 (gray)
```

### Chain Color System
```
solana:   #9945FF
eth:      #627EEA
bsc:      #F3BA2F
base:     #0052FF
arbitrum: #28A0F0
```

### SSE Connection Pattern
```javascript
// Both modes follow this exact pattern
const es = new EventSource("http://localhost:8000/api/[endpoint]")
es.addEventListener("[event_name]", (e) => {
  const data = JSON.parse(e.data)
  // update state
})
es.addEventListener("scan_complete", () => {
  setScanning(false)
  es.close()
})
es.addEventListener("error", (e) => {
  setError(JSON.parse(e.data).error)
  setScanning(false)
  es.close()
})
```

### MembraneSurface Canvas — Stage Morphologies
```
SEEDING:      amplitude=12, freq=0.018, speed=0.03 — low tremor + micro harmonic
IGNITION:     amplitude=30, freq=0.035, speed=0.07 — building sawtooth
PEAK:         amplitude=50, freq=0.055, speed=0.12 — clipped distortion (clamp ±70%)
DISTRIBUTION: amplitude=22, freq=0.028, speed=0.04 — decaying right side
DEAD:         amplitude=2,  freq=0.01,  speed=0.01 — near flatline
All: shadowBlur=20, shadowColor=stageColor (except DEAD)
Second harmonic: stageColor+"40", lineWidth=0.5, half amplitude
```

### ConfidenceGauge Canvas — Arc Spec
```
Arc from 135° to 45° clockwise (270° total sweep)
Background arc: rgba(255,255,255,0.06), lineWidth=10, lineCap=round
Confidence arc: stageColor, lineWidth=10, shadowBlur=15
Center: confidence number large bold + "%" smaller
Below canvas: stage_bias label in stageColor
SPECTRA V1 badge: small circle with stageColor border
```

### Mode B Layout — Three Row Grid
```
Row 1: MembraneSurface (lg:col-span-2) | ConfidenceGauge (lg:col-span-1)
Row 2: StageDisplay                    | SignalCards
Row 3: LaunchParams                    | SocialMembrane
Below: TradeLogicPanel (AnimatePresence)
```

---

## Test Tokens

```
Solana:   JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN   (JUP)
Solana:   DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263  (BONK)
Ethereum: 0x6982508145454Ce325dDbE47a25d4ec3d2311933       (PEPE)
Ethereum: 0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE       (SHIB)
```

---

## Build Order

```
Phase 1  → backend/requirements.txt + .env.example + main.py (health route)
Phase 2  → backend/lifecycle/engine.py
Phase 3  → backend/tools/ (all 4 tool files)
Phase 4  → backend/agents.py
Phase 5  → backend/main.py (full SSE + REST endpoints)
Phase 6  → frontend setup (package.json, vite.config, index.html, index.css, main.jsx)
Phase 7  → shared components + ModeToggle + App.jsx
Phase 8  → ModeA components (ScanDashboard, AgentHuntCard, BriefPanel, FrenzyMode)
Phase 9  → ModeB components (all 10 components)
Phase 10 → Integration, testing, Swarms publishing script
```

---

## API Keys Needed (add to backend/.env when ready to run)

```
OPENAI_API_KEY   → platform.openai.com
SWARMS_API_KEY   → swarms.world/platform/dashboard
BIRDEYE_API_KEY  → birdeye.so/developers (free)
MORALIS_API_KEY  → moralis.io (free)
```

---

## Ports

```
Backend:  http://localhost:8000
Frontend: http://localhost:5173
```

---

## Run Commands (after building)

```bash
# Backend
cd backend
pip3 install -r requirements.txt
uvicorn main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

---

## Swarms Marketplace

```
Name:     SPECTRA — Multi-Chain Web3 Intelligence Swarm
Category: finance
Price:    $4.99
Tags:     web3, solana, ethereum, BNB, trading, whale-tracking, airdrop,
          lifecycle, DeFi, intelligence, multi-chain, on-chain, alpha,
          daily-brief, cycle-detection
```

---

*SPECTRA — Built for the Swarms ACM Hackathon 2026*
*Source of truth: This README + SPECTRA_BUILD_PROMPT.md*
*Build rules: CODEX_BUILD_RULES.md*
*Phase prompts: SPECTRA_PHASE_PROMPTS.md*