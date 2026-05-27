"""
SPECTRA FastAPI Backend — Complete main.py
All SSE endpoints + agent-to-agent REST routes
"""

import asyncio
import json
import os
import openai
from datetime import datetime, timezone
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from dotenv import load_dotenv

# Import agents
from agents import build_mode_b_workflow

# Import tools directly for Mode A
from tools.birdeye_tools import get_solana_whale_movements, get_token_overview_raw
from tools.moralis_tools import scan_all_evm_chains, get_erc20_token_data
from tools.defillama_tools import (
    get_airdrop_opportunities,
    get_token_unlocks,
    get_recent_hacks,
    get_recent_raises,
    get_defi_market_overview,
    get_trending_and_market,
    get_defi_protocol_momentum
)

# Import lifecycle engine
from lifecycle.engine import (
    classify,
    scores_from_moralis,
    scores_from_birdeye,
    detect_chain_from_address,
    STAGE_CONFIG
)

load_dotenv()

app = FastAPI(title="SPECTRA API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)


def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found in environment variables")
    return openai.OpenAI(api_key=api_key)


def get_current_time():
    return datetime.now(timezone.utc).strftime("%b %d %Y %H:%M UTC")


def safe_float(val, default=0.0) -> float:
    try:
        if val is None or val == "" or val == "null":
            return default
        return float(val)
    except (TypeError, ValueError):
        return default


def safe_int(val, default=0) -> int:
    try:
        if val is None or val == "" or val == "null":
            return default
        return int(float(val))
    except (TypeError, ValueError):
        return default


@app.get("/")
def root():
    return {
        "product": "OMEN",
        "version": "1.0.0",
        "status": "online",
        "current_time": get_current_time(),
        "modes": {
            "A": "Market Brief — Daily Intelligence",
            "B": "Lifecycle Engine — any ERC-20 or Solana token"
        }
    }


# ================================================================
# MODE A — MARKET BRIEF
# ================================================================

@app.get("/api/mode-a/scan")
async def mode_a_scan():
    async def generate():
        try:
            # Stream agent startup
            for name, msg in [
                ("🔍 WHALE AGENT", "Scanning smart money across Solana & BSC..."),
                ("🪂 AIRDROP AGENT", "Finding high-TVL no-token protocols..."),
                ("⚠️ RISK AGENT", "Checking exploits and unlock risks..."),
                ("💰 VC AGENT", "Tracking recent funding patterns...")
            ]:
                yield {
                    "event": "agent_start",
                    "data": json.dumps({"agent": name, "message": msg, "status": "scanning"})
                }
                await asyncio.sleep(0.5)

            # Call all tools — run concurrently where possible
            whale_data = get_solana_whale_movements() + "\n\n" + scan_all_evm_chains()
            airdrop_data = get_airdrop_opportunities()
            risk_data = get_recent_hacks()  # hacks always works
            vc_data = get_recent_raises()

            # New enriched data sources
            market_data = get_trending_and_market()
            defi_overview = get_defi_market_overview()
            protocol_momentum = get_defi_protocol_momentum()

            # Mark all agents complete
            yield {
                "event": "scan_results",
                "data": json.dumps({"status": "complete"})
            }

            yield {
                "event": "agent_start",
                "data": json.dumps({
                    "agent": "📋 BRIEF WRITER",
                    "message": "Synthesising intelligence into SPECTRA brief...",
                    "status": "synthesising"
                })
            }

            now = get_current_time()
            client = get_openai_client()

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": f"You are SPECTRA Brief Writer. Today is {now}. Write sharp, specific, actionable crypto intelligence briefs for memecoin traders and DeFi participants. Use only real data provided. Never use placeholder text. Be specific with numbers and names."
                    },
                    {
                        "role": "user",
                        "content": f"""Write the OMEN DAILY BRIEF using ALL of this real live data:

WHALE & SMART MONEY DATA:
{whale_data}

DEFI MARKET OVERVIEW:
{defi_overview}

MARKET INTELLIGENCE & TRENDING TOKENS:
{market_data}

PROTOCOL TVL MOMENTUM:
{protocol_momentum}

AIRDROP CANDIDATES:
{airdrop_data}

RISK EVENTS & EXPLOITS:
{risk_data}

VC FUNDING:
{vc_data}

Output EXACTLY this format. Use real data from above. Replace every bracketed section with actual findings:

OMEN DAILY BRIEF — {now}

🐋 SMART MONEY (12h)
→ [whale findings — specific tokens and amounts or "No significant moves above threshold"]

📊 DEFI MARKET
→ [total TVL and 24h change]
→ [top chains by TVL]
→ [top protocol gainers from momentum data]

🔥 TRENDING NOW
→ [trending tokens from CoinGecko with % gains]

🪂 AIRDROP ALPHA
→ [top 2-3 airdrop candidates with TVL amounts]

⚠️ RISK EVENTS
→ [real exploit names and amounts from hack data]

💰 VC SIGNAL
→ [VC funding findings or "No significant rounds detected"]

📌 TOP INSIGHT TODAY
→ [single most actionable thing for a memecoin or DeFi trader right now based on all the above data]"""
                    }
                ],
                max_tokens=900,
                temperature=0.3
            )

            brief_text = response.choices[0].message.content.strip()

            yield {
                "event": "brief_complete",
                "data": json.dumps({"brief": brief_text})
            }

            yield {
                "event": "scan_complete",
                "data": json.dumps({"status": "complete"})
            }

        except Exception as e:
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)})
            }

    return EventSourceResponse(generate())


