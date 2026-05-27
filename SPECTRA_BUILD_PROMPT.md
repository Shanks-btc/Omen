# SPECTRA — Final Build Prompt for Codex

---

## IMPORTANT NAMING RULES — NON-NEGOTIABLE

- Product name: **SPECTRA** everywhere — code, UI, comments, API responses
- Cycle classification system: **"Lifecycle Engine"** everywhere — never MLO, never anything else
- All Swarms agents: named **"SPECTRA-[AGENTNAME]"**
- Mode B UI label: **"SPECTRA ENGINE"** not "Lifecycle Engine" in the actual UI display

---

## TECH STACK — CONFIRMED

```
BACKEND
├── Python 3.10+
├── swarms>=6.0.0          (multi-agent orchestration)
├── fastapi                 (REST + SSE streaming)
├── uvicorn                 (ASGI server)
├── httpx                   (async HTTP for API calls)
├── sse-starlette           (Server-Sent Events)
└── python-dotenv

FRONTEND
├── React 19 + Vite
├── Tailwind CSS v4
├── Framer Motion           (animations)
├── Canvas API              (biomembrane waveform)
└── EventSource API         (SSE streaming from FastAPI)

DATA SOURCES (all free)
├── Birdeye API             (Solana token data)
├── Moralis API             (EVM token data)
├── DeFiLlama API           (TVL, airdrops, unlocks, hacks, raises)
└── CoinGecko API           (market data)
```

---

## FOLDER STRUCTURE

```
SPECTRA/
├── backend/
│   ├── main.py
│   ├── agents.py
│   ├── tools/
│   │   ├── moralis_tools.py
│   │   ├── birdeye_tools.py
│   │   ├── defillama_tools.py
│   │   └── coingecko_tools.py
│   ├── lifecycle/
│   │   └── engine.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ModeToggle.jsx
│   │   │   ├── ModeA/
│   │   │   │   ├── ScanDashboard.jsx
│   │   │   │   ├── AgentHuntCard.jsx
│   │   │   │   ├── BriefPanel.jsx
│   │   │   │   └── FrenzyMode.jsx
│   │   │   ├── ModeB/
│   │   │   │   ├── CycleScanner.jsx        # Main container
│   │   │   │   ├── TokenInput.jsx           # Address input + chain selector
│   │   │   │   ├── MembraneSurface.jsx      # Canvas waveform (like MLO)
│   │   │   │   ├── StageDisplay.jsx         # Current stage + TX velocity
│   │   │   │   ├── ConfidenceGauge.jsx      # Circular confidence meter
│   │   │   │   ├── LaunchParams.jsx         # Entry params panel
│   │   │   │   ├── SignalCards.jsx          # Short/Mid/Long signal cards
│   │   │   │   ├── SocialMembrane.jsx       # Attention + virality panel
│   │   │   │   ├── TradeLogicPanel.jsx      # Trade logic output
│   │   │   │   └── AgentStatusBar.jsx       # Shows which agents are running
│   │   │   └── shared/
│   │   │       ├── Header.jsx
│   │   │       ├── LoadingSkeleton.jsx
│   │   │       └── ErrorBoundary.jsx
│   │   ├── hooks/
│   │   │   ├── useModeAScan.js
│   │   │   └── useModeBScan.js
│   │   ├── lib/
│   │   │   └── chainDetector.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## BACKEND — COMPLETE IMPLEMENTATION

### requirements.txt
```
swarms>=6.0.0
fastapi
uvicorn
httpx
python-dotenv
pydantic
sse-starlette
```

### .env.example
```
OPENAI_API_KEY=your_openai_key
SWARMS_API_KEY=your_swarms_key
BIRDEYE_API_KEY=your_birdeye_key
MORALIS_API_KEY=your_moralis_key
```

---

### lifecycle/engine.py

```python
"""
SPECTRA Lifecycle Engine
Multi-chain token cycle classification
Supports: EVM chains via Moralis + Solana via Birdeye
"""

from dataclasses import dataclass
from enum import Enum

class LifecycleStage(str, Enum):
    SEEDING = "SEEDING"
    IGNITION = "IGNITION"
    PEAK = "PEAK"
    DISTRIBUTION = "DISTRIBUTION"
    DEAD = "DEAD"

# Stage display config for frontend
STAGE_CONFIG = {
    "SEEDING":      {"color": "#22c55e", "bias": "ACCUMULATION BIAS", "action": "MONITOR — wait for ignition"},
    "IGNITION":     {"color": "#06b6d4", "bias": "ENTRY BIAS",        "action": "OPTIMAL ENTRY — ignition confirmed"},
    "PEAK":         {"color": "#ef4444", "bias": "EXIT BIAS",         "action": "TAKE PROFIT / EXIT"},
    "DISTRIBUTION": {"color": "#f97316", "bias": "AVOID BIAS",        "action": "AVOID ENTRY — distribution"},
    "DEAD":         {"color": "#6b7280", "bias": "DEAD BIAS",         "action": "IGNORE — no edge"},
}

@dataclass
class EngineResult:
    stage: LifecycleStage
    confidence: float
    velocity_score: float
    liquidity_score: float
    age_score: float
    description: str
    trader_action: str
    visual_signature: str
    chain: str
    token_symbol: str
    # Additional computed fields for UI
    tx_velocity_pct: float      # 0-100 for display
    liquidity_depth_pct: float  # 0-100 for display
    optimal_entry_window: str   # e.g. "08:00 - 12:00 UTC"
    slippage_recommendation: str
    short_signal: float         # percentage
    mid_signal: float
    long_signal: float
    social_decay_pct: float

def classify(
    velocity_score: float,
    liquidity_score: float,
    age_score: float,
    chain: str = "unknown",
    token_symbol: str = "UNKNOWN"
) -> EngineResult:
    """
    SPECTRA Lifecycle Engine core classification algorithm
    
    velocity_score:  normalised tx velocity 0-1 (baseline: 43200 tx/day)
    liquidity_score: normalised liquidity 0-1  (baseline: $1M)
    age_score:       normalised holder maturity 0-1 (baseline: 10000 holders)
    """
    
    confidence = min(95.0, 60.0 + (velocity_score * 20.0) + (liquidity_score * 20.0))

    if velocity_score < 0.05 and liquidity_score < 0.1:
        stage = LifecycleStage.DEAD
        description = "Ghost chain. Zero meaningful on-chain activity."
        action = "IGNORE — no trading edge"
        visual = "Gray flatline"
    elif 0.3 < velocity_score < 0.6 and liquidity_score > 0.4 and age_score < 0.4:
        stage = LifecycleStage.DISTRIBUTION
        description = "Selling pressure building. Smart money distributing to retail."
        action = "AVOID ENTRY — distribution in progress"
        visual = "Orange decay wave"
    elif velocity_score > 0.7 and liquidity_score > 0.6:
        stage = LifecycleStage.PEAK
        description = "Maximum velocity and deep liquidity. Euphoria zone."
        action = "TAKE PROFIT / EXIT — peak conditions"
        visual = "Red clipped distortion"
    elif 0.2 < velocity_score < 0.7 and liquidity_score > 0.2 and age_score > 0.3:
        stage = LifecycleStage.IGNITION
        description = "Building transaction pressure with accumulating liquidity."
        action = "OPTIMAL ENTRY — ignition confirmed"
        visual = "Cyan sawtooth building"
    else:
        stage = LifecycleStage.SEEDING
        description = "Low velocity, thin liquidity. Early accumulation phase."
        action = "MONITOR — await ignition signal"
        visual = "Green low-amplitude tremor"

    # Compute display values
    tx_velocity_pct = round(velocity_score * 100, 1)
    liquidity_depth_pct = round(liquidity_score * 100, 1)

    # Optimal entry window based on velocity (higher velocity = tighter window)
    if velocity_score > 0.6:
        window = "12:00 - 14:00 UTC"
    elif velocity_score > 0.3:
        window = "10:00 - 16:00 UTC"
    else:
        window = "08:00 - 20:00 UTC"

    # Slippage based on liquidity
    if liquidity_score < 0.1:
        slippage = "10-15%"
    elif liquidity_score < 0.3:
        slippage = "5-8%"
    elif liquidity_score < 0.6:
        slippage = "3-5%"
    else:
        slippage = "1-2%"

    # Signal scores
    short_signal = round(velocity_score * 100 * (1.2 if stage == LifecycleStage.IGNITION else 0.8), 1)
    mid_signal = round(liquidity_score * 100, 1)
    long_signal = round(age_score * 100 * (0.6 if stage in [LifecycleStage.PEAK, LifecycleStage.DISTRIBUTION] else 1.0), 1)
    social_decay = round((1 - age_score) * 60 + velocity_score * 20, 1)

    return EngineResult(
        stage=stage,
        confidence=round(confidence, 1),
        velocity_score=round(velocity_score, 4),
        liquidity_score=round(liquidity_score, 4),
        age_score=round(age_score, 4),
        description=description,
        trader_action=action,
        visual_signature=visual,
        chain=chain,
        token_symbol=token_symbol,
        tx_velocity_pct=tx_velocity_pct,
        liquidity_depth_pct=liquidity_depth_pct,
        optimal_entry_window=window,
        slippage_recommendation=slippage,
        short_signal=min(100, short_signal),
        mid_signal=min(100, mid_signal),
        long_signal=min(100, long_signal),
        social_decay_pct=min(100, social_decay)
    )


def scores_from_moralis(data: dict) -> dict:
    """Convert Moralis API data to Lifecycle Engine scores (EVM chains)"""
    velocity = min(1.0, data.get("transfers_24h", 0) / 43200)
    liquidity = min(1.0, data.get("liquidity_usd", 0) / 1_000_000)
    age = min(1.0, data.get("total_holders", 0) / 10000)
    return {
        "velocity_score": round(velocity, 4),
        "liquidity_score": round(liquidity, 4),
        "age_score": round(age, 4)
    }


def scores_from_birdeye(data: dict) -> dict:
    """Convert Birdeye API data to Lifecycle Engine scores (Solana)"""
    velocity = min(1.0, data.get("trade24h", 0) / 43200)
    liquidity = min(1.0, data.get("liquidity", 0) / 1_000_000)
    age = min(1.0, data.get("holder", 0) / 10000)
    return {
        "velocity_score": round(velocity, 4),
        "liquidity_score": round(liquidity, 4),
        "age_score": round(age, 4)
    }


