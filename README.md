# OMEN Intelligence

### Built on the Swarms Framework

OMEN is a multi-agent on-chain intelligence platform for memecoin traders and autonomous AI agents operating across Solana and BSC. It answers the single most important question in memecoin trading: **where is this token in its lifecycle and should you ape?**

---

## What OMEN Is

OMEN is a premium multi-agent Web3 intelligence platform built on the Swarms framework. It gives serious crypto traders and AI agents real-time on-chain intelligence across Solana and BSC — before the timeline notices.

---

## Two Modes

### OMEN SCAN
- Paste any token contract address from Solana or BSC
- OMEN auto-detects the chain from the address format
- Runs the OMEN Lifecycle Engine — classifies the exact cycle phase
- Five stages: SEEDING -> IGNITION -> PEAK -> DISTRIBUTION -> DEAD
- Plus attention timing, market psychology, and asymmetric trade logic
- Visual dashboard — membrane waveform, confidence gauge, signal cards, live mempool
- Supports Solana (via Birdeye) and BSC/Ethereum (via Moralis)

### MARKET BRIEF
- Zero input required
- Four Swarms agents fire concurrently and scan Solana & BSC simultaneously
- Live streaming experience — agents stream findings as they work
- Covers whale movements, airdrop opportunities, token unlock risks, VC funding signals
- Ends with one synthesised OMEN Daily Brief
- Any human or AI agent can call it via REST API

---

## Folder Structure

