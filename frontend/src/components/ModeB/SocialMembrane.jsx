import { useEffect, useRef } from "react"

const SENTIMENTS = {
  SEEDING: { label: "Neutral", color: "#f5c518" },
  IGNITION: { label: "Bullish", color: "#22c55e" },
  PEAK: { label: "Euphoric", color: "#ef4444" },
  DISTRIBUTION: { label: "Mixed", color: "#f97316" },
  DEAD: { label: "Bearish", color: "#6b7280" },
}

const STAGE_DOTS = ["SEED", "IGNI", "PEAK", "DIST", "DEAD"]
const STAGE_KEYS = ["SEEDING", "IGNITION", "PEAK", "DISTRIBUTION", "DEAD"]
const STAGE_COLORS = {
  SEEDING: "#22c55e", IGNITION: "#06b6d4", PEAK: "#ef4444",
  DISTRIBUTION: "#f97316", DEAD: "#6b7280"
}

export default function SocialMembrane({ socialDecay, analysis, token, stageColor }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const color = stageColor || "#06b6d4"

  // Estimate mentions from social decay (proxy)
  const mentionsEstimate = token ? Math.round(1000 - (socialDecay || 0) * 8) : 0

  const stage = token ? (
    socialDecay > 70 ? "DEAD" :
    socialDecay > 50 ? "DISTRIBUTION" :
    socialDecay > 30 ? "PEAK" :
    socialDecay > 15 ? "IGNITION" : "SEEDING"
  ) : null

  const sentiment = stage ? SENTIMENTS[stage] : { label: "Neutral", color: "#f5c518" }
  const activeStageIdx = stage ? STAGE_KEYS.indexOf(stage) : -1

  // Stage description
  const stageDesc = {
    SEEDING: "EARLY ACCUMULATION",
    IGNITION: "MOMENTUM BUILDING",
    PEAK: "PEAK ACTIVITY",
    DISTRIBUTION: "DISTRIBUTION PHASE",
    DEAD: "DEAD — NO ACTIVITY"
  }[stage] || ""

  // Bubble canvas animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !token) return
    const ctx = canvas.getContext("2d")
    canvas.width = canvas.offsetWidth || 160
    canvas.height = 100

    const bubbles = Array.from({ length: 12 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 4 + 2,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Center token bubble
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, 28, 0, Math.PI * 2)
      ctx.fillStyle = color + "20"
      ctx.fill()
      ctx.strokeStyle = color + "60"
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Token text
      ctx.fillStyle = color
      ctx.font = `bold 11px 'Courier New'`
      ctx.textAlign = "center"
      ctx.fillText("$" + (token?.symbol?.slice(0, 5) || ""), canvas.width / 2, canvas.height / 2 + 4)

      // Orbiting bubbles
      bubbles.forEach(b => {
        b.x += b.dx
        b.y += b.dy
        if (b.x < 0 || b.x > canvas.width) b.dx *= -1
        if (b.y < 0 || b.y > canvas.height) b.dy *= -1

        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fillStyle = color + "50"
        ctx.fill()
      })

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [token, stageColor])

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "10px",
      padding: "14px",
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a855f7", animation: "pulse 1.5s infinite" }} />
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
            SOCIAL MEMBRANE
          </span>
        </div>
        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>
          Decay: {Math.round(socialDecay || 0)}%
        </span>
      </div>

      {/* Bubble canvas + stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", alignItems: "center" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100px", borderRadius: "6px", background: "rgba(0,0,0,0.3)" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Decay bar */}
          <div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: "9px", color: "rgba(255,255,255,0.3)", marginBottom: "4px"
            }}>
              <span>{Math.round(socialDecay || 0)}% decay</span>
              <span style={{ color: "#22c55e" }}>Building</span>
            </div>
            <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", background: "#a855f7", width: `${socialDecay || 0}%`, transition: "width 1s" }} />
            </div>
          </div>

          {/* Mentions + Sentiment */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            <div>
              <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>MENTIONS/24H</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>{mentionsEstimate}</div>
            </div>
            <div>
              <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>SENTIMENT</div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: sentiment.color }} />
                <span style={{ fontSize: "11px", fontWeight: 700, color: sentiment.color }}>{sentiment.label}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stage summary card */}
      {stage && (
        <div style={{
          background: "rgba(0,0,0,0.3)",
          border: `1px solid ${STAGE_COLORS[stage] || color}30`,
          borderRadius: "8px", padding: "10px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <div style={{
              width: "10px", height: "10px", borderRadius: "50%",
              background: STAGE_COLORS[stage], animation: "pulse 1.5s infinite"
            }} />
            <span style={{ fontSize: "12px", fontWeight: 700, color: STAGE_COLORS[stage] }}>{stage}</span>
            <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", marginLeft: "4px" }}>{stageDesc}</span>
          </div>

          {/* Score bars */}
          {[
            { label: "Wallet Age", val: Math.round((1 - (socialDecay || 0) / 100) * 100) },
            { label: "Liquidity Depth", val: Math.round((1 - (socialDecay || 0) / 150) * 100) },
          ].map(s => (
            <div key={s.label} style={{ marginBottom: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "rgba(255,255,255,0.3)", marginBottom: "3px" }}>
                <span>{s.label}</span>
                <span>{Math.max(0, Math.min(100, s.val))}%</span>
              </div>
              <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", background: STAGE_COLORS[stage], width: `${Math.max(0, Math.min(100, s.val))}%`, transition: "width 1s" }} />
              </div>
            </div>
          ))}

          {/* Stage progress dots */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
            {STAGE_DOTS.map((dot, i) => (
              <div key={dot} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                <div style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: i === activeStageIdx ? STAGE_COLORS[STAGE_KEYS[i]] : "rgba(255,255,255,0.1)",
                  border: i === activeStageIdx ? `2px solid ${STAGE_COLORS[STAGE_KEYS[i]]}` : "none",
                  transition: "all 0.3s"
                }} />
                <span style={{
                  fontSize: "8px",
                  color: i === activeStageIdx ? STAGE_COLORS[STAGE_KEYS[i]] : "rgba(255,255,255,0.2)",
                  fontWeight: i === activeStageIdx ? 700 : 400
                }}>{dot}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  )
}