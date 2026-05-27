# SPECTRA — Phase-by-Phase Codex Prompts

Copy one block at a time. Wait for confirmation before moving to the next.

---

## PHASE 1 — Backend Foundation

```
You are building SPECTRA, a multi-agent Web3 intelligence platform.

SPECTRA_BUILD_PROMPT.md and CODEX_BUILD_RULES.md are your source of truth.
Read both files fully before doing anything.

Your task is Phase 1 only. Stop after Phase 1.

Create these three files inside the backend/ folder:

1. backend/requirements.txt
Content:
swarms
fastapi
uvicorn
httpx
python-dotenv
pydantic
sse-starlette

2. backend/.env.example
Content:
OPENAI_API_KEY=your_openai_key
SWARMS_API_KEY=your_swarms_key
BIRDEYE_API_KEY=your_birdeye_key
MORALIS_API_KEY=your_moralis_key

3. backend/main.py
Create a minimal FastAPI app with:
- CORS middleware allowing all origins
- One GET route at "/" returning:
  {"product": "SPECTRA", "version": "1.0.0", "status": "online",
   "modes": {"A": "Multi-Chain Market Scan", "B": "Lifecycle Engine"}}
- if __name__ == "__main__": uvicorn.run block on port 8000

Do not create any other files.
Do not create frontend files.

After finishing, give me this exact test command:
cd backend && pip3 install -r requirements.txt && uvicorn main:app --reload

Stop here.
```

---

## PHASE 2 — Lifecycle Engine

```
SPECTRA Phase 2. Source of truth: SPECTRA_BUILD_PROMPT.md.

Do not touch any files except what is listed below.
Do not edit main.py. Do not create frontend files.

Create this file: backend/lifecycle/__init__.py (empty file)
Create this file: backend/lifecycle/engine.py

engine.py must contain exactly:

1. LifecycleStage enum: SEEDING, IGNITION, PEAK, DISTRIBUTION, DEAD

2. STAGE_CONFIG dict with color, bias, action for each stage:
   SEEDING:      color=#22c55e, bias="ACCUMULATION BIAS", action="MONITOR — wait for ignition"
   IGNITION:     color=#06b6d4, bias="ENTRY BIAS",        action="OPTIMAL ENTRY — ignition confirmed"
   PEAK:         color=#ef4444, bias="EXIT BIAS",         action="TAKE PROFIT / EXIT"
   DISTRIBUTION: color=#f97316, bias="AVOID BIAS",        action="AVOID ENTRY — distribution"
   DEAD:         color=#6b7280, bias="DEAD BIAS",         action="IGNORE — no edge"

3. EngineResult dataclass with these exact fields:
   stage, confidence, velocity_score, liquidity_score, age_score,
   description, trader_action, visual_signature, chain, token_symbol,
   tx_velocity_pct, liquidity_depth_pct, optimal_entry_window,
   slippage_recommendation, short_signal, mid_signal, long_signal, social_decay_pct

4. classify(velocity_score, liquidity_score, age_score, chain, token_symbol) function:
   Classification rules (exact):
   - DEAD: velocity < 0.05 AND liquidity < 0.1
   - DISTRIBUTION: 0.3 < velocity < 0.6 AND liquidity > 0.4 AND age < 0.4
   - PEAK: velocity > 0.7 AND liquidity > 0.6
   - IGNITION: 0.2 < velocity < 0.7 AND liquidity > 0.2 AND age > 0.3
   - SEEDING: default fallback
   Confidence: min(95.0, 60.0 + velocity*20.0 + liquidity*20.0)
   
   Computed fields:
   - tx_velocity_pct = velocity_score * 100
   - liquidity_depth_pct = liquidity_score * 100
   - optimal_entry_window: if vel>0.6: "12:00-14:00 UTC" elif vel>0.3: "10:00-16:00 UTC" else: "08:00-20:00 UTC"
   - slippage: if liq<0.1: "10-15%" elif liq<0.3: "5-8%" elif liq<0.6: "3-5%" else: "1-2%"
   - short_signal = min(100, velocity*100 * (1.2 if IGNITION else 0.8))
   - mid_signal = min(100, liquidity*100)
   - long_signal = min(100, age*100 * (0.6 if PEAK or DISTRIBUTION else 1.0))
   - social_decay_pct = min(100, (1-age)*60 + velocity*20)

5. scores_from_moralis(data: dict) -> dict:
   velocity = min(1.0, data.get("transfers_24h", 0) / 43200)
   liquidity = min(1.0, data.get("liquidity_usd", 0) / 1_000_000)
   age = min(1.0, data.get("total_holders", 0) / 10000)
   return dict with velocity_score, liquidity_score, age_score

6. scores_from_birdeye(data: dict) -> dict:
   velocity = min(1.0, data.get("trade24h", 0) / 43200)
   liquidity = min(1.0, data.get("liquidity", 0) / 1_000_000)
   age = min(1.0, data.get("holder", 0) / 10000)
   return dict with velocity_score, liquidity_score, age_score

7. detect_chain_from_address(address: str) -> str:
   return "evm" if address.strip().startswith("0x") and len(address.strip())==42 else "solana"

Test command after finishing:
cd backend && python -c "
from lifecycle.engine import classify, detect_chain_from_address
r = classify(0.35, 0.45, 0.55, 'solana', 'TEST')
print(r.stage, r.confidence, r.trader_action)
print(detect_chain_from_address('0x6982508145454Ce325dDbE47a25d4ec3d2311933'))
print(detect_chain_from_address('JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'))
"

Stop here. Do not proceed to Phase 3.
```

