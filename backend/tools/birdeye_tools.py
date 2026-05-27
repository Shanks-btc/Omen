import os

import httpx


BIRDEYE_BASE = "https://public-api.birdeye.so"


def _headers() -> dict:
    """Build Birdeye API headers for authenticated Solana requests."""
    return {
        "X-API-KEY": os.getenv("BIRDEYE_API_KEY", ""),
        "x-chain": "solana",
    }


def get_token_overview_raw(addr: str) -> dict:
    """Fetch raw Birdeye Solana token overview data for a token address."""
    try:
        with httpx.Client(timeout=10) as client:
            response = client.get(
                f"{BIRDEYE_BASE}/defi/token_overview",
                headers=_headers(),
                params={"address": addr},
            )
            data = response.json()
        return data.get("data", {}) if data.get("success") else {}
    except Exception:
        return {}


def get_token_overview(addr: str) -> str:
    """Get full Solana token overview including price, volume, liquidity, trades, and holders."""
    data = get_token_overview_raw(addr)
    if not data:
        return f"Token not found: {addr}"

    return (
        f"TOKEN: {data.get('symbol', '?')} (SOLANA)\n"
        f"Price: ${data.get('price', 0):.8f}\n"
        f"24h Volume: ${data.get('v24hUSD', 0):,.0f}\n"
        f"Liquidity: ${data.get('liquidity', 0):,.0f}\n"
        f"24h Trades: {data.get('trade24h', 0):,}\n"
        f"Holders: {data.get('holder', 0):,}\n"
        f"24h Change: {data.get('priceChange24hPercent', 0):.2f}%"
    )


def get_token_security(addr: str) -> str:
    """Get Solana token security details including top holders, creator share, and metadata status."""
    try:
        with httpx.Client(timeout=10) as client:
            response = client.get(
                f"{BIRDEYE_BASE}/defi/token_security",
                headers=_headers(),
                params={"address": addr},
            )
            data = response.json().get("data", {})

        return (
            "SECURITY:\n"
            f"Top 10 holders: {data.get('top10HolderPercent', 0):.1f}%\n"
            f"Creator: {data.get('creatorPercentage', 0):.1f}%\n"
            f"Mutable metadata: {data.get('mutableMetadata', False)}"
        )
    except Exception:
        return "Security data unavailable"


def get_top_traders(addr: str) -> str:
    """Get top Solana token traders over the last 24 hours with PnL, volume, and side bias."""
    try:
        with httpx.Client(timeout=10) as client:
            response = client.get(
                f"{BIRDEYE_BASE}/defi/v2/tokens/top_traders",
                headers=_headers(),
                params={"address": addr, "time_frame": "24h", "limit": 5},
            )
            items = response.json().get("data", {}).get("items", [])

        if not items:
            return "No significant trader activity"

        output = "TOP TRADERS (24h):\n"
        for index, trader in enumerate(items, 1):
            side = "BUY" if trader.get("buy", 0) > trader.get("sell", 0) else "SELL"
            output += (
                f"{index}. PnL: ${trader.get('pnl', 0):,.0f} "
                f"Vol: ${trader.get('volume', 0):,.0f} {side}\n"
            )
        return output.strip()
    except Exception:
        return "Trader data error"


def get_solana_whale_movements() -> str:
    """Scan Solana token markets for unusual high-volume whale movement signals."""
    try:
        with httpx.Client(timeout=15) as client:
            response = client.get(
                f"{BIRDEYE_BASE}/defi/tokenlist",
                headers=_headers(),
                params={
                    "sort_by": "v24hUSD",
                    "sort_type": "desc",
                    "offset": 0,
                    "limit": 20,
                    "min_liquidity": 100000,
                },
            )
            tokens = response.json().get("data", {}).get("tokens", [])

        findings = []
        for token in tokens[:5]:
            change = token.get("v24hChangePercent", 0) or 0
            if abs(change) > 50:
                direction = "SURGE" if change > 0 else "DUMP"
                findings.append(
                    f"{token.get('symbol', '?')}: Volume {direction} "
                    f"{change:+.0f}% | ${token.get('v24hUSD', 0):,.0f}"
                )

        if not findings:
            return "No major Solana whale activity"

        return "SOLANA WHALE SCAN:\n" + "\n".join(findings)
    except Exception as exc:
        return f"Solana scan error: {exc}"
