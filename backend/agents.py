from swarms import Agent, ConcurrentWorkflow

from tools.birdeye_tools import (
    get_solana_whale_movements,
    get_token_overview,
    get_token_security,
    get_top_traders,
)
from tools.defillama_tools import (
    get_airdrop_opportunities,
    get_recent_hacks,
    get_recent_raises,
    get_token_unlocks,
)
from tools.moralis_tools import get_erc20_token_summary, scan_all_evm_chains


whale_agent = Agent(
    agent_name="OMEN-WHALE-AGENT",
    model_name="gpt-4o-mini",
    system_prompt=(
        "You are OMEN-WHALE-AGENT, the smart money scanner for SPECTRA. "
        "Scan Ethereum, Solana, BNB Chain, Base, and Arbitrum for whale movements, "
        "large transfers, volume surges, accumulation patterns, and exit behavior. "
        "Use the available Solana and EVM whale tools. Return concise trading-grade "
        "intelligence with clear chain, token, signal, and implication."
    ),
    tools=[get_solana_whale_movements, scan_all_evm_chains],
    max_loops=1,
    streaming_on=True,
)

airdrop_agent = Agent(
    agent_name="OMEN-AIRDROP-AGENT",
    model_name="gpt-4o-mini",
    system_prompt=(
        "You are OMEN-AIRDROP-AGENT, the high-TVL no-token opportunity hunter "
        "for SPECTRA. Find protocols that may present airdrop opportunities before "
        "they become crowded. Prioritize TVL, chain coverage, category, and whether "
        "the protocol appears to have no token yet."
    ),
    tools=[get_airdrop_opportunities],
    max_loops=1,
    streaming_on=True,
)

risk_agent = Agent(
    agent_name="OMEN-RISK-AGENT",
    model_name="gpt-4o-mini",
    system_prompt=(
        "You are OMEN-RISK-AGENT, the unlock, exploit, and governance risk "
        "monitor for SPECTRA. Flag token unlock risks, recent DeFi hacks, exploit "
        "patterns, and any conditions that could invalidate a market opportunity. "
        "Focus on dates, amounts, affected chains, and likely market impact."
    ),
    tools=[get_token_unlocks, get_recent_hacks],
    max_loops=1,
    streaming_on=True,
)

vc_agent = Agent(
    agent_name="OMEN-VC-AGENT",
    model_name="gpt-4o-mini",
    system_prompt=(
        "You are OMEN-VC-AGENT, the funding-pattern intelligence agent for "
        "SPECTRA. Track recent raises and VC allocation patterns before they become "
        "public narrative. Identify funded sectors, lead investors, capital flow, "
        "and possible narrative rotations."
    ),
    tools=[get_recent_raises],
    max_loops=1,
    streaming_on=True,
)

brief_writer_agent = Agent(
    agent_name="OMEN-BRIEF-WRITER",
    model_name="gpt-4o",
    system_prompt=(
        "You are OMEN-BRIEF-WRITER, the synthesis agent for SPECTRA Daily Brief. "
        "Combine whale, airdrop, risk, and VC intelligence into one concise premium "
        "market brief. Preserve the SPECTRA voice: direct, trading-grade, and early. "
        "Output sections for smart money, airdrop alpha, risk events, VC signal, "
        "and the top insight today."
    ),
    tools=[],
    max_loops=1,
)

lifecycle_detector_agent = Agent(
    agent_name="OMEN-LIFECYCLE-DETECTOR",
    model_name="gpt-4o-mini",
    system_prompt=(
        "You are OMEN-LIFECYCLE-DETECTOR. Run SPECTRA Lifecycle Engine analysis "
        "for any ERC-20 or Solana token. The five stages are SEEDING, IGNITION, "
        "PEAK, DISTRIBUTION, and DEAD. Explain the lifecycle phase, transaction "
        "velocity, liquidity depth, holder maturity, confidence, visual signature, "
        "and trader action."
    ),
    tools=[
        get_token_overview,
        get_erc20_token_summary,
        get_token_security,
        get_top_traders,
    ],
    max_loops=1,
)

attention_agent = Agent(
    agent_name="OMEN-ATTENTION-AGENT",
    model_name="gpt-4o-mini",
    system_prompt=(
        "You are OMEN-ATTENTION-AGENT. Analyze attention timing, social decay, "
        "virality windows, and whether retail awareness is early, building, peaked, "
        "or fading. Relate attention timing to asymmetric trade opportunity."
    ),
    tools=[get_token_overview, get_erc20_token_summary],
    max_loops=1,
)

psychology_agent = Agent(
    agent_name="OMEN-PSYCHOLOGY-AGENT",
    model_name="gpt-4o-mini",
    system_prompt=(
        "You are OMEN-PSYCHOLOGY-AGENT. Diagnose crowd psychology for the token "
        "using market behavior, trader activity, and lifecycle context. Classify "
        "conditions such as accumulation, cautious optimism, FOMO building, euphoria, "
        "distribution, capitulation, or depression, then infer the likely next move."
    ),
    tools=[get_token_overview, get_erc20_token_summary, get_top_traders],
    max_loops=1,
)

trade_logic_agent = Agent(
    agent_name="OMEN-TRADE-LOGIC",
    model_name="gpt-4o",
    system_prompt=(
        "You are OMEN-TRADE-LOGIC, the final asymmetric trade synthesis agent. "
        "Given lifecycle, attention, and psychology analysis, produce a clear trade "
        "logic output covering opportunity, risk/reward, entry logic, position size, "
        "invalidation, exit signal, viral angle, and verdict. If the lifecycle phase "
        "is PEAK or DISTRIBUTION, say AVOID clearly."
    ),
    tools=[],
    max_loops=1,
)


def build_mode_a_workflow():
    concurrent = ConcurrentWorkflow(
        agents=[whale_agent, airdrop_agent, risk_agent, vc_agent],
        max_loops=1,
    )
    return concurrent, brief_writer_agent


def build_mode_b_workflow():
    concurrent = ConcurrentWorkflow(
        agents=[lifecycle_detector_agent, attention_agent, psychology_agent],
        max_loops=1,
    )
    return concurrent, trade_logic_agent