def detect_chain_from_address(address: str) -> str:
    """Auto-detect chain: 0x + 42 chars = EVM, else Solana"""
    a = address.strip()
    return "evm" if (a.startswith("0x") and len(a) == 42) else "solana"
```

---

### tools/birdeye_tools.py

```python
import httpx, os

BIRDEYE_BASE = "https://public-api.birdeye.so"

def _h():
    return {"X-API-KEY": os.getenv("BIRDEYE_API_KEY",""), "x-chain": "solana"}

def get_token_overview_raw(addr: str) -> dict:
    try:
        with httpx.Client(timeout=10) as c:
            r = c.get(f"{BIRDEYE_BASE}/defi/token_overview", headers=_h(), params={"address": addr})
            d = r.json()
        return d.get("data", {}) if d.get("success") else {}
    except:
        return {}

def get_token_overview(addr: str) -> str:
    d = get_token_overview_raw(addr)
    if not d: return f"Token not found: {addr}"
    return f"""TOKEN: {d.get('symbol','?')} (SOLANA)
Price: ${d.get('price',0):.8f}
24h Volume: ${d.get('v24hUSD',0):,.0f}
Liquidity: ${d.get('liquidity',0):,.0f}
24h Trades: {d.get('trade24h',0):,}
Holders: {d.get('holder',0):,}
24h Change: {d.get('priceChange24hPercent',0):.2f}%"""

def get_token_security(addr: str) -> str:
    try:
        with httpx.Client(timeout=10) as c:
            r = c.get(f"{BIRDEYE_BASE}/defi/token_security", headers=_h(), params={"address": addr})
            d = r.json().get("data", {})
        return f"""SECURITY:
Top 10 holders: {d.get('top10HolderPercent',0):.1f}%
Creator: {d.get('creatorPercentage',0):.1f}%
Mutable metadata: {d.get('mutableMetadata',False)}"""
    except:
        return "Security data unavailable"

def get_top_traders(addr: str) -> str:
    try:
        with httpx.Client(timeout=10) as c:
            r = c.get(f"{BIRDEYE_BASE}/defi/v2/tokens/top_traders", headers=_h(),
                     params={"address": addr, "time_frame": "24h", "limit": 5})
            items = r.json().get("data", {}).get("items", [])
        if not items: return "No significant trader activity"
        out = "TOP TRADERS (24h):\n"
        for i, t in enumerate(items, 1):
            side = "BUY" if t.get("buy",0) > t.get("sell",0) else "SELL"
            out += f"{i}. PnL:${t.get('pnl',0):,.0f} Vol:${t.get('volume',0):,.0f} {side}\n"
        return out
    except:
        return "Trader data error"

def get_solana_whale_movements() -> str:
    try:
        with httpx.Client(timeout=15) as c:
            r = c.get(f"{BIRDEYE_BASE}/defi/tokenlist", headers=_h(),
                     params={"sort_by":"v24hUSD","sort_type":"desc","offset":0,"limit":20,"min_liquidity":100000})
            tokens = r.json().get("data",{}).get("tokens",[])
        out = "SOLANA WHALE SCAN:\n"
        for t in tokens[:5]:
            ch = t.get("v24hChangePercent",0)
            if abs(ch) > 50:
                out += f"⚡ {t.get('symbol','?')}: Volume {'SURGE' if ch>0 else 'DUMP'} {ch:+.0f}% | ${t.get('v24hUSD',0):,.0f}\n"
        return out or "No major Solana whale activity"
    except Exception as e:
        return f"Solana scan error: {e}"
```

---

### tools/moralis_tools.py

```python
import httpx, os

BASE = "https://deep-index.moralis.io/api/v2.2"
CHAIN_MAP = {"eth":"eth","ethereum":"eth","bnb":"bsc","bsc":"bsc","base":"base","arbitrum":"arbitrum"}

def _h():
    return {"X-API-Key": os.getenv("MORALIS_API_KEY",""), "accept":"application/json"}

def get_erc20_token_data(addr: str, chain: str = "eth") -> dict:
    cid = CHAIN_MAP.get(chain.lower(), "eth")
    result = {"chain": cid, "symbol": "UNKNOWN", "name": "Unknown",
              "price_usd": 0, "transfers_24h": 0, "liquidity_usd": 0,
              "total_holders": 0, "holder_change_24h": 0}
    try:
        with httpx.Client(timeout=10) as c:
            r = c.get(f"{BASE}/erc20/{addr}/price", headers=_h(), params={"chain": cid})
            pd = r.json()
        result["price_usd"] = float(pd.get("usdPrice", 0))
        result["symbol"] = pd.get("tokenSymbol", "UNKNOWN")
        result["name"] = pd.get("tokenName", "Unknown")
    except: pass
    try:
        with httpx.Client(timeout=10) as c:
            r = c.get(f"{BASE}/erc20/{addr}/stats", headers=_h(), params={"chain": cid})
            sd = r.json()
        result["transfers_24h"] = sd.get("transfers",{}).get("total", 0)
        result["liquidity_usd"] = float(sd.get("liquidity", 0))
    except: pass
    try:
        with httpx.Client(timeout=10) as c:
            r = c.get(f"{BASE}/erc20/{addr}/holders", headers=_h(), params={"chain": cid})
            hd = r.json()
        result["total_holders"] = hd.get("totalHolders", 0)
        result["holder_change_24h"] = hd.get("holderChange",{}).get("24h",{}).get("change", 0)
    except: pass
    return result

def get_erc20_token_summary(addr: str, chain: str = "eth") -> str:
    d = get_erc20_token_data(addr, chain)
    return f"""TOKEN: {d['symbol']} ({d['chain'].upper()})
Price: ${d['price_usd']:.8f}
24h Transfers: {d['transfers_24h']:,}
Liquidity: ${d['liquidity_usd']:,.0f}
Holders: {d['total_holders']:,}
Holder Change 24h: {d['holder_change_24h']:+,}"""

def get_evm_whale_movements(chain: str = "eth") -> str:
    cid = CHAIN_MAP.get(chain.lower(), "eth")
    try:
        with httpx.Client(timeout=15) as c:
            r = c.get(f"{BASE}/erc20/transfers", headers=_h(), params={"chain":cid,"limit":20,"order":"DESC"})
            transfers = r.json().get("result", [])
        large = [t for t in transfers if float(t.get("value_decimal",0)) > 50000]
        if not large: return f"No whale moves >$50K on {chain.upper()}"
        out = f"WHALE SCAN — {chain.upper()}:\n"
        for t in large[:5]:
            out += f"🐋 {t.get('token_symbol','?')}: ${float(t.get('value_decimal',0)):,.0f}\n"
        return out
    except Exception as e:
        return f"{chain.upper()} scan error: {e}"

def scan_all_evm_chains() -> str:
    return "\n\n".join([get_evm_whale_movements(c) for c in ["eth","bsc","base","arbitrum"]])
```

---

### tools/defillama_tools.py

```python
import httpx

BASE = "https://api.llama.fi"

def get_airdrop_opportunities() -> str:
    try:
        with httpx.Client(timeout=15) as c:
            protocols = c.get(f"{BASE}/protocols").json()
        candidates = sorted(
            [p for p in protocols if not p.get("symbol") and p.get("tvl",0) > 50_000_000],
            key=lambda x: x["tvl"], reverse=True
        )[:5]
        out = "AIRDROP SCAN — 2,400+ protocols:\n\n"
        for p in candidates:
            out += f"🎯 {p['name']} | TVL: ${p['tvl']:,.0f} | No token\n"
            out += f"   Chains: {', '.join(p.get('chains',[])[:3])}\n\n"
        return out
    except Exception as e:
        return f"Airdrop scan error: {e}"

def get_token_unlocks() -> str:
    try:
        with httpx.Client(timeout=15) as c:
            data = c.get("https://unlocks.llama.fi/unlocks").json()
        protocols = data if isinstance(data, list) else data.get("protocols",[])
        high_risk = []
        for p in protocols[:50]:
            for ev in p.get("upcomingEvent",[]):
                usd = ev.get("noOfTokens",0) * p.get("tokenPrice",0)
                if usd > 10_000_000:
                    high_risk.append({"name":p.get("name"),"token":p.get("symbol"),"amount":usd,"date":ev.get("date")})
        high_risk.sort(key=lambda x: x["amount"], reverse=True)
        if not high_risk: return "No critical unlocks in next 7 days ✅"
        out = "TOKEN UNLOCK RISK:\n\n"
        for u in high_risk[:5]:
            out += f"⚠️ ${u['token']} — ${u['amount']:,.0f} | {u['date']}\n"
        return out
    except Exception as e:
        return f"Unlock scan error: {e}"

def get_recent_hacks() -> str:
    try:
        with httpx.Client(timeout=15) as c:
            hacks = c.get(f"{BASE}/hacks").json()
        recent = sorted(hacks if isinstance(hacks,list) else [], key=lambda x: x.get("date",0), reverse=True)[:5]
        if not recent: return "No recent exploits ✅"
        out = "EXPLOIT MONITOR:\n\n"
        for h in recent:
            out += f"🚨 {h.get('name','?')} — ${h.get('amount',0):,.0f} | {h.get('chain','?')}\n"
        return out
    except Exception as e:
        return f"Hack monitor error: {e}"

def get_recent_raises() -> str:
    try:
        with httpx.Client(timeout=15) as c:
            data = c.get(f"{BASE}/raises").json()
        raises = data.get("raises",[]) if isinstance(data,dict) else data
        significant = [r for r in sorted(raises, key=lambda x: x.get("date",0), reverse=True)[:50]
                      if r.get("amount",0) > 5_000_000][:8]
        sectors = {}
        for r in significant:
            cat = r.get("category","Other")
            sectors.setdefault(cat,[]).append(r)
        out = "VC FUNDING INTELLIGENCE:\n\n"
        for sector, rs in sectors.items():
            total = sum(r.get("amount",0) for r in rs)
            vcs = list(set(v for r in rs for v in r.get("leadInvestors",[])))[:3]
            out += f"💰 {sector}: {len(rs)} deals | ${total:,.0f}\n"
            if vcs: out += f"   VCs: {', '.join(vcs)}\n"
        return out
    except Exception as e:
        return f"Raises scan error: {e}"