---

## PHASE 3 — API Tools

```
SPECTRA Phase 3. Source of truth: SPECTRA_BUILD_PROMPT.md.

Do not touch main.py, agents.py, lifecycle/engine.py, or any frontend files.

Create these files:
- backend/tools/__init__.py (empty)
- backend/tools/birdeye_tools.py
- backend/tools/moralis_tools.py
- backend/tools/defillama_tools.py

BIRDEYE_TOOLS.PY (Solana data):
Base URL: https://public-api.birdeye.so
Headers: {"X-API-KEY": os.getenv("BIRDEYE_API_KEY",""), "x-chain":"solana"}
All calls use httpx.Client with timeout=10

Functions:
1. get_token_overview_raw(addr: str) -> dict
   GET /defi/token_overview with params={"address": addr}
   Return data["data"] if success else {}

2. get_token_overview(addr: str) -> str
   Call get_token_overview_raw, return formatted string with symbol, price, 24h volume,
   liquidity, trade24h, holder, priceChange24hPercent

3. get_token_security(addr: str) -> str
   GET /defi/token_security, return top10HolderPercent, creatorPercentage, mutableMetadata

4. get_top_traders(addr: str) -> str
   GET /defi/v2/tokens/top_traders with time_frame=24h limit=5
   Return top 5 traders with pnl, volume, buy/sell direction

5. get_solana_whale_movements() -> str
   GET /defi/tokenlist sorted by v24hUSD desc, limit=20, min_liquidity=100000
   Flag tokens where abs(v24hChangePercent) > 50

MORALIS_TOOLS.PY (EVM data):
Base URL: https://deep-index.moralis.io/api/v2.2
Headers: {"X-API-Key": os.getenv("MORALIS_API_KEY",""), "accept":"application/json"}
CHAIN_MAP: eth/ethereum->eth, bnb/bsc->bsc, base->base, arbitrum->arbitrum

Functions:
1. get_erc20_token_data(addr: str, chain: str = "eth") -> dict
   Three separate httpx calls (each in try/except):
   - GET /erc20/{addr}/price -> price_usd, symbol, name
   - GET /erc20/{addr}/stats -> transfers_24h, liquidity_usd
   - GET /erc20/{addr}/holders -> total_holders, holder_change_24h
   Return combined dict with all fields + chain key

2. get_erc20_token_summary(addr: str, chain: str = "eth") -> str
   Call get_erc20_token_data, return formatted string

3. get_evm_whale_movements(chain: str = "eth") -> str
   GET /erc20/transfers with chain and limit=20
   Flag transfers where value_decimal > 50000

4. scan_all_evm_chains() -> str
   Call get_evm_whale_movements for eth, bsc, base, arbitrum
   Join results with double newline

DEFILLAMA_TOOLS.PY (free, no auth):
Base URL: https://api.llama.fi
All calls use httpx.Client with timeout=15

Functions:
1. get_airdrop_opportunities() -> str
   GET /protocols, filter where no symbol AND tvl > 50_000_000
   Sort by TVL desc, return top 5 with name, TVL, chains, category

2. get_token_unlocks() -> str
   GET https://unlocks.llama.fi/unlocks
   Flag events where noOfTokens * tokenPrice > 10_000_000
   Sort by amount desc, return top 5

3. get_recent_hacks() -> str
   GET /hacks, sort by date desc, return top 5 with name, amount, chain

4. get_recent_raises() -> str
   GET /raises, filter amount > 5_000_000, group by category
   Return sector totals with lead VC names

Wrap every httpx call in try/except. Never let a tool crash the whole server.

Test command:
cd backend && python -c "
from tools.defillama_tools import get_recent_hacks
print(get_recent_hacks()[:200])
from tools.defillama_tools import get_recent_raises
print(get_recent_raises()[:200])
"

Stop here. Do not proceed to Phase 4.
```