\`\`\`
OMEN/
├── README.md
│
├── backend/
│   ├── main.py                        FastAPI server + all SSE endpoints
│   ├── agents.py                      Swarms agent definitions
│   ├── requirements.txt               Python dependencies
│   ├── .env.example                   API key template (copy to .env)
│   ├── lifecycle/
│   │   └── engine.py                  OMEN Lifecycle Engine classifier
│   └── tools/
│       ├── birdeye_tools.py           Solana token data
│       ├── moralis_tools.py           EVM/BSC token data
│       ├── defillama_tools.py         TVL, airdrops, unlocks, hacks, raises
│       └── coingecko_tools.py         Market data
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx                    Root component, mode toggle state
│       ├── main.jsx                   React 19 entry point
│       ├── index.css                  Base styles
│       └── components/
│           ├── ModeToggle.jsx
│           ├── shared/
│           │   └── Header.jsx
│           ├── ModeA/
│           │   ├── ScanDashboard.jsx  MARKET BRIEF container
│           │   ├── AgentHuntCard.jsx  Live streaming agent card
│           │   └── BriefPanel.jsx     Final daily brief output
│           └── ModeB/
│               ├── CycleScanner.jsx   OMEN SCAN container
│               ├── TokenInput.jsx     Address input + chain selector
│               ├── MembraneSurface.jsx Canvas waveform animation
│               ├── StageDisplay.jsx   Current stage + score bars
│               ├── ConfidenceGauge.jsx Canvas circular arc gauge
│               ├── LaunchParams.jsx   Entry window + slippage + gas
│               ├── SignalCards.jsx    Short/Mid/Long signals
│               ├── SocialMembrane.jsx Attention + social decay panel
│               ├── TradeLogicPanel.jsx Trade logic output
│               ├── AgentStatusBar.jsx Live agent status stream
│               └── MempoolFeed.jsx    Live mempool transactions
\`\`\`

---

## Tech Stack

**Backend**
\`\`\`
Language:     Python
Framework:    FastAPI
Server:       Uvicorn
HTTP client:  httpx
AI agents:    swarms
Streaming:    sse-starlette (Server-Sent Events)
Config:       python-dotenv
\`\`\`

**Frontend**
\`\`\`
Framework:    React 19 + Vite
Canvas:       Native Canvas API (waveform + gauge)
Streaming:    EventSource API (SSE from FastAPI)
Font:         Inter
\`\`\`

**Data Sources**
\`\`\`
Birdeye API     Solana token data
Moralis API     BSC / EVM token data
DeFiLlama API   TVL, protocols, unlocks, hacks, raises (free, no auth)
CoinGecko API   Market data (free, no auth)
\`\`\`

---

## Backend Architecture

### Lifecycle Engine

The core of OMEN SCAN. Classifies any token into its market cycle stage.

**Five stages:**
- SEEDING — low velocity, thin liquidity -> MONITOR
- IGNITION — building pressure, accumulating liquidity -> OPTIMAL ENTRY
- PEAK — maximum velocity, deep liquidity -> TAKE PROFIT
- DISTRIBUTION — selling pressure, liquidity exiting -> AVOID
- DEAD — zero activity -> IGNORE

**Classification algorithm:**
\`\`\`
DEAD:         velocity < 0.05 AND liquidity < 0.1
DISTRIBUTION: 0.3 < velocity < 0.6 AND liquidity > 0.4 AND age < 0.4
PEAK:         velocity > 0.7 AND liquidity > 0.6
IGNITION:     0.2 < velocity < 0.7 AND liquidity > 0.2 AND age > 0.3
SEEDING:      default fallback
\`\`\`

**Confidence formula:**
\`\`\`
confidence = min(95.0, 60.0 + velocity*20.0 + liquidity*20.0)
\`\`\`

**Score mapping from API data:**
\`\`\`
BSC/EVM (Moralis):  velocity  = transfers_24h / 43200
                    liquidity = liquidity_usd / 1_000_000
                    age       = total_holders / 10000

Solana (Birdeye):   velocity  = trade24h / 43200
                    liquidity = liquidity / 1_000_000
                    age       = holder / 10000

All scores capped at 1.0
\`\`\`

**Chain auto-detection:**
\`\`\`
0x prefix + 42 chars total = EVM/BSC
Everything else            = Solana
\`\`\`

### Swarms Agents

**MARKET BRIEF — 4 agents + writer:**
\`\`\`
OMEN-WHALE-AGENT      scans smart money across chains
OMEN-AIRDROP-AGENT    finds high-TVL protocols with no token yet
OMEN-RISK-AGENT       flags unlocks, exploits, governance risks
OMEN-VC-AGENT         tracks funding patterns before narrative
OMEN-BRIEF-WRITER     synthesises all into the OMEN Daily Brief
\`\`\`

**OMEN SCAN — 3 agents:**
\`\`\`
OMEN-LIFECYCLE-DETECTOR   runs Lifecycle Engine classification
OMEN-ATTENTION-AGENT      attention timing + virality scoring
OMEN-TRADE-LOGIC          asymmetric trade opportunity synthesis
\`\`\`

### FastAPI Endpoints

**Streaming (SSE):**
\`\`\`
GET /api/mode-a/scan
    Zero input. Streams all agents live. Returns the daily brief.

GET /api/mode-b/analyse?token_address=X&chain=auto
    Any Solana or BSC address. Streams lifecycle + analysis + trade logic.
\`\`\`

**Mode A events:**
\`\`\`
agent_start      {agent, message, status}
scan_results     {results}
brief_complete   {brief}
scan_complete    {status}
error            {error}
\`\`\`

**Mode B events:**
\`\`\`
chain_detected       {chain, label, message}
agent_start          {agent, message, status}
token_resolved       {symbol, name, price, liquidity, holders, priceChange24h, chain}
lifecycle_classified {stage, confidence, velocity_score, liquidity_score, age_score,
                      description, trader_action, chain, tx_velocity_pct,
                      liquidity_depth_pct, optimal_entry_window,
                      slippage_recommendation, short_signal, mid_signal,
                      long_signal, social_decay_pct, stage_color, stage_bias}
analysis_complete    {results}
trade_complete       {output}
scan_complete        {status, token}
error                {error}
\`\`\`

**Agent-to-agent REST endpoints (JSON):**
\`\`\`
GET /api/agents/whale-scan
GET /api/agents/airdrops
GET /api/agents/unlocks
GET /api/agents/vc-funding
GET /api/agents/lifecycle/{token_address}?chain=auto
\`\`\`

These let other Swarms agents call OMEN as a shared intelligence layer.

---

## Frontend Architecture

### Design System
\`\`\`
Background:     #0d0d12
Panels:         white/3 + border white/10 + rounded
OMEN SCAN:      #06b6d4 (cyan)
MARKET BRIEF:   #a855f7 (purple)
Font:           Inter
Canvas:         60fps requestAnimationFrame for waveform and gauge
\`\`\`

### Stage Colors
\`\`\`
SEEDING:      #22c55e
IGNITION:     #06b6d4
PEAK:         #ef4444
DISTRIBUTION: #f97316
DEAD:         #6b7280
\`\`\`

### Chain Colors
\`\`\`
solana:   #9945FF
bsc:      #F3BA2F
eth:      #627EEA
base:     #0052FF
\`\`\`

### Membrane Surface — Stage Morphologies
\`\`\`
SEEDING:      low tremor + micro harmonic
IGNITION:     building sawtooth
PEAK:         clipped distortion
DISTRIBUTION: decaying right side
DEAD:         near flatline
Dual wave: cyan primary + purple secondary with phase offset
\`\`\`

---

## Running Locally

**Backend**
\`\`\`bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
\`\`\`

**Frontend**
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

 frontend on  https://omen-phi.vercel.app/


---

## Test Tokens

\`\`\`
Solana    JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN    (JUP)
Solana    DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263   (BONK)
Ethereum  0x6982508145454Ce325dDbE47a25d4ec3d2311933     (PEPE)
Ethereum  0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE     (SHIB)
\`\`\`