```

---

### agents.py

```python
"""
SPECTRA Multi-Agent System — Swarms Framework
"""
from swarms import Agent, ConcurrentWorkflow
from tools.birdeye_tools import get_token_overview, get_token_security, get_top_traders, get_solana_whale_movements
from tools.defillama_tools import get_airdrop_opportunities, get_token_unlocks, get_recent_hacks, get_recent_raises
from tools.moralis_tools import scan_all_evm_chains, get_erc20_token_summary

# ── MODE A AGENTS ──────────────────────────────────────────────

whale_agent = Agent(
    agent_name="SPECTRA-WHALE-AGENT",
    model_name="gpt-4o-mini",
    system_prompt="""You are SPECTRA's Whale Intelligence Agent.
Scan smart money movements across Ethereum, Solana, BNB, Base, and Arbitrum.
Identify: tokens being accumulated quietly, tokens being exited before dumps, conviction levels.
Output streaming style with → prefix. Be specific: name tokens, give dollar amounts.
Format:
WHALE AGENT — SCANNING [X] WALLETS...
→ [chain]: [finding with token and amount]...
→ [signal type]: [conviction level] ⚡""",
    tools=[get_solana_whale_movements, scan_all_evm_chains],
    max_loops=1, streaming_on=True
)

airdrop_agent = Agent(
    agent_name="SPECTRA-AIRDROP-AGENT",
    model_name="gpt-4o-mini",
    system_prompt="""You are SPECTRA's Airdrop Intelligence Agent.
Find protocols with high TVL but no token — the proven airdrop pattern.
Give specific protocol names, TVL amounts, conviction levels.
Format:
AIRDROP AGENT — SCANNING 2,400+ PROTOCOLS...
→ Cross-referencing TVL vs token status...
→ [protocol name]: $[TVL] | [why high conviction] 🎯""",
    tools=[get_airdrop_opportunities],
    max_loops=1, streaming_on=True
)

risk_agent = Agent(
    agent_name="SPECTRA-RISK-AGENT",
    model_name="gpt-4o-mini",
    system_prompt="""You are SPECTRA's Risk Intelligence Agent.
Flag: token unlocks (name, amount, date), exploits (protocol, amount), governance risks.
Format:
RISK AGENT — SCANNING UNLOCK SCHEDULES...
→ Critical event: $[TOKEN] $[AMOUNT] unlock [DATE] ⚠️
→ Historical pattern: [X]% similar events caused [Y]% sell pressure""",
    tools=[get_token_unlocks, get_recent_hacks],
    max_loops=1, streaming_on=True
)

vc_agent = Agent(
    agent_name="SPECTRA-VC-AGENT",
    model_name="gpt-4o-mini",
    system_prompt="""You are SPECTRA's VC Intelligence Agent.
Identify: sectors getting multiple deals (pattern = narrative signal), active VCs, deal sizes.
Format:
VC AGENT — SCANNING FUNDING ROUNDS...
→ [X] new rounds in 48hrs...
→ Pattern: [VC] backing [sector] [X]x → [EARLY/PEAK/LATE] signal 🔥""",
    tools=[get_recent_raises],
    max_loops=1, streaming_on=True
)

brief_writer_agent = Agent(
    agent_name="SPECTRA-BRIEF-WRITER",
    model_name="gpt-4o",
    system_prompt="""You are SPECTRA's Brief Writer. Synthesise whale, airdrop, risk, and VC intelligence.
Output exact format:
SPECTRA DAILY BRIEF — [DATE] [TIME] UTC

🐋 SMART MONEY (12h)
→ [top 2-3 whale signals with tokens]

🪂 AIRDROP ALPHA  
→ [top 2 opportunities with conviction]

⚠️ RISK EVENTS
→ [top 2 risks with dates and amounts]

💰 VC SIGNAL
→ [sector signal with VC names]

📌 TOP INSIGHT TODAY
→ [single most important thing to act on]

Use real names and numbers. Scannable in 60 seconds.""",
    max_loops=1
)

# ── MODE B AGENTS ──────────────────────────────────────────────

lifecycle_detector_agent = Agent(
    agent_name="SPECTRA-LIFECYCLE-DETECTOR",
    model_name="gpt-4o-mini",
    system_prompt="""You are SPECTRA's Lifecycle Detector. You run the SPECTRA Lifecycle Engine.
Five stages: SEEDING (monitor), IGNITION (optimal entry), PEAK (exit), DISTRIBUTION (avoid), DEAD (ignore).
Rules: DEAD=vel<0.05&liq<0.1 | DIST=0.3<vel<0.6&liq>0.4&age<0.4 | PEAK=vel>0.7&liq>0.6 | IGNITION=0.2<vel<0.7&liq>0.2&age>0.3 | SEEDING=default
Confidence=min(95,60+vel×20+liq×20). EVM scores: vel=transfers_24h/43200, liq=liquidity_usd/1M, age=holders/10000. Solana: vel=trade24h/43200, liq=liquidity/1M, age=holder/10000.
Output:
SPECTRA LIFECYCLE ENGINE — [SYMBOL] ([CHAIN])
PHASE: [STAGE] | Confidence: [X]%
Velocity: [X]/1.0 | Liquidity: [X]/1.0 | Maturity: [X]/1.0
Key Signal: [main driver] | Action: [trader action]""",
    tools=[get_token_overview, get_erc20_token_summary, get_token_security, get_top_traders],
    max_loops=1
)

attention_agent = Agent(
    agent_name="SPECTRA-ATTENTION-AGENT",
    model_name="gpt-4o-mini",
    system_prompt="""You are SPECTRA's Attention Analyst.
Determine attention cycle: EARLY/BUILDING/PEAKED/FADING. Score virality 0-100.
Look for: volume/price divergence, holder growth rate, trade velocity trend, smart money vs retail ratio.
Output: Attention Phase, Virality Score, Retail Awareness, Asymmetric Window status, Key Signal.""",
    tools=[get_token_overview, get_erc20_token_summary],
    max_loops=1
)

psychology_agent = Agent(
    agent_name="SPECTRA-PSYCHOLOGY-AGENT",
    model_name="gpt-4o-mini",
    system_prompt="""You are SPECTRA's Market Psychology Agent.
Diagnose crowd psychology: ACCUMULATION/CAUTIOUS_OPTIMISM/FOMO_BUILDING/EUPHORIA/DISTRIBUTION/CAPITULATION/DEPRESSION.
Output: Current State, FOMO Level, Smart Money Behavior, Historical Pattern, Next Likely Move.""",
    tools=[get_token_overview, get_erc20_token_summary, get_top_traders],
    max_loops=1
)

trade_logic_agent = Agent(
    agent_name="SPECTRA-TRADE-LOGIC",
    model_name="gpt-4o",
    system_prompt="""You are SPECTRA's Trade Logic Agent. Final synthesis.
Given lifecycle stage, attention phase, and psychology state — output concrete trade logic.
Format:
SPECTRA TRADE ANALYSIS — [TOKEN] ([CHAIN])
OPPORTUNITY: [STRONG LONG/SPECULATIVE LONG/AVOID/SHORT]
Risk/Reward: 1:[X]
Entry Logic: [specific reasoning]
Position Size: [SMALL/MEDIUM/LARGE] — [why]
Invalidation: [specific signal]
Exit Signal: [specific trigger]
Viral Angle: "[one line for CT]"
VERDICT: [2-3 sentences trader can act on]
If PEAK or DISTRIBUTION: say AVOID clearly.""",
    max_loops=1
)

def build_mode_a_workflow():
    concurrent = ConcurrentWorkflow(
        agents=[whale_agent, airdrop_agent, risk_agent, vc_agent],
        max_loops=1
    )
    return concurrent, brief_writer_agent

def build_mode_b_workflow():
    concurrent = ConcurrentWorkflow(
        agents=[lifecycle_detector_agent, attention_agent, psychology_agent],
        max_loops=1
    )
    return concurrent, trade_logic_agent
```

---

### main.py

```python
"""SPECTRA FastAPI Server with SSE streaming"""
import asyncio, json, os
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from dotenv import load_dotenv
from agents import build_mode_a_workflow, build_mode_b_workflow
from lifecycle.engine import classify, scores_from_moralis, scores_from_birdeye, detect_chain_from_address, STAGE_CONFIG
from tools.moralis_tools import get_erc20_token_data
from tools.birdeye_tools import get_token_overview_raw

load_dotenv()

app = FastAPI(title="SPECTRA API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/")
def root():
    return {"product": "SPECTRA", "version": "1.0.0",
            "modes": {"A": "Multi-Chain Market Scan", "B": "Lifecycle Engine — any ERC-20 or Solana token"}}

@app.get("/api/mode-a/scan")
async def mode_a_scan():
    async def generate():
        try:
            concurrent, brief_writer = build_mode_a_workflow()
            for name, msg in [
                ("🔍 WHALE AGENT", "Connecting to smart money networks..."),
                ("🪂 AIRDROP AGENT", "Loading protocol registry..."),
                ("⚠️ RISK AGENT", "Scanning unlock schedules..."),
                ("💰 VC AGENT", "Accessing funding database...")
            ]:
                yield {"event": "agent_start", "data": json.dumps({"agent": name, "message": msg, "status": "scanning"})}
                await asyncio.sleep(0.3)

            results = concurrent.run("Complete multi-chain scan: whale movements on all 5 chains, top 5 airdrop candidates, all unlocks next 7 days, VC funding patterns last 48h. Be specific with names and amounts.")
            yield {"event": "scan_results", "data": json.dumps({"results": str(results)})}
            yield {"event": "agent_start", "data": json.dumps({"agent": "📋 BRIEF WRITER", "message": "Synthesising into SPECTRA brief...", "status": "synthesising"})}
            brief = brief_writer.run(f"Create SPECTRA daily brief from: {results}")
            yield {"event": "brief_complete", "data": json.dumps({"brief": str(brief)})}
            yield {"event": "scan_complete", "data": json.dumps({"status": "complete"})}
        except Exception as e:
            yield {"event": "error", "data": json.dumps({"error": str(e)})}
    return EventSourceResponse(generate())

