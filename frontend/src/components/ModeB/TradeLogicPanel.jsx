const F = "'Inter', system-ui, sans-serif"

export default function TradeLogicPanel({ data, token }) {
  return (
    <div style={{
      background: "rgba(168,85,247,0.04)",
      border: "1px solid rgba(168,85,247,0.2)",
      borderRadius: "14px", padding: "20px",
      fontFamily: F
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "16px"
      }}>
        <div>
          <div style={{ fontSize: "12px", color: "rgba(168,85,247,0.6)", fontWeight: 600, letterSpacing: "0.06em" }}>
            OMEN TRADE ANALYSIS
          </div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginTop: "2px" }}>
            {token?.symbol} — Asymmetric Opportunity
          </div>
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(data.output || "")}
          style={{
            fontSize: "13px", color: "rgba(255,255,255,0.4)",
            border: "1px solid rgba(255,255,255,0.12)",
            padding: "6px 14px", borderRadius: "8px",
            background: "transparent", cursor: "pointer", fontFamily: F
          }}
        >
          Copy
        </button>
      </div>
      <pre style={{
        fontSize: "14px", color: "rgba(255,255,255,0.65)",
        lineHeight: 1.8, whiteSpace: "pre-wrap",
        margin: 0, fontFamily: F
      }}>
        {data.output}
      </pre>
    </div>
  )
}