---

## PHASE 4 — Swarms Agents

```
SPECTRA Phase 4. Source of truth: SPECTRA_BUILD_PROMPT.md.

Do not touch main.py, lifecycle/, tools/, or any frontend files.

Create: backend/agents.py

Import from swarms: Agent, ConcurrentWorkflow
Import all tool functions from tools/

Create these 9 agents. Each must have:
- agent_name starting with "SPECTRA-"
- model_name: "gpt-4o-mini" for analysis agents, "gpt-4o" for synthesis agents
- system_prompt (detailed, as per SPECTRA_BUILD_PROMPT.md)
- tools list (as specified)
- max_loops=1
- streaming_on=True for Mode A agents

MODE A AGENTS (4 + 1 synthesis):

1. SPECTRA-WHALE-AGENT
   tools: [get_solana_whale_movements, scan_all_evm_chains]
   system_prompt: Scan smart money across ETH/SOL/BNB/Base/Arbitrum.
   Identify accumulation vs exit. Output streaming style with → prefix.
   Format: "WHALE AGENT — SCANNING [X] WALLETS...\n→ [finding] ⚡"

2. SPECTRA-AIRDROP-AGENT
   tools: [get_airdrop_opportunities]
   system_prompt: Find high-TVL protocols with no token yet.
   Format: "AIRDROP AGENT — SCANNING 2,400+ PROTOCOLS...\n→ [protocol]: $[TVL] 🎯"

3. SPECTRA-RISK-AGENT
   tools: [get_token_unlocks, get_recent_hacks]
   system_prompt: Flag token unlocks with dates/amounts and recent exploits.
   Format: "RISK AGENT — SCANNING UNLOCK SCHEDULES...\n→ [risk with amount and date] ⚠️"

4. SPECTRA-VC-AGENT
   tools: [get_recent_raises]
   system_prompt: Identify VC funding patterns before they become public narrative.
   Format: "VC AGENT — SCANNING FUNDING ROUNDS...\n→ Pattern: [VC] backing [sector] 🔥"

5. SPECTRA-BRIEF-WRITER (model: gpt-4o, no tools)
   system_prompt: Synthesise whale/airdrop/risk/VC intelligence into SPECTRA daily brief.
   Exact output format:
   SPECTRA DAILY BRIEF — [DATE] UTC
   🐋 SMART MONEY (12h) → [findings]
   🪂 AIRDROP ALPHA → [findings]
   ⚠️ RISK EVENTS → [findings]
   💰 VC SIGNAL → [findings]
   📌 TOP INSIGHT TODAY → [action]

MODE B AGENTS (3 + 1 synthesis):

6. SPECTRA-LIFECYCLE-DETECTOR
   tools: [get_token_overview, get_erc20_token_summary, get_token_security, get_top_traders]
   model: gpt-4o-mini
   system_prompt: Run SPECTRA Lifecycle Engine classification. Know the 5 stages and rules.
   Output lifecycle phase with velocity/liquidity/maturity scores and trader action.

7. SPECTRA-ATTENTION-AGENT
   tools: [get_token_overview, get_erc20_token_summary]
   model: gpt-4o-mini
   system_prompt: Determine attention cycle (EARLY/BUILDING/PEAKED/FADING).
   Score virality 0-100. Identify retail awareness and asymmetric window status.

8. SPECTRA-PSYCHOLOGY-AGENT
   tools: [get_token_overview, get_erc20_token_summary, get_top_traders]
   model: gpt-4o-mini
   system_prompt: Diagnose crowd psychology state. Predict next move.
   States: ACCUMULATION/CAUTIOUS_OPTIMISM/FOMO_BUILDING/EUPHORIA/DISTRIBUTION/CAPITULATION/DEPRESSION

9. SPECTRA-TRADE-LOGIC (model: gpt-4o, no tools)
   system_prompt: Final synthesis. Given lifecycle + attention + psychology, output:
   OPPORTUNITY / Risk:Reward / Entry Logic / Position Size / Invalidation / Exit Signal / Viral Angle / VERDICT
   If PEAK or DISTRIBUTION: say AVOID clearly.

Create two workflow builder functions:

def build_mode_a_workflow():
    concurrent = ConcurrentWorkflow(agents=[whale_agent, airdrop_agent, risk_agent, vc_agent], max_loops=1)
    return concurrent, brief_writer_agent

def build_mode_b_workflow():
    concurrent = ConcurrentWorkflow(agents=[lifecycle_detector_agent, attention_agent, psychology_agent], max_loops=1)
    return concurrent, trade_logic_agent

Test command:
cd backend && python -c "
from agents import build_mode_a_workflow, build_mode_b_workflow
c1, b1 = build_mode_a_workflow()
c2, b2 = build_mode_b_workflow()
print('Mode A agents:', len(c1.agents))
print('Mode B agents:', len(c2.agents))
print('All agents OK')
"

Stop here. Do not proceed to Phase 5.
```