# ================================================================
# MODE B — LIFECYCLE ENGINE (MULTI-CHAIN)
# ================================================================

@app.get("/api/mode-b/analyse")
async def mode_b_analyse(
    token_address: str = Query(...),
    chain: str = Query("auto")
):
    async def generate():
        try:
            detected = detect_chain_from_address(token_address) if chain == "auto" else chain
            is_solana = detected == "solana" or chain == "solana"
            chain_label = "Solana" if is_solana else chain.upper()

            yield {
                "event": "chain_detected",
                "data": json.dumps({
                    "chain": "solana" if is_solana else detected,
                    "label": chain_label,
                    "message": f"Detected {chain_label} token - fetching on-chain data..."
                })
            }

            if is_solana:
                raw = get_token_overview_raw(token_address)
                if not raw:
                    yield {"event": "error", "data": json.dumps({"error": "Token not found on Solana. Check the contract address."})}
                    return

                token_info = {
                    "symbol": str(raw.get("symbol", "UNKNOWN")),
                    "name": str(raw.get("name", "Unknown")),
                    "price": safe_float(raw.get("price", 0)),
                    "volume24h": safe_float(raw.get("v24hUSD", 0)),
                    "liquidity": safe_float(raw.get("liquidity", 0)),
                    "holders": safe_int(raw.get("holder", 0)),
                    "priceChange24h": safe_float(raw.get("priceChange24hPercent", 0)),
                    "trades24h": safe_float(raw.get("trade24h", 0)),
                    "chain": "solana",
                    "marketCap": safe_float(raw.get("mc", 0))
                }
                scores = scores_from_birdeye(raw)

            else:
                evm_chain = chain if chain not in ["auto", "evm"] else "eth"
                raw = get_erc20_token_data(token_address, evm_chain)

                if raw.get("symbol") == "UNKNOWN":
                    yield {"event": "error", "data": json.dumps({"error": f"Token not found on {evm_chain.upper()}. Check address and chain."})}
                    return

                token_info = {
                    "symbol": str(raw.get("symbol", "UNKNOWN")),
                    "name": str(raw.get("name", "Unknown")),
                    "price": safe_float(raw.get("price_usd", 0)),
                    "volume24h": safe_float(raw.get("transfers_24h", 0)),
                    "liquidity": safe_float(raw.get("liquidity_usd", 0)),
                    "holders": safe_int(raw.get("total_holders", 0)),
                    "priceChange24h": 0.0,
                    "trades24h": safe_float(raw.get("transfers_24h", 0)),
                    "chain": evm_chain,
                    "marketCap": 0.0
                }
                scores = scores_from_moralis(raw)

            yield {"event": "token_resolved", "data": json.dumps(token_info)}

            result = classify(
                velocity_score=scores["velocity_score"],
                liquidity_score=scores["liquidity_score"],
                age_score=scores["age_score"],
                chain=token_info["chain"],
                token_symbol=token_info["symbol"]
            )

            stage_cfg = STAGE_CONFIG.get(result.stage.value, {})

            yield {
                "event": "lifecycle_classified",
                "data": json.dumps({
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
                    "stage_color": stage_cfg.get("color", "#6b7280"),
                    "stage_bias": stage_cfg.get("bias", "UNKNOWN"),
                })
            }

            for name in ["🔄 ATTENTION AGENT", "🧠 PSYCHOLOGY AGENT", "⚡ LIFECYCLE DETECTOR"]:
                yield {
                    "event": "agent_start",
                    "data": json.dumps({"agent": name, "message": f"Analysing {token_info['symbol']}...", "status": "scanning"})
                }
                await asyncio.sleep(0.2)

            client = get_openai_client()

            price_str = f"{token_info['price']:.8f}"
            liquidity_str = f"{token_info['liquidity']:,.0f}"
            holders_str = f"{token_info['holders']:,}"
            volume_str = f"{token_info['volume24h']:,.0f}"
            change_str = f"{token_info['priceChange24h']:.2f}"

            analysis_response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are SPECTRA Intelligence Agent. Provide attention analysis and market psychology for crypto tokens. Be specific and direct — this is for memecoin traders deciding whether to ape."
                    },
                    {
                        "role": "user",
                        "content": f"""Analyse this token for a memecoin trader:

Token: {token_info['symbol']} ({token_info['name']})
Chain: {token_info['chain'].upper()}
Price: ${price_str}
Liquidity: ${liquidity_str}
Holders: {holders_str}
24h Volume: ${volume_str}
24h Price Change: {change_str}%

SPECTRA Lifecycle Engine:
Stage: {result.stage.value} ({result.confidence}% confidence)
Velocity: {result.velocity_score} | Liquidity: {result.liquidity_score} | Maturity: {result.age_score}
Action: {result.trader_action}

Provide:
ATTENTION ANALYSIS — {token_info['symbol']}
Attention Phase: [EARLY/BUILDING/PEAKED/FADING]
Virality Score: [0-100]/100
Retail Awareness: [LOW/MEDIUM/HIGH]
Asymmetric Window: [OPEN/CLOSING/CLOSED]
Key Signal: [most important attention indicator]

MARKET PSYCHOLOGY — {token_info['symbol']}
Current State: [psychology state]
FOMO Level: [Building/Peaked/Absent]
Smart Money: [Accumulating/Holding/Exiting]
Next Likely Move: [specific prediction]"""
                    }
                ],
                max_tokens=400,
                temperature=0.3
            )

            analysis_text = analysis_response.choices[0].message.content.strip()
            yield {"event": "analysis_complete", "data": json.dumps({"results": analysis_text})}

            yield {
                "event": "agent_start",
                "data": json.dumps({"agent": "⚡ TRADE LOGIC", "message": "Calculating asymmetric opportunity...", "status": "synthesising"})
            }

            trade_response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are SPECTRA Trade Logic Agent. Generate specific actionable trade analysis for memecoin traders. Be direct. Tell them whether to ape or not."
                    },
                    {
                        "role": "user",
                        "content": f"""Generate SPECTRA trade logic for {token_info['symbol']} on {token_info['chain'].upper()}:

Token: {token_info['symbol']} | Price: ${price_str}
Liquidity: ${liquidity_str} | Holders: {holders_str}
24h Change: {change_str}%

Lifecycle Engine:
Stage: {result.stage.value} ({result.confidence}% confidence)
Action: {result.trader_action}
Velocity: {result.velocity_score} | Liquidity Score: {result.liquidity_score}

Analysis:
{analysis_text[:300]}

Output exactly this format:
OMEN TRADE ANALYSIS — {token_info['symbol']} ({token_info['chain'].upper()})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPPORTUNITY: [STRONG LONG/SPECULATIVE LONG/AVOID/SHORT SIGNAL]
Risk/Reward: 1:[X]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Entry Logic: [specific reasoning]
Position Size: [SMALL/MEDIUM/LARGE] — [why]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Invalidation: [specific signal]
Exit Signal: [specific trigger]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Viral Angle: "[one line that would make CT post about this]"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERDICT: [2-3 sentences — should they ape or not?]"""
                    }
                ],
                max_tokens=500,
                temperature=0.3
            )

            trade_text = trade_response.choices[0].message.content.strip()
            yield {"event": "trade_complete", "data": json.dumps({"output": trade_text})}
            yield {"event": "scan_complete", "data": json.dumps({"status": "complete", "token": token_info["symbol"]})}

        except Exception as e:
            yield {"event": "error", "data": json.dumps({"error": str(e)})}

    return EventSourceResponse(generate())


