export default function LaunchParams({
  lifecycle,
  antiSnipe, setAntiSnipe,
  mevProtection, setMevProtection,
  txSuccessPct
}) {
  const isDormant = lifecycle.stage === "DEAD" || lifecycle.stage === "DISTRIBUTION"
  const color = lifecycle.stage_color || "#06b6d4"

  // Gas price based on velocity
  const gasMin = lifecycle.velocity_score > 0.6 ? 3 : lifecycle.velocity_score > 0.3 ? 2 : 1
  const gasMax = gasMin + 1
  const priorityFee = (gasMin * 0.15).toFixed(1)

  // Slippage warning
  const highVelocity = lifecycle.velocity_score > 0.5

  // Stage badge text
  const stageBadge = {
    SEEDING: "EARLY",
    IGNITION: "MOMENTUM",
    PEAK: "PEAK",
    DISTRIBUTION: "CAUTION",
    DEAD: "DORMANT"
  }[lifecycle.stage] || "UNKNOWN"

  const panelStyle = {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    padding: "14px"
  }

  const Toggle = ({ value, onChange }) => (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: "40px", height: "22px", borderRadius: "11px",
        background: value ? color : "rgba(255,255,255,0.1)",
        position: "relative", cursor: "pointer",
        transition: "background 0.2s", flexShrink: 0
      }}
    >
      <div style={{
        position: "absolute", top: "3px",
        left: value ? "21px" : "3px",
        width: "16px", height: "16px",
        borderRadius: "50%", background: "#fff",
        transition: "left 0.2s"
      }} />
    </div>
  )

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: "14px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: isDormant ? "rgba(255,255,255,0.2)" : "#22c55e",
            animation: isDormant ? "none" : "pulse 1.5s infinite"
          }} />
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
            LAUNCH PARAMETERS
          </span>
        </div>
        <span style={{
          padding: "2px 8px", borderRadius: "4px",
          fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em",
          background: color + "20", color,
          border: `1px solid ${color}30`
        }}>
          {stageBadge}
        </span>
      </div>

      {/* Optimal entry window */}
      <div style={{ marginBottom: "12px" }}>
        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", marginBottom: "4px", letterSpacing: "0.08em" }}>
          OPTIMAL ENTRY WINDOW
        </div>
        <div style={{ fontSize: "26px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
          {lifecycle.optimal_entry_window}
        </div>
      </div>

      {/* Liquidity depth */}
      <div style={{ marginBottom: "12px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: "9px", color: "rgba(255,255,255,0.3)", marginBottom: "5px", letterSpacing: "0.08em"
        }}>
          <span>LIQUIDITY DEPTH</span>
          <span>{Math.round(lifecycle.liquidity_depth_pct)}%</span>
        </div>
        <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: "4px",
            background: color,
            width: `${lifecycle.liquidity_depth_pct}%`,
            transition: "width 1s ease"
          }} />
        </div>
      </div>

      {/* Gas Price + Slippage cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
        <div style={{
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "8px", padding: "10px"
        }}>
          <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", marginBottom: "4px", letterSpacing: "0.08em" }}>
            GAS PRICE
          </div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>
            {gasMin}-{gasMax} <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>GWEI</span>
          </div>
          <div style={{ fontSize: "9px", color: "#f97316", marginTop: "3px" }}>
            ↑ Priority Fee: {priorityFee} GWEI
          </div>
        </div>
        <div style={{
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "8px", padding: "10px"
        }}>
          <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", marginBottom: "4px", letterSpacing: "0.08em" }}>
            SLIPPAGE
          </div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>
            {lifecycle.slippage_recommendation}
          </div>
          {highVelocity && (
            <div style={{ fontSize: "9px", color: "#f97316", marginTop: "3px" }}>
              ⚡ High velocity detected
            </div>
          )}
        </div>
      </div>

      {/* Anti-snipe toggle */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color }} />
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>
            ANTI-SNIPE PROTECTION
          </span>
        </div>
        <Toggle value={antiSnipe} onChange={setAntiSnipe} />
      </div>

      {/* MEV protection toggle */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color }} />
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>
            MEV PROTECTION
          </span>
        </div>
        <Toggle value={mevProtection} onChange={setMevProtection} />
      </div>

      {/* TX Success Probability */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.05)"
      }}>
        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>
          TX SUCCESS PROBABILITY
        </span>
        <span style={{ fontSize: "16px", fontWeight: 700, color }}>
          {txSuccessPct || "--"}%
        </span>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  )
}