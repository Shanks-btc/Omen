from dataclasses import dataclass
from enum import Enum


class LifecycleStage(str, Enum):
    SEEDING = "SEEDING"
    IGNITION = "IGNITION"
    PEAK = "PEAK"
    DISTRIBUTION = "DISTRIBUTION"
    DEAD = "DEAD"


STAGE_CONFIG = {
    "SEEDING": {
        "color": "#22c55e",
        "bias": "ACCUMULATION BIAS",
        "action": "MONITOR - wait for ignition",
    },
    "IGNITION": {
        "color": "#06b6d4",
        "bias": "ENTRY BIAS",
        "action": "OPTIMAL ENTRY - ignition confirmed",
    },
    "PEAK": {
        "color": "#ef4444",
        "bias": "EXIT BIAS",
        "action": "TAKE PROFIT / EXIT",
    },
    "DISTRIBUTION": {
        "color": "#f97316",
        "bias": "AVOID BIAS",
        "action": "AVOID ENTRY - distribution",
    },
    "DEAD": {
        "color": "#6b7280",
        "bias": "DEAD BIAS",
        "action": "IGNORE - no edge",
    },
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
    tx_velocity_pct: float
    liquidity_depth_pct: float
    optimal_entry_window: str
    slippage_recommendation: str
    short_signal: float
    mid_signal: float
    long_signal: float
    social_decay_pct: float


def _safe_float(value, default=0.0) -> float:
    """Safely convert any value to float — handles None, strings, empty strings"""
    try:
        if value is None or value == "" or value == "null":
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def classify(
    velocity_score: float,
    liquidity_score: float,
    age_score: float,
    chain: str = "unknown",
    token_symbol: str = "UNKNOWN",
) -> EngineResult:
    # Ensure all scores are proper floats
    velocity_score = _safe_float(velocity_score)
    liquidity_score = _safe_float(liquidity_score)
    age_score = _safe_float(age_score)

    confidence = min(95.0, 60.0 + velocity_score * 20.0 + liquidity_score * 20.0)

    if velocity_score < 0.05 and liquidity_score < 0.1:
        stage = LifecycleStage.DEAD
        description = "Zero meaningful on-chain activity."
        trader_action = "IGNORE - no edge"
        visual_signature = "Gray flatline"
    elif 0.3 < velocity_score < 0.6 and liquidity_score > 0.4 and age_score < 0.4:
        stage = LifecycleStage.DISTRIBUTION
        description = "Selling pressure building while liquidity exits."
        trader_action = "AVOID ENTRY - distribution"
        visual_signature = "Orange decay wave"
    elif velocity_score > 0.7 and liquidity_score > 0.6:
        stage = LifecycleStage.PEAK
        description = "Maximum velocity with deep liquidity."
        trader_action = "TAKE PROFIT / EXIT"
        visual_signature = "Red clipped distortion"
    elif 0.2 < velocity_score < 0.7 and liquidity_score > 0.2 and age_score > 0.3:
        stage = LifecycleStage.IGNITION
        description = "Building pressure with accumulating liquidity."
        trader_action = "OPTIMAL ENTRY - ignition confirmed"
        visual_signature = "Cyan sawtooth building"
    else:
        stage = LifecycleStage.SEEDING
        description = "Low velocity and thin liquidity."
        trader_action = "MONITOR - wait for ignition"
        visual_signature = "Green low-amplitude tremor"

    tx_velocity_pct = round(velocity_score * 100, 1)
    liquidity_depth_pct = round(liquidity_score * 100, 1)

    if velocity_score > 0.6:
        optimal_entry_window = "12:00 - 14:00 UTC"
    elif velocity_score > 0.3:
        optimal_entry_window = "10:00 - 16:00 UTC"
    else:
        optimal_entry_window = "08:00 - 20:00 UTC"

    if liquidity_score < 0.1:
        slippage_recommendation = "10-15%"
    elif liquidity_score < 0.3:
        slippage_recommendation = "5-8%"
    elif liquidity_score < 0.6:
        slippage_recommendation = "3-5%"
    else:
        slippage_recommendation = "1-2%"

    short_multiplier = 1.2 if stage == LifecycleStage.IGNITION else 0.8
    long_multiplier = 0.6 if stage in (LifecycleStage.PEAK, LifecycleStage.DISTRIBUTION) else 1.0

    short_signal = min(100, round(velocity_score * 100 * short_multiplier, 1))
    mid_signal = min(100, round(liquidity_score * 100, 1))
    long_signal = min(100, round(age_score * 100 * long_multiplier, 1))
    social_decay_pct = min(100, round((1 - age_score) * 60 + velocity_score * 20, 1))

    return EngineResult(
        stage=stage,
        confidence=round(confidence, 1),
        velocity_score=round(velocity_score, 4),
        liquidity_score=round(liquidity_score, 4),
        age_score=round(age_score, 4),
        description=description,
        trader_action=trader_action,
        visual_signature=visual_signature,
        chain=chain,
        token_symbol=token_symbol,
        tx_velocity_pct=tx_velocity_pct,
        liquidity_depth_pct=liquidity_depth_pct,
        optimal_entry_window=optimal_entry_window,
        slippage_recommendation=slippage_recommendation,
        short_signal=short_signal,
        mid_signal=mid_signal,
        long_signal=long_signal,
        social_decay_pct=social_decay_pct,
    )


def scores_from_moralis(data: dict) -> dict:
    """Convert Moralis API data to Lifecycle Engine scores (EVM chains)
    Uses safe float conversion to handle None and string values from Moralis API"""
    transfers = _safe_float(data.get("transfers_24h", 0))
    liquidity = _safe_float(data.get("liquidity_usd", 0))
    holders = _safe_float(data.get("total_holders", 0))

    velocity = min(1.0, transfers / 43200)
    liq = min(1.0, liquidity / 1_000_000)
    age = min(1.0, holders / 10000)

    return {
        "velocity_score": round(velocity, 4),
        "liquidity_score": round(liq, 4),
        "age_score": round(age, 4),
    }


def scores_from_birdeye(data: dict) -> dict:
    """Convert Birdeye API data to Lifecycle Engine scores (Solana)"""
    trade24h = _safe_float(data.get("trade24h", 0))
    liquidity = _safe_float(data.get("liquidity", 0))
    holder = _safe_float(data.get("holder", 0))

    velocity = min(1.0, trade24h / 43200)
    liq = min(1.0, liquidity / 1_000_000)
    age = min(1.0, holder / 10000)

    return {
        "velocity_score": round(velocity, 4),
        "liquidity_score": round(liq, 4),
        "age_score": round(age, 4),
    }


def detect_chain_from_address(address: str) -> str:
    """Auto-detect chain from address format.
    EVM: starts with 0x and is 42 chars. Everything else: Solana."""
    normalized = address.strip()
    return "evm" if normalized.startswith("0x") and len(normalized) == 42 else "solana"