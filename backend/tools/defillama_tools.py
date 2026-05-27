"""
DeFiLlama + CoinGecko tools — all free, no extra API keys needed
"""

import httpx

BASE = "https://api.llama.fi"


def get_airdrop_opportunities() -> str:
    """Find DeFi protocols with high TVL but no token yet as potential airdrop candidates."""
    try:
        with httpx.Client(timeout=15) as c:
            protocols = c.get(f"{BASE}/protocols").json()

        candidates = sorted(
            [p for p in protocols if not p.get("symbol") and p.get("tvl", 0) > 10_000_000],
            key=lambda x: x["tvl"], reverse=True
        )[:6]

        if not candidates:
            return "No high-TVL no-token airdrop candidates found"

        result = "AIRDROP CANDIDATES — High TVL No Token:\n"
        for p in candidates:
            chains = ", ".join(p.get("chains", [])[:2])
            result += f"→ {p['name']} | TVL: ${p['tvl']:,.0f} | {chains}\n"
        return result
    except Exception as e:
        return f"Airdrop scan error: {e}"


def get_token_unlocks() -> str:
    """Find upcoming token unlock events with more than ten million dollars of potential supply."""
    try:
        with httpx.Client(timeout=15) as c:
            data = c.get("https://unlocks.llama.fi/unlocks").json()

        protocols = data if isinstance(data, list) else data.get("protocols", [])
        high_risk = []

        for p in protocols[:50]:
            for event in p.get("upcomingEvent", []):
                unlock_usd = event.get("noOfTokens", 0) * p.get("tokenPrice", 0)
                if unlock_usd > 10_000_000:
                    high_risk.append({
                        "name": p.get("name"),
                        "amount_usd": unlock_usd,
                        "date": event.get("date"),
                        "token": p.get("symbol")
                    })

        high_risk.sort(key=lambda x: x["amount_usd"], reverse=True)

        if not high_risk:
            return "No critical token unlocks in next 7 days"

        result = "UPCOMING TOKEN UNLOCKS:\n"
        for u in high_risk[:5]:
            result += f"→ ${u['token']} — ${u['amount_usd']:,.0f} | {u['date']}\n"
        return result
    except Exception as e:
        return f"Unlock scan error: {e}"


def get_recent_hacks() -> str:
    """Fetch recent DeFi hacks with protocol name, amount lost, and affected chain."""
    try:
        with httpx.Client(timeout=15) as c:
            hacks = c.get(f"{BASE}/hacks").json()

        recent = sorted(
            hacks if isinstance(hacks, list) else [],
            key=lambda x: x.get("date", 0), reverse=True
        )[:6]

        if not recent:
            return "No recent DeFi exploits detected"

        result = "RECENT DEFI EXPLOITS:\n"
        for h in recent:
            result += f"→ {h.get('name','?')} — ${h.get('amount',0):,.0f} lost | {h.get('chain','?')}\n"
        return result
    except Exception as e:
        return f"Hack monitor error: {e}"


def get_recent_raises() -> str:
    """Fetch recent crypto funding raises and group large rounds by sector and lead investors."""
    urls = ["https://api.llama.fi/raises", "https://defillama.com/api/raises"]
    for url in urls:
        try:
            with httpx.Client(timeout=15) as c:
                response = c.get(url)
            if not response.content:
                continue
            data = response.json()
            raises = data.get("raises", []) if isinstance(data, dict) else data
            if not raises:
                continue

            significant = [
                r for r in sorted(raises, key=lambda x: x.get("date", 0), reverse=True)[:50]
                if r.get("amount", 0) > 2_000_000
            ][:8]

            sectors = {}
            for r in significant:
                cat = r.get("category", "Other")
                sectors.setdefault(cat, []).append(r)

            result = "VC FUNDING ROUNDS:\n"
            for sector, rs in sectors.items():
                total = sum(r.get("amount", 0) for r in rs)
                vcs = list(set(v for r in rs for v in r.get("leadInvestors", [])))[:2]
                result += f"→ {sector}: {len(rs)} deals | ${total:,.0f}"
                if vcs:
                    result += f" | {', '.join(vcs)}"
                result += "\n"
            return result
        except Exception:
            continue
    return "VC funding data temporarily unavailable"