# ================================================================
# AGENT-TO-AGENT REST ENDPOINTS
# ================================================================

@app.get("/api/agents/whale-scan")
async def a2a_whale():
    return {"solana": get_solana_whale_movements(), "evm": scan_all_evm_chains()}

@app.get("/api/agents/airdrops")
async def a2a_airdrops():
    return {"data": get_airdrop_opportunities()}

@app.get("/api/agents/unlocks")
async def a2a_unlocks():
    return {"data": get_token_unlocks()}

@app.get("/api/agents/vc-funding")
async def a2a_vc():
    return {"data": get_recent_raises()}

@app.get("/api/agents/lifecycle/{token_address}")
async def a2a_lifecycle(token_address: str, chain: str = Query("auto")):
    try:
        detected = detect_chain_from_address(token_address) if chain == "auto" else chain
        is_solana = detected == "solana" or chain == "solana"

        if is_solana:
            raw = get_token_overview_raw(token_address)
            scores = scores_from_birdeye(raw)
            sym = raw.get("symbol", "UNKNOWN")
            ch = "solana"
        else:
            evm = chain if chain not in ["auto", "evm"] else "eth"
            raw = get_erc20_token_data(token_address, evm)
            scores = scores_from_moralis(raw)
            sym = raw.get("symbol", "UNKNOWN")
            ch = evm

        r = classify(scores["velocity_score"], scores["liquidity_score"], scores["age_score"], ch, sym)

        return {
            "token": sym, "chain": ch,
            "stage": r.stage.value, "confidence": r.confidence,
            "trader_action": r.trader_action, "description": r.description,
            "scores": scores
        }
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)