---

## PHASE 5 — FastAPI SSE Endpoints

```
SPECTRA Phase 5. Source of truth: SPECTRA_BUILD_PROMPT.md.

Do not touch agents.py, lifecycle/, tools/, or any frontend files.
Edit backend/main.py only.

Replace the existing main.py health route with the full implementation.
Keep the health route. Add all SSE and REST endpoints.

Imports needed:
asyncio, json, os, fastapi (FastAPI, Query), CORSMiddleware,
sse_starlette.sse (EventSourceResponse), dotenv (load_dotenv),
agents (build_mode_a_workflow, build_mode_b_workflow),
lifecycle.engine (classify, scores_from_moralis, scores_from_birdeye,
detect_chain_from_address, STAGE_CONFIG),
tools.moralis_tools (get_erc20_token_data),
tools.birdeye_tools (get_token_overview_raw)

SSE ENDPOINT 1: GET /api/mode-a/scan
No input required. Uses EventSourceResponse.
Async generator that:
1. Yields agent_start events for 4 agents with scanning messages (0.3s delay between)
2. Runs build_mode_a_workflow() concurrent scan with task asking for full multi-chain scan
3. Yields scan_results event with results string
4. Yields agent_start for brief writer
5. Runs brief_writer on results
6. Yields brief_complete with brief string
7. Yields scan_complete with status:complete

SSE ENDPOINT 2: GET /api/mode-b/analyse?token_address=X&chain=auto
Uses EventSourceResponse.
Async generator that:
1. Detects chain using detect_chain_from_address if chain=="auto"
2. Yields chain_detected event with chain/label/message
3. If Solana: calls get_token_overview_raw, builds token_info dict, calls scores_from_birdeye
4. If EVM: calls get_erc20_token_data, builds token_info dict, calls scores_from_moralis
5. If token not found: yields error event and returns
6. Yields token_resolved event with token_info dict
7. Calls classify() with scores, chain, symbol
8. Yields lifecycle_classified event with ALL EngineResult fields including
   stage_color and stage_bias from STAGE_CONFIG
9. Yields agent_start events for 3 Mode B agents (0.15s delay)
10. Runs build_mode_b_workflow() concurrent analysis
11. Yields analysis_complete with results
12. Yields agent_start for trade logic agent
13. Runs trade_logic_agent on results
14. Yields trade_complete with output
15. Yields scan_complete

REST ENDPOINTS (return JSON, no SSE):
GET /api/agents/whale-scan
GET /api/agents/airdrops
GET /api/agents/unlocks
GET /api/agents/vc-funding
GET /api/agents/lifecycle/{token_address}?chain=auto
  → auto-detect chain, call engine, return stage/confidence/trader_action/scores

Test commands:
cd backend && uvicorn main:app --reload

Then in new terminal:
curl http://localhost:8000/
curl "http://localhost:8000/api/agents/unlocks"
curl "http://localhost:8000/api/agents/lifecycle/JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN?chain=solana"

Stop here. Do not build frontend yet.
```

