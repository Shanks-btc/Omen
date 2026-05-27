import os

import httpx


BASE = "https://deep-index.moralis.io/api/v2.2"
CHAIN_MAP = {
    "eth": "eth",
    "ethereum": "eth",
    "bnb": "bsc",
    "bsc": "bsc",
    "base": "base",
    "arbitrum": "arbitrum",
}


def _headers() -> dict:
    """Build Moralis API headers for authenticated EVM requests."""
    return {
        "X-API-Key": os.getenv("MORALIS_API_KEY", ""),
        "accept": "application/json",
    }


def get_erc20_token_data(addr: str, chain: str = "eth") -> dict:
    """Fetch EVM ERC-20 token price, transfers, liquidity, holders, and holder change data."""
    chain_id = CHAIN_MAP.get(chain.lower(), "eth")
    result = {
        "chain": chain_id,
        "symbol": "UNKNOWN",
        "name": "Unknown",
        "price_usd": 0,
        "transfers_24h": 0,
        "liquidity_usd": 0,
        "total_holders": 0,
        "holder_change_24h": 0,
    }

    try:
        with httpx.Client(timeout=10) as client:
            response = client.get(
                f"{BASE}/erc20/{addr}/price",
                headers=_headers(),
                params={"chain": chain_id},
            )
            data = response.json()
        result["price_usd"] = float(data.get("usdPrice", 0) or 0)
        result["symbol"] = data.get("tokenSymbol") or result["symbol"]
        result["name"] = data.get("tokenName") or result["name"]
    except Exception:
        pass

    try:
        with httpx.Client(timeout=10) as client:
            response = client.get(
                f"{BASE}/erc20/{addr}/stats",
                headers=_headers(),
                params={"chain": chain_id},
            )
            data = response.json()
        result["transfers_24h"] = data.get("transfers", {}).get("total", 0) or 0
        result["liquidity_usd"] = float(data.get("liquidity", 0) or 0)
    except Exception:
        pass

    try:
        with httpx.Client(timeout=10) as client:
            response = client.get(
                f"{BASE}/erc20/{addr}/holders",
                headers=_headers(),
                params={"chain": chain_id},
            )
            data = response.json()
        result["total_holders"] = data.get("totalHolders", 0) or 0
        result["holder_change_24h"] = (
            data.get("holderChange", {}).get("24h", {}).get("change", 0) or 0
        )
    except Exception:
        pass

    return result


def get_erc20_token_summary(addr: str, chain: str = "eth") -> str:
    """Get a formatted EVM ERC-20 token summary for price, transfers, liquidity, and holders."""
    data = get_erc20_token_data(addr, chain)
    return (
        f"TOKEN: {data['symbol']} ({data['chain'].upper()})\n"
        f"Price: ${data['price_usd']:.8f}\n"
        f"24h Transfers: {data['transfers_24h']:,}\n"
        f"Liquidity: ${data['liquidity_usd']:,.0f}\n"
        f"Holders: {data['total_holders']:,}\n"
        f"Holder Change 24h: {data['holder_change_24h']:+,}"
    )


def get_evm_whale_movements(chain: str = "eth") -> str:
    """Scan one EVM chain for large ERC-20 transfers that may indicate whale movement."""
    chain_id = CHAIN_MAP.get(chain.lower(), "eth")

    try:
        with httpx.Client(timeout=15) as client:
            response = client.get(
                f"{BASE}/erc20/transfers",
                headers=_headers(),
                params={"chain": chain_id, "limit": 20, "order": "DESC"},
            )
            transfers = response.json().get("result", [])

        large_transfers = [
            transfer
            for transfer in transfers
            if float(transfer.get("value_decimal", 0) or 0) > 50000
        ]

        if not large_transfers:
            return f"No whale moves >$50K on {chain.upper()}"

        output = f"WHALE SCAN - {chain.upper()}:\n"
        for transfer in large_transfers[:5]:
            symbol = transfer.get("token_symbol", "?")
            value = float(transfer.get("value_decimal", 0) or 0)
            output += f"{symbol}: ${value:,.0f}\n"
        return output.strip()
    except Exception as exc:
        return f"{chain.upper()} scan error: {exc}"


def scan_all_evm_chains() -> str:
    """Scan whale movements across Ethereum, BNB, Base, and Arbitrum chains."""
    return "\n\n".join(
        get_evm_whale_movements(chain)
        for chain in ["eth", "bsc", "base", "arbitrum"]
    )
