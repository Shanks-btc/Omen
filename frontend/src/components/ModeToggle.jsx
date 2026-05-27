export default function ModeToggle({ active, setActive }) {
  return (
    <div style={{
      display: "flex",
      gap: "10px",
      padding: "14px 24px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      background: "#0d0d12",
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      {[
        { id: "B", icon: "🔬", label: "OMEN SCAN", sub: "Scan any token before you ape", color: "#06b6d4" },
        { id: "A", icon: "📡", label: "MARKET BRIEF", sub: "Daily intelligence brief", color: "#a855f7" },
      ].map(m => (
        <button
          key={m.id}
          onClick={() => setActive(m.id)}
          style={{
            flex: 1,
            padding: "14px 20px",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: 700,
            letterSpacing: "0.04em",
            cursor: "pointer",
            fontFamily: "'Inter', system-ui, sans-serif",
            border: active === m.id ? `1.5px solid ${m.color}60` : "1px solid rgba(255,255,255,0.1)",
            background: active === m.id ? `${m.color}15` : "rgba(255,255,255,0.03)",
            color: active === m.id ? m.color : "rgba(255,255,255,0.35)",
            textAlign: "center",
            transition: "all 0.2s"
          }}
        >
          {m.icon} {m.label}
          <div style={{
            fontSize: "12px",
            fontWeight: 400,
            color: active === m.id ? m.color + "90" : "rgba(255,255,255,0.2)",
            marginTop: "4px"
          }}>
            {m.sub}
          </div>
        </button>
      ))}
    </div>
  )
}