---

## PHASE 6 — Frontend Setup

```
SPECTRA Phase 6. Source of truth: SPECTRA_BUILD_PROMPT.md.

Do not touch backend files.

Create the frontend/ folder structure with these files:

1. frontend/package.json
Dependencies:
- react: ^19.0.0
- react-dom: ^19.0.0
- framer-motion: ^11.0.0
- lucide-react: ^0.383.0
DevDependencies:
- @vitejs/plugin-react: ^4.0.0
- vite: ^5.0.0
- tailwindcss: ^4.0.0
- autoprefixer: ^10.0.0
Scripts: dev, build, preview

2. frontend/vite.config.js
Standard React + Vite config

3. frontend/index.html
Standard HTML with id="root" div and src/main.jsx script

4. frontend/tailwind.config.js
Content: ["./src/**/*.{js,jsx}"]

5. frontend/src/index.css
Tailwind directives + base styles:
body { background: #0a0a0f; color: white; font-family: monospace; }
* { box-sizing: border-box; }

6. frontend/src/main.jsx
Standard React 19 root render of App component

7. frontend/src/App.jsx
Placeholder only for now:
import Header from "./components/shared/Header"
Shows: <div><Header /><main><p style={{color:"white",padding:"2rem"}}>SPECTRA loading...</p></main></div>

8. frontend/src/components/shared/Header.jsx
Full header: "SPECTRA | WEB3 INTELLIGENCE SWARM" left side
Green pulse + "LIVE" + "Powered by Swarms" right side
Background: border-b border-white/10, padding px-6 py-4

9. frontend/src/lib/chainDetector.js
export const detectChain = (addr) => addr.trim().startsWith("0x") && addr.trim().length===42 ? "evm" : "solana"
export const CHAIN_OPTIONS = [{value:"auto",label:"⚡ Auto-detect"},{value:"solana",label:"◎ Solana"},{value:"eth",label:"Ξ Ethereum"},{value:"bsc",label:"⬡ BNB Chain"},{value:"base",label:"🔵 Base"},{value:"arbitrum",label:"🔷 Arbitrum"}]
export const CHAIN_COLORS = {solana:"#9945FF",eth:"#627EEA",bsc:"#F3BA2F",base:"#0052FF",arbitrum:"#28A0F0",auto:"#06b6d4"}

Test command:
cd frontend && npm install && npm run dev
Open http://localhost:5173 — should show SPECTRA header and loading text.

Stop here.
```

---

## PHASE 7 — Mode Toggle + Shared Components

```
SPECTRA Phase 7. Source of truth: SPECTRA_BUILD_PROMPT.md.

Do not touch backend. Do not touch ModeA/ or ModeB/ yet.

Create/edit these frontend files only:

1. frontend/src/components/shared/LoadingSkeleton.jsx
Animated pulse skeleton: rounded-xl bg-white/5 animate-pulse

2. frontend/src/components/shared/ErrorBoundary.jsx
Class component ErrorBoundary that catches errors and shows:
"Something went wrong — check the backend is running on port 8000"

3. frontend/src/components/ModeToggle.jsx
Two buttons side by side in a pill container:
- Mode A: "⚡ MARKET SCAN" subtitle "Multi-Chain · Zero Input" accent=cyan #06b6d4
- Mode B: "🔬 SPECTRA ENGINE" subtitle "Any Token · Any Chain" accent=purple #a855f7
Active button gets colored background/border. Inactive is white/30.

4. Update frontend/src/App.jsx to full version:
import { useState } from "react"
import Header from "./components/shared/Header"
import ModeToggle from "./components/ModeToggle"
Toggle between Mode A and Mode B placeholder divs for now.
Mode A placeholder: <div style={{padding:"2rem",color:"#06b6d4"}}>MODE A — Coming in Phase 9</div>
Mode B placeholder: <div style={{padding:"2rem",color:"#a855f7"}}>MODE B — Coming in Phase 10</div>

Test: npm run dev, check toggle switches between cyan and purple placeholders.

Stop here.
```

---

## PHASE 8 — Mode A UI