def get_defi_market_overview() -> str:
    """Get overall DeFi market TVL and top chains for market context."""
    try:
        with httpx.Client(timeout=15) as c:
            chains_data = c.get(f"{BASE}/v2/chains").json()

        if not chains_data:
            return "DeFi market data unavailable"

        top_chains = sorted(chains_data, key=lambda x: x.get("tvl", 0), reverse=True)[:5]
        total_tvl = sum(c.get("tvl", 0) for c in chains_data)

        result = f"DEFI MARKET OVERVIEW:\n"
        result += f"→ Total DeFi TVL: ${total_tvl:,.0f}\n"
        result += "→ Top chains: "
        result += ", ".join([
            f"{c.get('name','?')} (${c.get('tvl',0)/1e9:.1f}B)"
            for c in top_chains[:4]
        ])
        result += "\n"
        return result
    except Exception as e:
        return f"Market overview unavailable: {e}"


def get_trending_and_market() -> str:
    """Get trending tokens and market data from CoinGecko — free, no key needed."""
    try:
        with httpx.Client(timeout=15) as c:
            trending_resp = c.get("https://api.coingecko.com/api/v3/search/trending")
            global_resp = c.get("https://api.coingecko.com/api/v3/global")

        trending = trending_resp.json()
        global_data = global_resp.json().get("data", {})

        total_mcap = global_data.get("total_market_cap", {}).get("usd", 0)
        mcap_change = global_data.get("market_cap_change_percentage_24h_usd", 0)
        btc_dom = global_data.get("market_cap_percentage", {}).get("btc", 0)
        eth_dom = global_data.get("market_cap_percentage", {}).get("eth", 0)

        coins = trending.get("coins", [])[:8]
        coin_names = [c.get("item", {}).get("symbol", "?").upper() for c in coins]

        result = "MARKET INTELLIGENCE:\n"
        result += f"→ Total crypto market cap: ${total_mcap/1e12:.2f}T ({mcap_change:+.1f}% 24h)\n"
        result += f"→ BTC dominance: {btc_dom:.1f}% | ETH: {eth_dom:.1f}%\n"
        if coin_names:
            result += f"→ Trending right now: {', '.join(coin_names)}\n"

        # Also get top gainers from CoinGecko
        try:
            with httpx.Client(timeout=10) as c:
                gainers_resp = c.get(
                    "https://api.coingecko.com/api/v3/coins/markets",
                    params={
                        "vs_currency": "usd",
                        "order": "percent_change_24h_desc",
                        "per_page": 5,
                        "page": 1,
                        "sparkline": False,
                        "price_change_percentage": "24h"
                    }
                )
                gainers = gainers_resp.json()

            if gainers and isinstance(gainers, list):
                result += "→ Top 24h gainers: "
                gainer_strs = []
                for g in gainers[:4]:
                    sym = g.get("symbol", "?").upper()
                    chg = g.get("price_change_percentage_24h", 0) or 0
                    gainer_strs.append(f"{sym} +{chg:.1f}%")
                result += ", ".join(gainer_strs) + "\n"
        except Exception:
            pass

        return result
    except Exception as e:
        return f"Market data unavailable: {e}"


def get_defi_protocol_momentum() -> str:
    """Get DeFi protocols gaining TVL — narrative detection signal."""
    try:
        with httpx.Client(timeout=15) as c:
            protocols = c.get(f"{BASE}/protocols").json()

        active = [
            p for p in protocols
            if p.get("tvl", 0) > 1_000_000 and p.get("change_1d") is not None
        ]

        gainers = sorted(
            [p for p in active if (p.get("change_1d") or 0) > 2],
            key=lambda x: x.get("change_1d", 0), reverse=True
        )[:5]

        if not gainers:
            return "No significant protocol TVL momentum detected"

        result = "PROTOCOL MOMENTUM (24h TVL):\n"
        for p in gainers:
            change = p.get("change_1d", 0)
            result += f"→ {p.get('name','?')} +{change:.1f}% | TVL: ${p.get('tvl',0):,.0f}\n"
        return result
    except Exception as e:
        return f"Protocol momentum error: {e}"