// SPECTRA Mode B — ConfidenceGauge.jsx
// Canvas arc gauge extracted directly from mockup HTML

import { useEffect, useRef } from "react"

const PANEL = { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "14px" }

export default function ConfidenceGauge({ confidence, bias, stageColor }) {
  const canvasRef = useRef(null)
  const color = stageColor || "#6b7280"

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const W = canvas.width = canvas.offsetWidth || 160
    const H = canvas.height = 130
    const cx = W / 2, cy = H / 2 + 10, r = 52

    ctx.clearRect(0, 0, W, H)

    // Background arc
    ctx.beginPath()
    ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 2.25)
    ctx.strokeStyle = "rgba(255,255,255,0.06)"
    ctx.lineWidth = 8
    ctx.lineCap = "round"
    ctx.stroke()

    // Confidence arc
    const conf = Math.min(95, confidence) / 100
    ctx.beginPath()
    ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 0.75 + conf * Math.PI * 1.5)
    ctx.strokeStyle = color
    ctx.lineWidth = 8
    ctx.shadowBlur = 12
    ctx.shadowColor = color
    ctx.stroke()

    // Center number
    ctx.fillStyle = "#fff"
    ctx.font = "bold 26px monospace"
    ctx.textAlign = "center"
    ctx.shadowBlur = 0
    ctx.fillText(Math.round(confidence), cx, cy + 8)

    // Percent sign
    ctx.font = "11px monospace"
    ctx.fillStyle = "rgba(255,255,255,0.4)"
    ctx.fillText("%", cx + 18, cy - 8)

  }, [confidence, stageColor])

  return (
    <div style={{ ...PANEL, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginBottom: "8px", alignSelf: "flex-start" }}>
        CONFIDENCE INDEX
      </div>
      <canvas ref={canvasRef} style={{ width: "100%", maxWidth: "160px" }} />
      <div style={{ fontSize: "10px", fontWeight: 700, color, marginTop: "4px", letterSpacing: "0.08em" }}>
        {bias}
      </div>
      {/* SPECTRA V1 badge */}
      <div style={{
        width: "44px", height: "44px", borderRadius: "50%",
        border: `1px solid ${color}40`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        marginTop: "8px"
      }}>
        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)" }}>SPECTRA</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color }}>V1</div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  )
}