```
SPECTRA Phase 8. Source of truth: SPECTRA_BUILD_PROMPT.md.

Do not touch backend. Do not touch ModeB/ components.

Create these files inside frontend/src/components/ModeA/:

1. AgentHuntCard.jsx
Props: agent {id, icon, name, sub, color}, state {status, msgs}
- Rounded panel with dynamic border color (white/10 idle, agent.color+60 scanning, agent.color+30 done)
- When scanning: Framer Motion pulsing box shadow in agent color
- Agent icon + name in agent color when active + subtitle in white/20
- Status dot: white/10 idle, pulsing in agent color scanning, solid agent color done
- Message list: each msg has → prefix in agent color
- Min height for message area

2. BriefPanel.jsx
Props: brief (string)
- Framer Motion fade+slide in on mount
- White border panel with "📋 SPECTRA DAILY BRIEF" title
- Copy & Share button (navigator.clipboard)
- Pre tag with brief text in white/65 monospace

3. FrenzyMode.jsx
Props: visible (bool)
- Placeholder panel for now with:
  "⚡ FRENZY MODE — Token trading interface coming soon"
  Purple/cyan gradient border
  Note: "Enable on Swarms Marketplace to activate $SPECTRA token"

4. ScanDashboard.jsx
Four agents config:
{id:"whale", icon:"🔍", name:"WHALE AGENT", sub:"Smart Money Scanner", color:"#06b6d4"}
{id:"airdrop", icon:"🪂", name:"AIRDROP AGENT", sub:"Opportunity Hunter", color:"#22c55e"}
{id:"risk", icon:"⚠️", name:"RISK AGENT", sub:"Unlock & Exploit Monitor", color:"#f97316"}
{id:"vc", icon:"💰", name:"VC AGENT", sub:"Funding Intelligence", color:"#a855f7"}

State: scanning, agentStates (object keyed by id), brief

Scan function:
- Creates EventSource to http://localhost:8000/api/mode-a/scan
- On agent_start: parse agent name to find key, add message to that agent's msgs array, set status to scanning
- On scan_results: set all 4 agents to complete
- On brief_complete: set brief state
- On scan_complete: set scanning false, close EventSource
- On error: set scanning false, close EventSource

Layout:
- Title "MULTI-CHAIN MARKET SCAN" + subtitle
- "⚡ RUN MARKET SCAN" button (disabled when scanning)
- 2×2 grid of AgentHuntCard components
- BriefPanel below (AnimatePresence)
- FrenzyMode panel at bottom

Update App.jsx to import and render ScanDashboard for Mode A.

Test:
- npm run dev
- Start backend: cd backend && uvicorn main:app --reload
- Click RUN MARKET SCAN in browser
- Agent cards should light up and stream messages
- Brief should appear when complete

Stop here.
```

---

## PHASE 9 — Mode B UI

