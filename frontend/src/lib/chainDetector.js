export const detectChain = (addr) =>
  addr.trim().startsWith("0x") && addr.trim().length === 42 ? "evm" : "solana";

export const CHAIN_OPTIONS = [
  { value: "auto", label: "⚡ Auto-detect" },
  { value: "solana", label: "◎ Solana" },
  { value: "eth", label: "Ξ Ethereum" },
  { value: "bsc", label: "⬡ BNB Chain" },
  { value: "base", label: "🔵 Base" },
  { value: "arbitrum", label: "🔷 Arbitrum" },
];

export const CHAIN_COLORS = {
  solana: "#9945FF",
  eth: "#627EEA",
  bsc: "#F3BA2F",
  base: "#0052FF",
  arbitrum: "#28A0F0",
  auto: "#06b6d4",
};
