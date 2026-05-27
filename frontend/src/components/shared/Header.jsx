export default function Header() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 24px",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      background: "#0d0d12",
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px",
          background: "rgba(6,182,212,0.15)",
          border: "1px solid rgba(6,182,212,0.4)",
          display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "18px"
        }}>⚡</div>
        <div>
          <div style={{
            fontSize: "20px", fontWeight: 700,
            letterSpacing: "0.06em", color: "#fff"
          }}>OMEN</div>
          <div style={{
            fontSize: "11px", color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.08em", fontWeight: 500
          }}>WEB3 INTELLIGENCE</div>
        </div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        background: "rgba(34,197,94,0.1)",
        border: "1px solid rgba(34,197,94,0.3)",
        padding: "6px 14px", borderRadius: "20px"
      }}>
        <div style={{
          width: "7px", height: "7px", borderRadius: "50%",
          background: "#22c55e",
          animation: "livepulse 1.5s infinite"
        }} />
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#22c55e", letterSpacing: "0.05em" }}>LIVE</span>
        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", marginLeft: "6px" }}>Powered by Swarms</span>
      </div>

      <style>{`@keyframes livepulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  )
}