```
SPECTRA Phase 9. Source of truth: SPECTRA_BUILD_PROMPT.md.

Do not touch backend. Do not touch ModeA/ components.

Create these files inside frontend/src/components/ModeB/:

1. TokenInput.jsx
Props: onScan(address, chain), scanning
- Chain selector: 6 buttons (Auto/Solana/ETH/BNB/Base/Arbitrum) from CHAIN_OPTIONS
- Address input (monospace) with detected chain badge overlay (right side of input)
  Badge shows "◎ SOL" in purple or "Ξ EVM" in blue when auto-detected
  Detection triggers when address length > 10 using detectChain()
- "RUN ENGINE" button (purple accent) disabled when scanning or empty
- Quick fill buttons: JUP (SOL), PEPE (ETH), BONK (SOL), SHIB (ETH)

2. MembraneSurface.jsx
Props: stage, velocityScore, stageColor
Canvas element 600×110, white-fill on rounded-xl black background.
requestAnimationFrame at 60fps.
Stage wave morphologies (implement exactly):
- SEEDING: low amplitude 12, freq 0.018, speed 0.03, noise 0.25 — sine + micro harmonic
- IGNITION: amplitude 30, freq 0.035, speed 0.07, noise 0.08 — sawtooth building
- PEAK: amplitude 50, freq 0.055, speed 0.12, noise 0.45 — clipped distortion (clamp at ±70% amplitude)
- DISTRIBUTION: amplitude 22, freq 0.028, speed 0.04, noise 0.35 — decaying right side
- DEAD: amplitude 2, freq 0.01, speed 0.01, noise 0.6 — near flatline
shadowBlur=20 shadowColor=stageColor for all except DEAD.
Second harmonic: stageColor+"40", lineWidth 0.5, half amplitude.
Bottom row: "TX VELOCITY" label left, velocity % right in stageColor.
Top row: pulsing dot + "MEMBRANE ACTIVE" left, stage badge right.

3. StageDisplay.jsx
Props: lifecycle (full EngineResult object from SSE)
- "CURRENT STAGE" label tiny
- Stage name huge bold in stage_color
- Progress bar: 5 colored segments + animated position marker
  Positions: SEEDING=8%, IGNITION=30%, PEAK=55%, DISTRIBUTION=78%, DEAD=96%
  Framer Motion animates from 0 to final position on mount
- Labels under bar: SEED / IGNI / PEAK / DIST / DEAD
- Three score bars with animation (Velocity/Liquidity/Maturity)
- "TRADER ACTION" box at bottom in stage_color

4. ConfidenceGauge.jsx
Props: confidence, stage, bias, stageColor
Canvas 200×160 (render at full parent width using className w-full).
Draw arc from 135° to 45° (clockwise, 270° total).
Background arc: rgba(255,255,255,0.06), lineWidth 10, lineCap round.
Confidence arc: stageColor, lineWidth 10, shadowBlur 15.
Center text: confidence number large bold white, "%" smaller.
Below canvas: bias label in stageColor.
SPECTRA V1 circle badge: small circle with border in stageColor, "SPECTRA" tiny text above "V1" bold.

5. LaunchParams.jsx
Props: lifecycle
- "LAUNCH PARAMETERS" header with LIVE/DORMANT badge
  DORMANT if stage is DEAD or DISTRIBUTION
- Optimal entry window in large text
- Liquidity depth progress bar (liquidity_depth_pct)
- Two cards side by side: Slippage card + TX Velocity card
  Each shows value, label, and status indicator

6. SignalCards.jsx
Props: short, mid, long, stageColor
- "SIGNAL STRENGTH" header
- Three vertical bar charts side by side (SHORT/MID/LONG)
- Each bar: container div with bg-black/30 border, animated fill div from bottom
  Fill color: green if >60, orange if >30, red otherwise
  Framer Motion animates height from 0 to value% on mount
- Value shown as "+X%" inside bar, timeframe below

7. SocialMembrane.jsx
Props: socialDecay, analysis, token
- "SOCIAL MEMBRANE" header with purple dot + Decay: X% label
- Token avatar circle (first 3 chars of symbol) + name
- Social decay progress bar in purple
- Analysis text preview (first 300 chars) in white/40 monospace

8. AgentStatusBar.jsx
Props: agents (array of {agent, message, status}), scanning
- Only renders if agents.length > 0
- Each agent shown as: colored dot + agent name + "—" + message
  Colors: LIFECYCLE=cyan, ATTENTION=purple, PSYCHOLOGY=orange, TRADE=green, default=gray
  Scanning dots pulse with Framer Motion

9. TradeLogicPanel.jsx
Props: data, token
- Framer Motion fade+slide on mount
- Purple border panel
- "SPECTRA TRADE ANALYSIS" label + token.symbol title
- Copy button
- Pre tag with data.output in white/60 monospace

10. CycleScanner.jsx (main container)
State: scanning, chainInfo, token, lifecycle, agents, analysis, trade, error

runScan(address, chain) function:
Creates EventSource to http://localhost:8000/api/mode-b/analyse?token_address=X&chain=Y
Listen to all SSE events and update state accordingly:
- chain_detected → setChainInfo
- token_resolved → setToken
- lifecycle_classified → setLifecycle
- agent_start → setAgents(prev => [...prev, data])
- analysis_complete → setAnalysis
- trade_complete → setTrade
- scan_complete → setScanning(false)
- error → setError, setScanning(false)

Layout (render conditionally as data arrives):
1. Title "SPECTRA ENGINE" + subtitle
2. TokenInput
3. Error panel (if error)
4. Chain detection status bar (if chainInfo)
5. Token header bar: symbol/name/price/liquidity/holders/chain badge (if token)
6. AgentStatusBar (if agents.length > 0)
7. When lifecycle exists — three rows:
   Row 1: MembraneSurface (lg:col-span-2) + ConfidenceGauge (lg:col-span-1)
   Row 2: StageDisplay + SignalCards
   Row 3: LaunchParams + SocialMembrane
8. TradeLogicPanel (AnimatePresence, when trade exists)

Update App.jsx to render CycleScanner for Mode B.

Test:
- npm run dev + backend running
- Switch to Mode B
- Paste: JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN (Solana)
  Or: 0x6982508145454Ce325dDbE47a25d4ec3d2311933 (ETH - PEPE)
- Chain should auto-detect
- All panels should populate as SSE events arrive
- Membrane waveform should animate at 60fps
- Confidence gauge should draw the arc

Stop here.
```

