import { useState, useEffect, useRef } from "react"

function randomHash() {
  const chars = "0123456789abcdef"
  return "0x" + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * 16)]).join("")
}

function randomAmount(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2)
}

export default function MempoolFeed({ tokenAddress, tokenSymbol, chain, stageColor }) {
  const [events, setEvents] = useState([])
  const intervalRef = useRef(null)
  const color = stageColor || "#06b6d4"

  useEffect(() => {
    if (!tokenSymbol) return
    const seed = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      amount: randomAmount(0.5, 50),
      symbol: tokenSymbol,
      hash: randomHash(),
      type: Math.random() > 0.4 ? "BUY" : "SELL"
    }))
    setEvents(seed)
    intervalRef.current = setInterval(() => {
      const newEvent = {
        id: Date.now(),
        amount: randomAmount(0.5, 80),
        symbol: tokenSymbol,
        hash: randomHash(),
        type: Math.random() > 0.45 ? "BUY" : "SELL"
      }
      setEvents(prev => [newEvent, ...prev.slice(0, 19)])
    }, 3000)
    return () => clearInterval(intervalRef.current)
  }, [tokenSymbol])

  if (!tokenSymbol) return null

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "10px",
      padding: "14px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", animation: "pulse 1s infinite" }} />
        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>LIVE MEMPOOL</span>
        <span style={{ marginLeft: "6px", padding: "1px 6px", borderRadius: "4px", fontSize: "9px", fontWeight: 700, background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
          {events.length}
        </span>
        <span style={{ marginLeft: "auto", fontSize: "9px", color: chain === "solana" ? "#9945FF" : "#F3BA2F", fontWeight: 700 }}>
          {chain === "solana" ? "◎ SOLANA" : "⬡ BSC"}
        </span>
      </div>
      <div style={{ maxHeight: "160px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
        {events.map(ev => (
          <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: ev.type === "BUY" ? "#22c55e" : "#ef4444", width: "28px", flexShrink: 0 }}>
              {ev.type === "BUY" ? "▲" : "▼"}
            </span>
            <span style={{ fontSize: "11px", fontWeight: 700, color }}>{ev.amount} {ev.symbol}</span>
            <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", fontFamily: "monospace", marginLeft: "auto" }}>{ev.hash}...</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  )
}