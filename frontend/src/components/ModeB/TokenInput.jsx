import { useState } from "react"

const CHAIN_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "solana", label: "◎ Solana" },
  { value: "bsc", label: "⬡ BSC" },
  { value: "eth", label: "Ξ ETH" },
  { value: "base", label: "🔵 Base" },
]

const BSC_TOKENS = [
  { symbol: "BABYDOGE", addr: "0xc748673057861a797275CD8A068AbB95A902e8de", chain: "bsc" },
  { symbol: "FLOKI", addr: "0xfb5B838b6cfEEdC2873aB27866079AC55363D37", chain: "bsc" },
  { symbol: "PEPE", addr: "0x6982508145454Ce325dDbE47a25d4ec3d2311933", chain: "eth" },
  { symbol: "TURBO", addr: "0xA35923162C49cF95e6BF26623385eb431ad920D3", chain: "eth" },
]

const SOL_TOKENS = [
  { symbol: "WIF", addr: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", chain: "solana" },
  { symbol: "BONK", addr: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", chain: "solana" },
  { symbol: "POPCAT", addr: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr", chain: "solana" },
  { symbol: "JUP", addr: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", chain: "solana" },
]

function detectChain(addr) {
  return addr.trim().startsWith("0x") && addr.trim().length === 42 ? "evm" : "solana"
}

export default function TokenInput({ onScan, scanning }) {
  const [addr, setAddr] = useState("")
  const [chain, setChain] = useState("auto")
  const [detected, setDetected] = useState(null)

  const onChange = v => {
    setAddr(v)
    setDetected(v.length > 10 ? detectChain(v) : null)
  }

  const handleQuick = t => {
    setAddr(t.addr)
    setChain(t.chain)
    setDetected(t.chain === "solana" ? "solana" : "evm")
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {CHAIN_OPTIONS.map(o => (
          <button key={o.value} onClick={() => setChain(o.value)} style={{
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            fontFamily: "'Inter', system-ui, sans-serif",
            border: chain === o.value ? "1.5px solid rgba(6,182,212,0.5)" : "1px solid rgba(255,255,255,0.12)",
            color: chain === o.value ? "#06b6d4" : "rgba(255,255,255,0.45)",
            background: chain === o.value ? "rgba(6,182,212,0.1)" : "transparent",
            cursor: "pointer", transition: "all 0.15s"
          }}>
            {o.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <input
            value={addr}
            onChange={e => onChange(e.target.value)}
            disabled={scanning}
            placeholder="Paste contract address — Solana or BSC/ETH..."
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "12px",
              padding: "14px 18px",
              paddingRight: detected ? "90px" : "18px",
              fontFamily: "monospace",
              fontSize: "14px",
              color: "#fff",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
          {detected && (
            <span style={{
              position: "absolute", right: "12px", top: "50%",
              transform: "translateY(-50%)",
              background: detected === "solana" ? "rgba(153,69,255,0.2)" : "rgba(243,186,47,0.2)",
              color: detected === "solana" ? "#9945FF" : "#F3BA2F",
              padding: "3px 10px", borderRadius: "6px",
              fontSize: "12px", fontWeight: 700
            }}>
              {detected === "solana" ? "◎ SOL" : "⬡ BSC"}
            </span>
          )}
        </div>
        <button
          onClick={() => addr.trim() && onScan(addr.trim(), chain)}
          disabled={scanning || !addr.trim()}
          style={{
            padding: "14px 24px",
            background: scanning || !addr.trim() ? "rgba(6,182,212,0.08)" : "rgba(6,182,212,0.2)",
            color: scanning || !addr.trim() ? "rgba(6,182,212,0.35)" : "#06b6d4",
            border: `1.5px solid ${scanning || !addr.trim() ? "rgba(6,182,212,0.15)" : "rgba(6,182,212,0.5)"}`,
            borderRadius: "12px", fontSize: "14px", fontWeight: 700,
            cursor: scanning || !addr.trim() ? "not-allowed" : "pointer",
            fontFamily: "'Inter', system-ui, sans-serif",
            whiteSpace: "nowrap", letterSpacing: "0.04em"
          }}
        >
          {scanning ? "SCANNING..." : "SCAN"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", color: "#F3BA2F", fontWeight: 700, minWidth: "32px" }}>BSC</span>
          {BSC_TOKENS.map(t => (
            <button key={t.symbol} onClick={() => handleQuick(t)} style={{
              fontSize: "13px", fontWeight: 600,
              color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(243,186,47,0.25)",
              padding: "6px 14px", borderRadius: "8px",
              background: "rgba(243,186,47,0.06)",
              cursor: "pointer", fontFamily: "'Inter', system-ui, sans-serif"
            }}>
              {t.symbol}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", color: "#9945FF", fontWeight: 700, minWidth: "32px" }}>SOL</span>
          {SOL_TOKENS.map(t => (
            <button key={t.symbol} onClick={() => handleQuick(t)} style={{
              fontSize: "13px", fontWeight: 600,
              color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(153,69,255,0.25)",
              padding: "6px 14px", borderRadius: "8px",
              background: "rgba(153,69,255,0.06)",
              cursor: "pointer", fontFamily: "'Inter', system-ui, sans-serif"
            }}>
              {t.symbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}