---

## PHASE 10 — Integration + Swarms Publishing

```
SPECTRA Phase 10. Final phase.

Tasks:

1. Create backend/publish_to_swarms.py:
Use swarms.utils.swarms_marketplace_utils add_prompt_to_marketplace to publish SPECTRA.
Name: "SPECTRA — Multi-Chain Web3 Intelligence Swarm"
Description: The full marketplace description from SPECTRA_BUILD_PROMPT.md.
Use cases: All 6 use cases from the build prompt.
Tags: web3 solana ethereum BNB base arbitrum trading whale-tracking airdrop lifecycle memecoin DeFi intelligence multi-chain on-chain alpha daily-brief cycle-detection
Category: finance
is_free: False
price_usd: 4.99

2. Fix any integration issues found during testing:
- CORS errors → check backend CORS middleware allows localhost:5173
- SSE not streaming → check EventSourceResponse import from sse_starlette.sse
- Chain detection wrong → check detect_chain_from_address in engine.py
- Canvas not rendering → check canvas ref and useEffect cleanup
- Framer Motion animations not working → verify framer-motion is in package.json

3. Create final README.md in project root:
# SPECTRA — Web3 Intelligence Swarm
## Quick Start
### Backend: cd backend && pip3 install -r requirements.txt && uvicorn main:app --reload
### Frontend: cd frontend && npm install && npm run dev
## API Keys: OPENAI_API_KEY, SWARMS_API_KEY, BIRDEYE_API_KEY, MORALIS_API_KEY
## Mode A: Multi-chain scan — zero input
## Mode B: SPECTRA ENGINE — any ERC-20 or Solana token
## Agent-to-agent endpoints: /api/agents/whale-scan, /api/agents/airdrops, /api/agents/unlocks, /api/agents/vc-funding, /api/agents/lifecycle/{address}
## Built on Swarms ACM Hackathon 2026

4. Final checklist before publishing:
[ ] Backend runs on port 8000 with no errors
[ ] Frontend runs on port 5173 with no errors
[ ] Mode A scan fires all 4 agents and produces a brief
[ ] Mode B accepts Solana address (JUP) and shows all panels
[ ] Mode B accepts ETH address (PEPE 0x6982508145454Ce325dDbE47a25d4ec3d2311933) and shows all panels
[ ] Canvas waveform animates in all 5 stages
[ ] Confidence gauge draws correctly
[ ] All API keys are in .env file
[ ] Agent-to-agent endpoints return valid JSON

5. Deploy:
Frontend: push to GitHub, deploy to Vercel (same as your MLO tool)
Backend: deploy to Railway.app or Render.com free tier
Update frontend API base URL from localhost:8000 to your Railway URL

6. Publish to Swarms:
cd backend && python publish_to_swarms.py
Then go to swarms.world, find your listing, enable Frenzy Mode, tokenize.

Done. SPECTRA is live.
```

---

## QUICK REFERENCE

**Total phases:** 10
**Approximate time per phase:** 5-15 minutes each
**Total build time:** 2-4 hours

**Key test tokens:**
- Solana: `JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN` (JUP)
- Solana: `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263` (BONK)
- Ethereum: `0x6982508145454Ce325dDbE47a25d4ec3d2311933` (PEPE)
- Ethereum: `0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE` (SHIB)

**Install order:**
```bash
# Backend
cd SPECTRA/backend
pip3 install swarms fastapi uvicorn httpx python-dotenv pydantic sse-starlette
cp .env.example .env
# Add your 4 API keys to .env
python main.py

# Frontend (separate terminal)
cd SPECTRA/frontend
npm install
npm run dev
```

**If Codex gets confused at any phase:**
> "Stop. Do not continue. Read CODEX_BUILD_RULES.md and SPECTRA_BUILD_PROMPT.md again. Then tell me what Phase [X] requires before doing anything."