@app.get("/api/mode-b/analyse")
async def mode_b_analyse(
    token_address: str = Query(...),
    chain: str = Query("auto")
):
    async def generate():
        try:
            # Chain detection
            detected = detect_chain_from_address(token_address) if chain == "auto" else chain
            is_solana = detected == "solana" or chain == "solana"
            chain_label = "Solana" if is_solana else chain.upper()

            yield {"event": "chain_detected", "data": json.dumps({
                "chain": "solana" if is_solana else detected,
                "label": chain_label,
                "message": f"Detected {chain_label} token — fetching on-chain data..."
            })}

            # Fetch token data
            if is_solana:
                raw = get_token_overview_raw(token_address)
                if not raw:
                    yield {"event": "error", "data": json.dumps({"error": "Token not found on Solana. Verify the contract address."})}
                    return
                token_info = {
                    "symbol": raw.get("symbol","UNKNOWN"), "name": raw.get("name","Unknown"),
                    "price": raw.get("price",0), "volume24h": raw.get("v24hUSD",0),
                    "liquidity": raw.get("liquidity",0), "holders": raw.get("holder",0),
                    "priceChange24h": raw.get("priceChange24hPercent",0),
                    "trades24h": raw.get("trade24h",0), "chain": "solana",
                    "marketCap": raw.get("mc",0)
                }
                scores = scores_from_birdeye(raw)
            else:
                evm_chain = chain if chain not in ["auto","evm"] else "eth"
                raw = get_erc20_token_data(token_address, evm_chain)
                if raw.get("symbol") == "UNKNOWN":
                    yield {"event": "error", "data": json.dumps({"error": f"Token not found on {evm_chain.upper()}. Check address and chain."})}
                    return
                token_info = {
                    "symbol": raw.get("symbol","UNKNOWN"), "name": raw.get("name","Unknown"),
                    "price": raw.get("price_usd",0), "volume24h": raw.get("transfers_24h",0),
                    "liquidity": raw.get("liquidity_usd",0), "holders": raw.get("total_holders",0),
                    "priceChange24h": 0, "trades24h": raw.get("transfers_24h",0),
                    "chain": evm_chain, "marketCap": 0
                }
                scores = scores_from_moralis(raw)

            yield {"event": "token_resolved", "data": json.dumps(token_info)}

            # Run Lifecycle Engine
            result = classify(
                velocity_score=scores["velocity_score"],
                liquidity_score=scores["liquidity_score"],
                age_score=scores["age_score"],
                chain=token_info["chain"],
                token_symbol=token_info["symbol"]
            )

            stage_cfg = STAGE_CONFIG.get(result.stage.value, {})
            yield {"event": "lifecycle_classified", "data": json.dumps({
                "stage": result.stage.value,
                "confidence": result.confidence,
                "velocity_score": result.velocity_score,
                "liquidity_score": result.liquidity_score,
                "age_score": result.age_score,
                "description": result.description,
                "trader_action": result.trader_action,
                "visual_signature": result.visual_signature,
                "chain": result.chain,
                "tx_velocity_pct": result.tx_velocity_pct,
                "liquidity_depth_pct": result.liquidity_depth_pct,
                "optimal_entry_window": result.optimal_entry_window,
                "slippage_recommendation": result.slippage_recommendation,
                "short_signal": result.short_signal,
                "mid_signal": result.mid_signal,
                "long_signal": result.long_signal,
                "social_decay_pct": result.social_decay_pct,
                "stage_color": stage_cfg.get("color","#6b7280"),
                "stage_bias": stage_cfg.get("bias","UNKNOWN"),
            })}

            # Deep analysis agents
            concurrent, trade_agent = build_mode_b_workflow()
            for name in ["🔄 ATTENTION AGENT", "🧠 PSYCHOLOGY AGENT", "⚡ LIFECYCLE DETECTOR"]:
                yield {"event": "agent_start", "data": json.dumps({"agent": name, "message": f"Analysing {token_info['symbol']}...", "status": "scanning"})}
                await asyncio.sleep(0.15)

            task = f"""Analyse {token_info['symbol']} on {token_info['chain'].upper()}:
Price: ${token_info['price']:.8f} | Liquidity: ${token_info['liquidity']:,.0f}
Holders: {token_info['holders']:,} | 24h Volume: {token_info['volume24h']:,.0f}
SPECTRA Lifecycle Engine: {result.stage.value} ({result.confidence}% confidence)
Velocity: {result.velocity_score} | Liquidity: {result.liquidity_score} | Maturity: {result.age_score}
Action: {result.trader_action}"""

            analysis = concurrent.run(task)
            yield {"event": "analysis_complete", "data": json.dumps({"results": str(analysis)})}

            yield {"event": "agent_start", "data": json.dumps({"agent": "⚡ TRADE LOGIC", "message": "Calculating asymmetric opportunity...", "status": "synthesising"})}
            trade = trade_agent.run(f"Trade logic for {token_info['symbol']} {result.stage.value} ({result.confidence}% conf): {analysis}")
            yield {"event": "trade_complete", "data": json.dumps({"output": str(trade)})}
            yield {"event": "scan_complete", "data": json.dumps({"status": "complete", "token": token_info["symbol"]})}

        except Exception as e:
            yield {"event": "error", "data": json.dumps({"error": str(e)})}
    return EventSourceResponse(generate())

# Agent-to-agent endpoints
@app.get("/api/agents/whale-scan")
async def a2a_whale():
    from tools.birdeye_tools import get_solana_whale_movements
    from tools.moralis_tools import scan_all_evm_chains
    return {"solana": get_solana_whale_movements(), "evm": scan_all_evm_chains()}

@app.get("/api/agents/airdrops")
async def a2a_airdrops():
    from tools.defillama_tools import get_airdrop_opportunities
    return {"data": get_airdrop_opportunities()}

@app.get("/api/agents/unlocks")
async def a2a_unlocks():
    from tools.defillama_tools import get_token_unlocks
    return {"data": get_token_unlocks()}

@app.get("/api/agents/vc-funding")
async def a2a_vc():
    from tools.defillama_tools import get_recent_raises
    return {"data": get_recent_raises()}

@app.get("/api/agents/lifecycle/{token_address}")
async def a2a_lifecycle(token_address: str, chain: str = Query("auto")):
    try:
        detected = detect_chain_from_address(token_address) if chain == "auto" else chain
        is_solana = detected == "solana" or chain == "solana"
        if is_solana:
            raw = get_token_overview_raw(token_address)
            scores = scores_from_birdeye(raw)
            sym = raw.get("symbol","UNKNOWN")
            ch = "solana"
        else:
            evm = chain if chain not in ["auto","evm"] else "eth"
            raw = get_erc20_token_data(token_address, evm)
            scores = scores_from_moralis(raw)
            sym = raw.get("symbol","UNKNOWN")
            ch = evm
        r = classify(scores["velocity_score"], scores["liquidity_score"], scores["age_score"], ch, sym)
        return {"token": sym, "chain": ch, "stage": r.stage.value, "confidence": r.confidence,
                "trader_action": r.trader_action, "scores": scores}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
```

---

## FRONTEND — COMPLETE IMPLEMENTATION

### src/lib/chainDetector.js
```javascript
export const detectChain = (addr) => {
  if (!addr) return 'unknown'
  return addr.trim().startsWith('0x') && addr.trim().length === 42 ? 'evm' : 'solana'
}

export const CHAIN_OPTIONS = [
  { value: 'auto', label: '⚡ Auto-detect' },
  { value: 'solana', label: '◎ Solana' },
  { value: 'eth',  label: 'Ξ Ethereum' },
  { value: 'bsc',  label: '⬡ BNB Chain' },
  { value: 'base', label: '🔵 Base' },
  { value: 'arbitrum', label: '🔷 Arbitrum' },
]

export const CHAIN_COLORS = {
  solana: '#9945FF', eth: '#627EEA', bsc: '#F3BA2F',
  base: '#0052FF', arbitrum: '#28A0F0', auto: '#06b6d4'
}
```

---

### src/App.jsx
```jsx
import { useState } from "react"
import Header from "./components/shared/Header"
import ModeToggle from "./components/ModeToggle"
import ScanDashboard from "./components/ModeA/ScanDashboard"
import CycleScanner from "./components/ModeB/CycleScanner"

