const F = "'Inter', system-ui, sans-serif"

export default function BriefPanel({ brief }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "14px", padding: "20px",
      fontFamily: F
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "16px"
      }}>
        <div style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "0.04em", color: "#fff" }}>
          📋 OMEN DAILY BRIEF
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(brief)}
          style={{
            fontSize: "13px", color: "rgba(255,255,255,0.4)",
            border: "1px solid rgba(255,255,255,0.12)",
            padding: "6px 14px", borderRadius: "8px",
            background: "transparent", cursor: "pointer",
            fontFamily: F
          }}
        >
          Copy & Share
        </button>
      </div>
      <pre style={{
        fontSize: "14px",
        color: "rgba(255,255,255,0.7)",
        whiteSpace: "pre-wrap",
        lineHeight: 1.8,
        margin: 0,
        fontFamily: F
      }}>
        {brief}
      </pre>
    </div>
  )
}