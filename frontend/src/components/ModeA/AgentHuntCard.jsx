const F = "'Inter', system-ui, sans-serif"

export default function AgentHuntCard({ agent, state }) {
  const { status, msgs = [] } = state
  const isScanning = status === "scanning"
  const isDone = status === "complete"

  return (
    <div style={{
      background: isScanning ? `${agent.color}08` : "rgba(255,255,255,0.02)",
      border: `1px solid ${isScanning ? agent.color+"50" : isDone ? agent.color+"30" : "rgba(255,255,255,0.08)"}`,
      borderRadius: "12px", padding: "16px",
      transition: "all 0.3s", fontFamily: F,
      position: "relative", overflow: "hidden"
    }}>
      {isScanning && (
        <div style={{
          position: "absolute", top: 0, left: 0, height: "100%", width: "40%",
          background: `linear-gradient(90deg,transparent,${agent.color}08,transparent)`,
          animation: "scanline 2s linear infinite"
        }} />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
        <span style={{ fontSize: "22px" }}>{agent.icon}</span>
        <div>
          <div style={{
            fontSize: "14px", fontWeight: 700, letterSpacing: "0.04em",
            color: isScanning || isDone ? agent.color : "rgba(255,255,255,0.5)"
          }}>
            {agent.name}
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>
            {agent.sub}
          </div>
        </div>
        <div style={{
          marginLeft: "auto", width: "8px", height: "8px", borderRadius: "50%",
          background: isScanning ? agent.color : isDone ? agent.color : "rgba(255,255,255,0.12)",
          animation: isScanning ? "agpulse 0.8s infinite" : "none"
        }} />
      </div>

      <div style={{ minHeight: "48px", display: "flex", flexDirection: "column", gap: "5px" }}>
        {msgs.length > 0 ? msgs.map((m, i) => (
          <div key={i} style={{
            fontSize: "13px", color: "rgba(255,255,255,0.5)",
            display: "flex", gap: "8px"
          }}>
            <span style={{ color: agent.color, fontWeight: 700, flexShrink: 0 }}>→</span>
            <span>{m}</span>
          </div>
        )) : (
          <div style={{
            fontSize: "13px",
            color: isScanning ? agent.color + "80" : "rgba(255,255,255,0.2)"
          }}>
            {isScanning ? "Initialising..." : isDone ? "✓ Complete" : "Awaiting scan..."}
          </div>
        )}
      </div>

      <style>{`
        @keyframes scanline{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}
        @keyframes agpulse{0%,100%{opacity:1}50%{opacity:0.3}}
      `}</style>
    </div>
  )
}