export default function App() {
  const [mode, setMode] = useState("A")
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-mono">
      <Header />
      <ModeToggle active={mode} setActive={setMode} />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {mode === "A" ? <ScanDashboard /> : <CycleScanner />}
      </main>
    </div>
  )
}
```

---

### src/components/shared/Header.jsx
```jsx
export default function Header() {
  return (
    <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-xl font-bold tracking-widest text-white">SPECTRA</div>
        <div className="text-white/20 text-xs">|</div>
        <div className="text-white/40 text-xs tracking-widest">WEB3 INTELLIGENCE SWARM</div>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-green-400 font-bold tracking-widest">LIVE</span>
        <span className="text-white/20 ml-2">Powered by Swarms</span>
      </div>
    </header>
  )
}
```

---

### src/components/ModeToggle.jsx
```jsx
export default function ModeToggle({ active, setActive }) {
  return (
    <div className="flex justify-center py-4 border-b border-white/10">
      <div className="flex bg-white/5 rounded-lg p-1 gap-1">
        {[
          { id: "A", icon: "⚡", label: "MARKET SCAN", sub: "Multi-Chain · Zero Input", accent: "cyan" },
          { id: "B", icon: "🔬", label: "SPECTRA ENGINE", sub: "Any Token · Any Chain", accent: "purple" },
        ].map(m => (
          <button key={m.id} onClick={() => setActive(m.id)}
            className={`px-6 py-2.5 rounded-md text-sm font-bold tracking-widest transition-all ${
              active === m.id
                ? m.accent === "cyan"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                  : "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                : "text-white/30 hover:text-white/50"
            }`}>
            {m.icon} {m.label}
            <div className="text-xs opacity-50 font-normal mt-0.5">{m.sub}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
```

---

### src/components/ModeA/ScanDashboard.jsx
```jsx
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import AgentHuntCard from "./AgentHuntCard"
import BriefPanel from "./BriefPanel"

const AGENTS = [
  { id:"whale", icon:"🔍", name:"WHALE AGENT", sub:"Smart Money Scanner", color:"#06b6d4" },
  { id:"airdrop", icon:"🪂", name:"AIRDROP AGENT", sub:"Opportunity Hunter", color:"#22c55e" },
  { id:"risk", icon:"⚠️", name:"RISK AGENT", sub:"Unlock & Exploit Monitor", color:"#f97316" },
  { id:"vc", icon:"💰", name:"VC AGENT", sub:"Funding Intelligence", color:"#a855f7" },
]

export default function ScanDashboard() {
  const [scanning, setScanning] = useState(false)
  const [states, setStates] = useState({})
  const [brief, setBrief] = useState(null)

  const scan = () => {
    setScanning(true)
    setBrief(null)
    setStates(AGENTS.reduce((a,ag) => ({...a,[ag.id]:{status:"idle",msgs:[]}}),{}))
    const es = new EventSource("http://localhost:8000/api/mode-a/scan")
    es.addEventListener("agent_start", e => {
      const d = JSON.parse(e.data)
      const key = d.agent.toLowerCase().includes("whale")?"whale":d.agent.toLowerCase().includes("airdrop")?"airdrop":d.agent.toLowerCase().includes("risk")?"risk":d.agent.toLowerCase().includes("vc")?"vc":"brief"
      setStates(p => ({...p,[key]:{status:"scanning",msgs:[...(p[key]?.msgs||[]),d.message]}}))
    })
    es.addEventListener("scan_results", () => {
      AGENTS.forEach(ag => setStates(p => ({...p,[ag.id]:{...p[ag.id],status:"complete"}})))
    })
    es.addEventListener("brief_complete", e => setBrief(JSON.parse(e.data).brief))
    es.addEventListener("scan_complete", () => { setScanning(false); es.close() })
    es.addEventListener("error", () => { setScanning(false); es.close() })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold tracking-widest text-white">MULTI-CHAIN MARKET SCAN</h2>
        <p className="text-white/30 text-xs">Ethereum · Solana · BNB · Base · Arbitrum — simultaneously</p>
      </div>
      <div className="flex justify-center">
        <button onClick={scan} disabled={scanning}
          className={`px-10 py-3 rounded-lg font-bold text-sm tracking-widest border transition-all ${
            scanning ? "bg-cyan-500/5 text-cyan-400/30 border-cyan-500/10 cursor-not-allowed"
                     : "bg-cyan-500/20 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/30 hover:border-cyan-500/60"
          }`}>
          {scanning ? "⚡ SCANNING ALL CHAINS..." : "⚡ RUN MARKET SCAN"}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AGENTS.map(ag => <AgentHuntCard key={ag.id} agent={ag} state={states[ag.id]||{status:"idle",msgs:[]}} />)}
      </div>
      <AnimatePresence>{brief && <BriefPanel brief={brief} />}</AnimatePresence>
    </div>
  )
}
```

---

### src/components/ModeA/AgentHuntCard.jsx
```jsx
import { motion, AnimatePresence } from "framer-motion"

export default function AgentHuntCard({ agent, state }) {
  const { status, msgs=[] } = state
  const isScanning = status === "scanning"
  const isDone = status === "complete"
  return (
    <motion.div
      className="rounded-xl border p-4 transition-colors duration-500"
      style={{ borderColor: isScanning ? agent.color+"60" : isDone ? agent.color+"30" : "rgba(255,255,255,0.06)",
               background: isScanning ? agent.color+"08" : "rgba(255,255,255,0.02)" }}
      animate={isScanning ? { boxShadow: [`0 0 0px ${agent.color}00`, `0 0 25px ${agent.color}20`, `0 0 0px ${agent.color}00`] } : { boxShadow: "none" }}
      transition={{ duration: 2, repeat: Infinity }}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xl">{agent.icon}</span>
        <div>
          <div className="text-xs font-bold tracking-widest" style={{color: isScanning||isDone ? agent.color : "rgba(255,255,255,0.5)"}}>{agent.name}</div>
          <div className="text-xs text-white/20">{agent.sub}</div>
        </div>
        <div className="ml-auto">
          {isScanning && <motion.div className="w-2 h-2 rounded-full" style={{background:agent.color}} animate={{opacity:[1,0.2,1]}} transition={{duration:0.8,repeat:Infinity}} />}
          {isDone && <div className="w-2 h-2 rounded-full" style={{background:agent.color}} />}
          {status==="idle" && <div className="w-2 h-2 rounded-full bg-white/10" />}
        </div>
      </div>
      <div className="space-y-1 min-h-14">
        <AnimatePresence>
          {msgs.map((m,i) => (
            <motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} className="text-xs text-white/50 flex gap-2">
              <span style={{color:agent.color}}>→</span><span>{m}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {status==="idle" && <div className="text-xs text-white/15">Awaiting scan...</div>}
        {isScanning && msgs.length===0 && <motion.div className="text-xs" style={{color:agent.color+"80"}} animate={{opacity:[1,0.4,1]}} transition={{duration:1.2,repeat:Infinity}}>Initialising...</motion.div>}
        {isDone && <div className="text-xs mt-1" style={{color:agent.color+"80"}}>✓ Complete</div>}
      </div>
    </motion.div>
  )
}
```

---

### src/components/ModeA/BriefPanel.jsx
```jsx
import { motion } from "framer-motion"

export default function BriefPanel({ brief }) {
  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
      className="rounded-xl border border-white/10 bg-white/3 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-bold tracking-widest text-white">📋 SPECTRA DAILY BRIEF</div>
        <button onClick={()=>navigator.clipboard.writeText(brief)}
          className="text-xs text-white/30 hover:text-white/50 border border-white/10 px-3 py-1 rounded">
          Copy & Share
        </button>
      </div>
      <pre className="text-xs text-white/65 whitespace-pre-wrap leading-relaxed">{brief}</pre>
    </motion.div>
  )
}
```

---

### src/components/ModeB/CycleScanner.jsx

```jsx
import { useState } from "react"
import TokenInput from "./TokenInput"
import MembraneSurface from "./MembraneSurface"
import StageDisplay from "./StageDisplay"
import ConfidenceGauge from "./ConfidenceGauge"
import LaunchParams from "./LaunchParams"
import SignalCards from "./SignalCards"
import SocialMembrane from "./SocialMembrane"
import TradeLogicPanel from "./TradeLogicPanel"
import AgentStatusBar from "./AgentStatusBar"
import { motion, AnimatePresence } from "framer-motion"

export default function CycleScanner() {
  const [scanning, setScanning] = useState(false)
  const [chainInfo, setChainInfo] = useState(null)
  const [token, setToken] = useState(null)
  const [lifecycle, setLifecycle] = useState(null)
  const [agents, setAgents] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [trade, setTrade] = useState(null)
  const [error, setError] = useState(null)

  const run = (address, chain) => {
    setScanning(true)
    setError(null); setChainInfo(null); setToken(null)
    setLifecycle(null); setAgents([]); setAnalysis(null); setTrade(null)

    const es = new EventSource(`http://localhost:8000/api/mode-b/analyse?token_address=${address}&chain=${chain}`)
    es.addEventListener("chain_detected", e => setChainInfo(JSON.parse(e.data)))
    es.addEventListener("token_resolved", e => setToken(JSON.parse(e.data)))
    es.addEventListener("lifecycle_classified", e => setLifecycle(JSON.parse(e.data)))
    es.addEventListener("agent_start", e => setAgents(p => [...p, JSON.parse(e.data)]))
    es.addEventListener("analysis_complete", e => setAnalysis(JSON.parse(e.data)))
    es.addEventListener("trade_complete", e => setTrade(JSON.parse(e.data)))
    es.addEventListener("scan_complete", () => { setScanning(false); es.close() })
    es.addEventListener("error", e => {
      try { setError(JSON.parse(e.data).error) } catch { setError("Backend error — is it running?") }
      setScanning(false); es.close()
    })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold tracking-widest text-white">SPECTRA ENGINE</h2>
        <p className="text-white/30 text-xs">ERC-20 & Solana · Auto chain detection · Lifecycle phase · Trade logic</p>
      </div>

      <TokenInput onScan={run} scanning={scanning} />

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">⚠️ {error}</div>
      )}

      {/* Chain detection status */}
      {chainInfo && (
        <div className="flex items-center gap-2 text-xs text-white/40 px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          {chainInfo.message}
        </div>
      )}

      {/* Token header bar */}
      {token && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          className="rounded-xl border border-white/10 bg-white/3 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-white">{token.symbol}</div>
              <div className="text-xs text-white/30">{token.name}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">${Number(token.price).toFixed(6)}</div>
              <div className={`text-xs font-bold ${Number(token.priceChange24h)>=0?"text-green-400":"text-red-400"}`}>
                {Number(token.priceChange24h).toFixed(2)}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/40">LIQUIDITY</div>
              <div className="text-sm font-bold text-white">${(token.liquidity/1000).toFixed(0)}K</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/40">HOLDERS</div>
              <div className="text-sm font-bold text-white">{token.holders?.toLocaleString()}</div>
            </div>
            <div className={`text-xs px-3 py-1 rounded-lg font-bold tracking-widest`}
              style={{background: lifecycle ? lifecycle.stage_color+"20" : "#ffffff10",
                      color: lifecycle ? lifecycle.stage_color : "#ffffff40",
                      border: `1px solid ${lifecycle ? lifecycle.stage_color+"40" : "#ffffff10"}`}}>
              {token.chain?.toUpperCase()}
            </div>
          </div>
        </motion.div>
      )}

      {/* Agent status bar */}
      {agents.length > 0 && <AgentStatusBar agents={agents} scanning={scanning} />}

      {/* Main MLO-style dashboard — only shows when lifecycle data exists */}
      {lifecycle && (
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="space-y-4">

          {/* Row 1: Membrane + Stage + Confidence */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Membrane Surface — takes 2 cols */}
            <div className="lg:col-span-2">
              <MembraneSurface stage={lifecycle.stage} velocityScore={lifecycle.velocity_score} stageColor={lifecycle.stage_color} />
            </div>
            {/* Confidence Gauge */}
            <ConfidenceGauge confidence={lifecycle.confidence} stage={lifecycle.stage} bias={lifecycle.stage_bias} stageColor={lifecycle.stage_color} />
          </div>

          {/* Row 2: Stage Display + Signal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StageDisplay lifecycle={lifecycle} />
            <SignalCards short={lifecycle.short_signal} mid={lifecycle.mid_signal} long={lifecycle.long_signal} stageColor={lifecycle.stage_color} />
          </div>

          {/* Row 3: Launch Params + Social Membrane */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LaunchParams lifecycle={lifecycle} />
            <SocialMembrane socialDecay={lifecycle.social_decay_pct} analysis={analysis} token={token} />
          </div>

        </motion.div>
      )}

      {/* Trade Logic */}
      <AnimatePresence>
        {trade && <TradeLogicPanel data={trade} token={token} />}
      </AnimatePresence>
    </div>
  )
}
```

---

### src/components/ModeB/TokenInput.jsx
```jsx
import { useState } from "react"
import { detectChain, CHAIN_OPTIONS, CHAIN_COLORS } from "../../lib/chainDetector"

const QUICK = [
  {symbol:"JUP", addr:"JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", chain:"solana"},
  {symbol:"PEPE", addr:"0x6982508145454Ce325dDbE47a25d4ec3d2311933", chain:"eth"},
  {symbol:"BONK", addr:"DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", chain:"solana"},
  {symbol:"SHIB", addr:"0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", chain:"eth"},
]

export default function TokenInput({ onScan, scanning }) {
  const [addr, setAddr] = useState("")
  const [chain, setChain] = useState("auto")
  const [detected, setDetected] = useState(null)

  const onChange = v => {
    setAddr(v)
    setDetected(v.length > 10 ? detectChain(v) : null)
  }

  return (
    <div className="space-y-3">
      {/* Chain buttons */}
      <div className="flex gap-2 flex-wrap">
        {CHAIN_OPTIONS.map(o => (
          <button key={o.value} onClick={() => setChain(o.value)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
              chain === o.value
                ? "text-white border-white/30 bg-white/10"
                : "text-white/30 border-white/10 hover:text-white/50"
            }`}>
            {o.label}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input value={addr} onChange={e=>onChange(e.target.value)} disabled={scanning}
            placeholder="Paste any token contract address — ERC-20 or Solana..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-purple-500/40 font-mono pr-24" />
          {detected && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-0.5 rounded font-bold"
              style={{background: (detected==="solana"?"#9945FF":"#627EEA")+"20",
                      color: detected==="solana"?"#9945FF":"#627EEA"}}>
              {detected==="solana"?"◎ SOL":"Ξ EVM"}
            </div>
          )}
        </div>
        <button onClick={()=>addr.trim()&&onScan(addr.trim(),chain)} disabled={scanning||!addr.trim()}
          className={`px-6 py-3 rounded-xl font-bold text-sm tracking-widest border transition-all ${
            scanning||!addr.trim()
              ? "bg-purple-500/5 text-purple-400/30 border-purple-500/10 cursor-not-allowed"
              : "bg-purple-500/20 text-purple-400 border-purple-500/40 hover:bg-purple-500/30"
          }`}>
          {scanning ? "SCANNING..." : "RUN ENGINE"}
        </button>
      </div>

      {/* Quick fills */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-xs text-white/15">Quick test:</span>
        {QUICK.map(t => (
          <button key={t.symbol} onClick={()=>{setAddr(t.addr);setChain(t.chain);setDetected(t.chain==="solana"?"solana":"evm")}}
            className="text-xs text-white/25 hover:text-white/45 border border-white/10 px-2 py-1 rounded font-mono">
            {t.symbol}
          </button>
        ))}
      </div>
    </div>
  )
}
```

---

### src/components/ModeB/MembraneSurface.jsx

**This is the most important Mode B component — the canvas waveform inspired by MLO.**

```jsx
import { useEffect, useRef } from "react"

const WAVE_CONFIG = {
  SEEDING:      { amplitude: 12, frequency: 0.018, noise: 0.25, speed: 0.03 },
  IGNITION:     { amplitude: 30, frequency: 0.035, noise: 0.08, speed: 0.07 },
  PEAK:         { amplitude: 50, frequency: 0.055, noise: 0.45, speed: 0.12 },
  DISTRIBUTION: { amplitude: 22, frequency: 0.028, noise: 0.35, speed: 0.04 },
  DEAD:         { amplitude: 2,  frequency: 0.01,  noise: 0.6,  speed: 0.01 },
}

export default function MembraneSurface({ stage, velocityScore, stageColor }) {
  const canvasRef = useRef(null)
  const frameRef = useRef(0)
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const cfg = WAVE_CONFIG[stage] || WAVE_CONFIG.DEAD
    const color = stageColor || "#6b7280"

    const draw = () => {
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)
      frameRef.current += cfg.speed

      // Background grid lines (subtle)
      ctx.strokeStyle = "rgba(255,255,255,0.03)"
      ctx.lineWidth = 0.5
      for (let y = 0; y < H; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }

      // Main waveform
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.shadowBlur = stage === "DEAD" ? 0 : 20
      ctx.shadowColor = color

      for (let x = 0; x <= W; x++) {
        const t = frameRef.current
        const noise = (Math.random() - 0.5) * cfg.noise * cfg.amplitude
        let y = H / 2

        if (stage === "DEAD") {
          y += noise * 0.4
        } else if (stage === "PEAK") {
          // Clipped distortion
          const raw = Math.sin(x * cfg.frequency + t) * cfg.amplitude
          y += Math.max(-cfg.amplitude * 0.7, Math.min(cfg.amplitude * 0.7, raw * 1.4)) + noise
        } else if (stage === "IGNITION") {
          // Sawtooth building
          const saw = ((x * cfg.frequency + t) % (Math.PI * 2)) / (Math.PI * 2) * cfg.amplitude * 2 - cfg.amplitude
          y += saw * 0.7 + Math.sin(x * cfg.frequency + t) * cfg.amplitude * 0.4 + noise
        } else if (stage === "DISTRIBUTION") {
          // Decaying amplitude
          const decay = 1 - (x / W) * 0.5
          y += Math.sin(x * cfg.frequency + t) * cfg.amplitude * decay + noise
        } else {
          // SEEDING — low tremor
          y += Math.sin(x * cfg.frequency + t) * cfg.amplitude
            + Math.sin(x * cfg.frequency * 3 + t * 2) * cfg.amplitude * 0.2 + noise
        }

        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Second harmonic (fainter)
      ctx.beginPath()
      ctx.strokeStyle = color + "40"
      ctx.lineWidth = 0.5
      ctx.shadowBlur = 0

      for (let x = 0; x <= W; x++) {
        const y = H / 2 + Math.sin(x * cfg.frequency * 2 + frameRef.current * 1.3) * cfg.amplitude * 0.3
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [stage, stageColor])

  return (
    <div className="rounded-xl border border-white/10 bg-black/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background: stageColor}} />
          <span className="text-xs text-white/40 tracking-widest">MEMBRANE ACTIVE</span>
        </div>
        <div className="text-xs font-bold tracking-widest px-2 py-0.5 rounded"
          style={{background: stageColor+"20", color: stageColor, border:`1px solid ${stageColor}30`}}>
          {stage}
        </div>
      </div>
      <canvas ref={canvasRef} width={600} height={110} className="w-full rounded-lg"
        style={{background:"rgba(0,0,0,0.4)"}} />
      <div className="flex justify-between mt-3 text-xs text-white/20">
        <span>TX VELOCITY</span>
        <span className="font-bold" style={{color: stageColor}}>
          {stage === "DEAD" ? "0%" : `${Math.round(velocityScore * 100)}%`}
        </span>
      </div>
    </div>
  )
}
```

---

### src/components/ModeB/StageDisplay.jsx
```jsx
import { motion } from "framer-motion"

const ALL_STAGES = ["SEEDING","IGNITION","PEAK","DISTRIBUTION","DEAD"]
const COLORS = {SEEDING:"#22c55e",IGNITION:"#06b6d4",PEAK:"#ef4444",DISTRIBUTION:"#f97316",DEAD:"#6b7280"}
const POSITIONS = {SEEDING:8,IGNITION:30,PEAK:55,DISTRIBUTION:78,DEAD:96}

export default function StageDisplay({ lifecycle }) {
  const color = lifecycle.stage_color || COLORS[lifecycle.stage] || "#6b7280"
  return (
    <div className="rounded-xl border border-white/10 bg-white/2 p-5">
      <div className="text-xs text-white/30 tracking-widest mb-1">CURRENT STAGE</div>
      <div className="text-4xl font-bold mb-4 tracking-widest" style={{color}}>{lifecycle.stage}</div>

      {/* Stage progress bar */}
      <div className="relative h-1.5 bg-white/5 rounded-full mb-3 overflow-visible">
        <div className="absolute inset-0 flex rounded-full overflow-hidden">
          {ALL_STAGES.map(s => (
            <div key={s} className="flex-1" style={{background: COLORS[s]+"25"}} />
          ))}
        </div>
        <motion.div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-black"
          style={{background: color}}
          initial={{left:"0%"}} animate={{left:`${POSITIONS[lifecycle.stage]}%`}}
          transition={{duration:1.2, ease:"easeOut"}} />
      </div>
      <div className="flex justify-between text-xs text-white/15 mb-4">
        {ALL_STAGES.map(s => <span key={s} className={lifecycle.stage===s?"font-bold":""}
          style={{color: lifecycle.stage===s ? COLORS[s] : undefined}}>{s.slice(0,4)}</span>)}
      </div>

      {/* Score bars */}
      {[
        {label:"VELOCITY", val:lifecycle.velocity_score},
        {label:"LIQUIDITY", val:lifecycle.liquidity_score},
        {label:"MATURITY",  val:lifecycle.age_score},
      ].map(s => (
        <div key={s.label} className="flex items-center gap-3 mb-2">
          <span className="text-xs text-white/30 w-16">{s.label}</span>
          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{background:color}}
              initial={{width:0}} animate={{width:`${s.val*100}%`}} transition={{duration:1,ease:"easeOut"}} />
          </div>
          <span className="text-xs text-white/50 w-8 text-right">{(s.val*100).toFixed(0)}%</span>
        </div>
      ))}

      <div className="mt-4 p-3 rounded-lg border border-white/5 bg-white/3">
        <div className="text-xs text-white/30 mb-1">TRADER ACTION</div>
        <div className="text-sm font-bold" style={{color}}>{lifecycle.trader_action}</div>
      </div>
    </div>
  )
}
```

---

### src/components/ModeB/ConfidenceGauge.jsx
```jsx
import { useEffect, useRef } from "react"

export default function ConfidenceGauge({ confidence, stage, bias, stageColor }) {
  const canvasRef = useRef(null)
  const color = stageColor || "#6b7280"

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const W = canvas.width, H = canvas.height
    const cx = W/2, cy = H/2 + 10, r = 70

    ctx.clearRect(0,0,W,H)

    // Background arc
    ctx.beginPath()
    ctx.arc(cx,cy,r, Math.PI*0.75, Math.PI*2.25)
    ctx.strokeStyle = "rgba(255,255,255,0.06)"
    ctx.lineWidth = 10
    ctx.lineCap = "round"
    ctx.stroke()

    // Confidence arc
    const endAngle = Math.PI*0.75 + (confidence/100) * Math.PI*1.5
    ctx.beginPath()
    ctx.arc(cx,cy,r, Math.PI*0.75, endAngle)
    ctx.strokeStyle = color
    ctx.lineWidth = 10
    ctx.shadowBlur = 15
    ctx.shadowColor = color
    ctx.stroke()

    // Center text
    ctx.fillStyle = "white"
    ctx.font = "bold 32px monospace"
    ctx.textAlign = "center"
    ctx.fillText(`${Math.round(confidence)}`, cx, cy+8)
    ctx.font = "10px monospace"
    ctx.fillStyle = "rgba(255,255,255,0.3)"
    ctx.fillText("%", cx+22, cy-10)

  }, [confidence, stageColor])

  return (
    <div className="rounded-xl border border-white/10 bg-white/2 p-5 flex flex-col items-center">
      <div className="text-xs text-white/30 tracking-widest mb-2 self-start">CONFIDENCE INDEX</div>
      <canvas ref={canvasRef} width={200} height={160} className="w-full max-w-48" />
      <div className="text-xs font-bold tracking-widest mt-1" style={{color}}>{bias}</div>

      {/* SPECTRA V2 badge (like MLO V2 in screenshot) */}
      <div className="mt-3 w-14 h-14 rounded-full border flex items-center justify-center"
        style={{borderColor:color+"40",background:color+"10"}}>
        <div className="text-center">
          <div className="text-xs text-white/30">SPECTRA</div>
          <div className="text-xs font-bold" style={{color}}>V1</div>
        </div>
      </div>
    </div>
  )
}
```

---

### src/components/ModeB/LaunchParams.jsx
```jsx
export default function LaunchParams({ lifecycle }) {
  const isDormant = lifecycle.stage === "DEAD" || lifecycle.stage === "DISTRIBUTION"
  return (
    <div className="rounded-xl border border-white/10 bg-white/2 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isDormant?"bg-white/20":"animate-pulse"}`}
            style={{background: isDormant?"":"#22c55e"}} />
          <span className="text-xs text-white/40 tracking-widest">LAUNCH PARAMETERS</span>
        </div>
        <div className={`text-xs px-2 py-0.5 rounded font-bold tracking-widest ${isDormant?"bg-white/5 text-white/20":"bg-green-500/20 text-green-400"}`}>
          {isDormant?"DORMANT":"LIVE"}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs text-white/30 mb-1">OPTIMAL ENTRY WINDOW</div>
        <div className="text-2xl font-bold text-white">{lifecycle.optimal_entry_window}</div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-white/30 mb-1">
          <span>LIQUIDITY DEPTH</span>
          <span className="text-white/50">{lifecycle.liquidity_depth_pct?.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000"
            style={{width:`${lifecycle.liquidity_depth_pct}%`, background:lifecycle.stage_color}} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <div className="text-xs text-white/30 mb-1">SLIPPAGE</div>
          <div className="text-lg font-bold text-white">{lifecycle.slippage_recommendation}</div>
          <div className={`text-xs mt-1 ${lifecycle.liquidity_score < 0.2 ? "text-red-400" : "text-green-400"}`}>
            {lifecycle.liquidity_score < 0.2 ? "⚠ Thin liquidity" : "✓ Safe to enter"}
          </div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <div className="text-xs text-white/30 mb-1">TX VELOCITY</div>
          <div className="text-lg font-bold text-white">{lifecycle.tx_velocity_pct?.toFixed(0)}%</div>
          <div className={`text-xs mt-1 ${lifecycle.velocity_score > 0.5 ? "text-cyan-400" : "text-white/30"}`}>
            {lifecycle.velocity_score > 0.7 ? "⚡ High activity" : lifecycle.velocity_score > 0.3 ? "→ Building" : "○ Low activity"}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### src/components/ModeB/SignalCards.jsx
```jsx
import { motion } from "framer-motion"

export default function SignalCards({ short, mid, long, stageColor }) {
  const signals = [
    { label: "SHORT", value: short, timeframe: "1-7 days" },
    { label: "MID",   value: mid,   timeframe: "1-4 weeks" },
    { label: "LONG",  value: long,  timeframe: "1-3 months" },
  ]
  const getColor = v => v > 60 ? "#22c55e" : v > 30 ? "#f97316" : "#ef4444"
  const getSign = v => v > 0 ? "+" : ""

  return (
    <div className="rounded-xl border border-white/10 bg-white/2 p-5">
      <div className="text-xs text-white/30 tracking-widest mb-4">SIGNAL STRENGTH</div>
      <div className="grid grid-cols-3 gap-3">
        {signals.map(s => (
          <div key={s.label} className="text-center">
            <div className="text-xs text-white/30 mb-2 tracking-widest">{s.label}</div>
            <div className="relative w-full h-20 bg-black/30 rounded-lg border border-white/5 flex items-end justify-center pb-2 overflow-hidden">
              <motion.div className="absolute bottom-0 left-0 right-0 rounded-lg"
                style={{background: getColor(s.value)+"30"}}
                initial={{height:0}} animate={{height:`${s.value}%`}} transition={{duration:1.2,ease:"easeOut"}} />
              <span className="relative text-sm font-bold z-10" style={{color:getColor(s.value)}}>
                {getSign(s.value)}{s.value?.toFixed(0)}%
              </span>
            </div>
            <div className="text-xs text-white/20 mt-1">{s.timeframe}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

### src/components/ModeB/SocialMembrane.jsx
```jsx
export default function SocialMembrane({ socialDecay, analysis, token }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/2 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs text-white/40 tracking-widest">SOCIAL MEMBRANE</span>
        </div>
        <div className="text-xs text-white/40">Decay: {socialDecay?.toFixed(0)}%</div>
      </div>

      {token && (
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white">
            {token.symbol?.slice(0,3)}
          </div>
          <div>
            <div className="text-sm font-bold text-white">{token.symbol}</div>
            <div className="text-xs text-white/30">{token.name}</div>
          </div>
        </div>
      )}

      <div className="mb-3">
        <div className="flex justify-between text-xs text-white/30 mb-1">
          <span>SOCIAL DECAY</span>
          <span>{socialDecay?.toFixed(0)}%</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-purple-400/60 transition-all duration-1000"
            style={{width:`${socialDecay}%`}} />
        </div>
      </div>

      {analysis && (
        <pre className="text-xs text-white/40 whitespace-pre-wrap leading-relaxed mt-3 max-h-32 overflow-y-auto">
          {analysis.results?.slice(0,300)}...
        </pre>
      )}
    </div>
  )
}
```

---

### src/components/ModeB/AgentStatusBar.jsx
```jsx
import { motion } from "framer-motion"

const AGENT_COLORS = {
  "LIFECYCLE": "#06b6d4",
  "ATTENTION": "#a855f7",
  "PSYCHOLOGY": "#f97316",
  "TRADE": "#22c55e",
  "default": "#6b7280"
}

export default function AgentStatusBar({ agents, scanning }) {
  if (!agents.length) return null
  return (
    <div className="rounded-xl border border-white/5 bg-white/2 p-3">
      <div className="flex gap-3 flex-wrap">
        {agents.map((a, i) => {
          const key = Object.keys(AGENT_COLORS).find(k => a.agent.toUpperCase().includes(k)) || "default"
          const color = AGENT_COLORS[key]
          return (
            <motion.div key={i} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}}
              className="flex items-center gap-2 text-xs">
              <motion.div className="w-1.5 h-1.5 rounded-full"
                style={{background:color}}
                animate={a.status==="scanning"?{opacity:[1,0.3,1]}:{opacity:1}}
                transition={{duration:0.8,repeat:Infinity}} />
              <span className="text-white/40">{a.agent}</span>
              <span className="text-white/20">—</span>
              <span style={{color:color+"80"}}>{a.message}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
```

---

### src/components/ModeB/TradeLogicPanel.jsx
```jsx
import { motion } from "framer-motion"

export default function TradeLogicPanel({ data, token }) {
  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
      className="rounded-xl border border-purple-500/20 bg-purple-500/3 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-purple-400/50 tracking-widest">SPECTRA TRADE ANALYSIS</div>
          <div className="text-sm font-bold text-white">{token?.symbol} — Asymmetric Opportunity</div>
        </div>
        <button onClick={()=>navigator.clipboard.writeText(data.output||"")}
          className="text-xs text-white/25 hover:text-white/45 border border-white/10 px-3 py-1 rounded">
          Copy
        </button>
      </div>
      <pre className="text-xs text-white/60 whitespace-pre-wrap leading-relaxed font-mono">
        {data.output}
      </pre>
    </motion.div>
  )
}
```

---

## SWARMS MARKETPLACE — FINAL LISTING

**Name:** SPECTRA — Multi-Chain Web3 Intelligence Swarm

**About this agent:**

SPECTRA is a premium multi-agent on-chain intelligence platform built for serious Web3 traders, DeFi hunters, and autonomous AI agents operating across Ethereum, Solana, BNB Chain, Base, and Arbitrum.

The platform runs two powerful intelligence modes — a zero-input multi-chain market scanner that hunts whale movements, airdrop opportunities, token unlock risks, and VC funding signals across five chains every single day — and a deep multi-chain cycle intelligence engine powered by the SPECTRA Lifecycle Engine that classifies any ERC-20 or Solana token into its exact market cycle phase before the crowd notices.

Users can run a full market scan with zero input or paste any token address to receive structured AI-powered intelligence including:

* lifecycle phase detection (Seeding, Ignition, Peak, Distribution, Dead),
* confidence-scored stage classification with visual membrane output,
* smart money and whale movement signals across all major chains,
* airdrop opportunity scoring before they trend on CT,
* attention timing and virality window analysis,
* market psychology breakdowns with crowd behaviour diagnosis,
* optimal entry window and slippage recommendations,
* short, mid, and long signal strength scoring,
* token unlock and security exploit risk alerts,
* VC funding pattern intelligence and sector rotation signals,
* and asymmetric trade logic with specific entry, exit, and invalidation signals.

SPECTRA combines live on-chain data from Birdeye, Moralis, DeFiLlama, and CoinGecko with a five-agent concurrent intelligence swarm, a live-streaming war room experience for Mode A, and a professional trading terminal interface for Mode B — giving traders and AI agents the signals they need before the timeline notices.

**Tags:** `web3` `solana` `ethereum` `BNB` `base` `arbitrum` `trading` `whale-tracking` `airdrop` `lifecycle` `memecoin` `DeFi` `intelligence` `multi-chain` `on-chain` `alpha` `daily-brief` `cycle-detection`

---

## THE CODEX PROMPT — PASTE THIS TO CODEX

---

Build a project called **SPECTRA** — a multi-agent Web3 intelligence platform using the Swarms framework.

**CRITICAL NAMING — follow exactly throughout all code, UI, comments:**
- Product name: SPECTRA
- Cycle classification system: "Lifecycle Engine" (never MLO)
- Mode B UI display name: "SPECTRA ENGINE"
- All Swarms agent names start with "SPECTRA-"

**Create this folder structure:**
```
SPECTRA/
├── backend/
│   ├── main.py
│   ├── agents.py
│   ├── tools/ (moralis_tools.py, birdeye_tools.py, defillama_tools.py, coingecko_tools.py)
│   ├── lifecycle/engine.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ModeToggle.jsx
│   │   │   ├── ModeA/ (ScanDashboard.jsx, AgentHuntCard.jsx, BriefPanel.jsx, FrenzyMode.jsx)
│   │   │   ├── ModeB/ (CycleScanner.jsx, TokenInput.jsx, MembraneSurface.jsx, StageDisplay.jsx, ConfidenceGauge.jsx, LaunchParams.jsx, SignalCards.jsx, SocialMembrane.jsx, TradeLogicPanel.jsx, AgentStatusBar.jsx)
│   │   │   └── shared/ (Header.jsx, LoadingSkeleton.jsx, ErrorBoundary.jsx)
│   │   ├── hooks/ (useModeAScan.js, useModeBScan.js)
│   │   ├── lib/chainDetector.js
│   │   ├── App.jsx, main.jsx, index.css
│   ├── index.html, vite.config.js, package.json
└── README.md
```

**BACKEND:**

**lifecycle/engine.py** — SPECTRA Lifecycle Engine:
- Five stages: SEEDING, IGNITION, PEAK, DISTRIBUTION, DEAD
- Classification: DEAD=vel<0.05&liq<0.1 | DISTRIBUTION=0.3<vel<0.6&liq>0.4&age<0.4 | PEAK=vel>0.7&liq>0.6 | IGNITION=0.2<vel<0.7&liq>0.2&age>0.3 | SEEDING=default
- Confidence=min(95,60+vel×20+liq×20)
- scores_from_moralis(): vel=transfers_24h/43200, liq=liquidity_usd/1M, age=total_holders/10000
- scores_from_birdeye(): vel=trade24h/43200, liq=liquidity/1M, age=holder/10000
- All scores capped at 1.0
- detect_chain_from_address(): 0x+42chars=evm, else=solana
- EngineResult must also include: tx_velocity_pct, liquidity_depth_pct, optimal_entry_window, slippage_recommendation, short_signal, mid_signal, long_signal, social_decay_pct, all computed from scores
- STAGE_CONFIG dict with color, bias, action for each stage

**tools/moralis_tools.py**: Moralis API (X-API-Key header) for EVM chains. Functions: get_erc20_token_data(addr,chain)→dict with price_usd/symbol/name/transfers_24h/liquidity_usd/total_holders/holder_change_24h, get_erc20_token_summary(addr,chain)→str, get_evm_whale_movements(chain)→str, scan_all_evm_chains()→str. Chain map: eth/ethereum→eth, bnb/bsc→bsc, base→base, arbitrum→arbitrum.

**tools/birdeye_tools.py**: Birdeye API (X-API-KEY + x-chain:solana headers). Functions: get_token_overview_raw(addr)→dict, get_token_overview(addr)→str, get_token_security(addr)→str, get_top_traders(addr)→str, get_solana_whale_movements()→str.

**tools/defillama_tools.py**: Free, no auth. Functions: get_airdrop_opportunities()→protocols with TVL>$50M no token, get_token_unlocks()→str, get_recent_hacks()→str, get_recent_raises()→str.

**agents.py**: All agents use swarms Agent class. MODE A agents: SPECTRA-WHALE-AGENT (tools: get_solana_whale_movements, scan_all_evm_chains), SPECTRA-AIRDROP-AGENT (tools: get_airdrop_opportunities), SPECTRA-RISK-AGENT (tools: get_token_unlocks, get_recent_hacks), SPECTRA-VC-AGENT (tools: get_recent_raises), SPECTRA-BRIEF-WRITER (no tools, synthesis). MODE B agents: SPECTRA-LIFECYCLE-DETECTOR (tools: get_token_overview, get_erc20_token_summary, get_token_security, get_top_traders), SPECTRA-ATTENTION-AGENT, SPECTRA-PSYCHOLOGY-AGENT, SPECTRA-TRADE-LOGIC (no tools). All agents have detailed system prompts. build_mode_a_workflow()→(ConcurrentWorkflow of 4, brief_writer). build_mode_b_workflow()→(ConcurrentWorkflow of 3, trade_logic).

**main.py**: FastAPI + CORS + SSE via sse-starlette. Endpoints: GET / (health), GET /api/mode-a/scan (SSE, zero input, Mode A), GET /api/mode-b/analyse?token_address=X&chain=auto (SSE, auto-detects chain, runs engine + agents), GET /api/agents/whale-scan, /api/agents/airdrops, /api/agents/unlocks, /api/agents/vc-funding, /api/agents/lifecycle/{address}?chain=auto (all return JSON for agent-to-agent calls). SSE events: chain_detected, agent_start, token_resolved, lifecycle_classified, scan_results, analysis_complete, trade_complete, brief_complete, scan_complete, error.

**FRONTEND — React 19 + Vite + Tailwind v4 + Framer Motion:**

Background: #0a0a0f. All panels: bg-white/3 or bg-white/5, border-white/10, rounded-xl. Mode A accent: cyan #06b6d4. Mode B accent: purple #a855f7. Font: monospace throughout.

**lib/chainDetector.js**: detectChain(addr)→'evm'|'solana', CHAIN_OPTIONS array, CHAIN_COLORS object.

**ModeToggle.jsx**: Two buttons — Mode A (cyan, "⚡ MARKET SCAN", "Multi-Chain · Zero Input") and Mode B (purple, "🔬 SPECTRA ENGINE", "Any Token · Any Chain").

**ModeA/ScanDashboard.jsx**: 4 agent cards in 2×2 grid + "⚡ RUN MARKET SCAN" button + BriefPanel. SSE to /api/mode-a/scan.

**ModeA/AgentHuntCard.jsx**: Agent icon/name/subtitle, status dot (idle/scanning/complete), streaming messages with → prefix, Framer Motion pulsing glow in agent color when scanning.

**ModeA/BriefPanel.jsx**: Monospace brief with Copy & Share button.

**ModeB/CycleScanner.jsx**: TokenInput + chain detection status bar + token header bar (symbol/name/price/liquidity/holders/chain badge) + AgentStatusBar + then when lifecycle data arrives: Row1=(MembraneSurface 2cols + ConfidenceGauge 1col), Row2=(StageDisplay + SignalCards), Row3=(LaunchParams + SocialMembrane) + TradeLogicPanel.

**ModeB/TokenInput.jsx**: Chain selector buttons (Auto/Solana/ETH/BNB/Base/Arbitrum), address input with auto-detected chain badge overlay, "RUN ENGINE" button, 4 quick-fill tokens (JUP SOL, PEPE ETH, BONK SOL, SHIB ETH).

**ModeB/MembraneSurface.jsx**: Canvas animation at 60fps using requestAnimationFrame. Stage morphologies: SEEDING=low amplitude tremor with micro-spasms | IGNITION=building sawtooth with momentum | PEAK=clipped overdriven distortion | DISTRIBUTION=decaying amplitude envelope | DEAD=flatline with micro tremors. Stage-specific glow (shadowBlur/shadowColor). Background subtle grid lines. Second harmonic wave fainter. Shows TX VELOCITY % at bottom.

**ModeB/ConfidenceGauge.jsx**: Canvas-drawn circular arc gauge (not CSS). Arc from 135° to 45° clockwise showing confidence %. Center shows confidence number. Stage color for arc. Stage bias label below. SPECTRA V1 badge (circle with SPECTRA/V1 text, like MLO V2 in screenshot).

**ModeB/StageDisplay.jsx**: Stage name large bold in stage color, progress bar with position marker across all 5 stages, velocity/liquidity/maturity score bars with animation, trader action in stage color.

**ModeB/LaunchParams.jsx**: LIVE/DORMANT badge, optimal entry window (large text), liquidity depth bar, slippage card + TX velocity card in grid.

**ModeB/SignalCards.jsx**: Short/Mid/Long signal as vertical bar charts (animated fill from bottom) with percentage and timeframe labels.

**ModeB/SocialMembrane.jsx**: Token symbol avatar circle, social decay progress bar, preview of analysis text.

**ModeB/AgentStatusBar.jsx**: Shows streaming agent messages as they come in from SSE, each with a colored dot matching agent type.

**ModeB/TradeLogicPanel.jsx**: Purple-themed, shows trade logic output with copy button.

**shared/Header.jsx**: "SPECTRA" bold + "| WEB3 INTELLIGENCE SWARM" + green pulse LIVE indicator + "Powered by Swarms".

**ENV (.env.example):** OPENAI_API_KEY, SWARMS_API_KEY, BIRDEYE_API_KEY (birdeye.so/developers free), MORALIS_API_KEY (moralis.io free).

Backend: port 8000. Frontend: port 5173.