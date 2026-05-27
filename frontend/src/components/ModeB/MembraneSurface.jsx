import { useEffect, useRef } from "react"

const WAVE_CONFIG = {
  SEEDING:      { amplitude: 12, frequency: 0.018, speed: 0.03, noise: 0.25 },
  IGNITION:     { amplitude: 30, frequency: 0.035, speed: 0.07, noise: 0.08 },
  PEAK:         { amplitude: 50, frequency: 0.055, speed: 0.12, noise: 0.45 },
  DISTRIBUTION: { amplitude: 22, frequency: 0.028, speed: 0.04, noise: 0.35 },
  DEAD:         { amplitude: 2,  frequency: 0.01,  speed: 0.01, noise: 0.6  },
}

export default function MembraneSurface({ stage, velocityScore, stageColor, txVelocityPct }) {
  const canvasRef = useRef(null)
  const frameRef = useRef(0)
  const animRef = useRef(null)
  const color = stageColor || "#06b6d4"
  const cfg = WAVE_CONFIG[stage] || WAVE_CONFIG.DEAD

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = 120
    }
    resize()

    const draw = () => {
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)
      frameRef.current += cfg.speed

      // Peak zone marker — dotted vertical line at 60% of width
      const peakX = W * 0.62
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.strokeStyle = "rgba(255,255,255,0.15)"
      ctx.lineWidth = 1
      ctx.moveTo(peakX, 0)
      ctx.lineTo(peakX, H)
      ctx.stroke()
      ctx.setLineDash([])

      // Peak zone label
      ctx.fillStyle = "rgba(255,255,255,0.25)"
      ctx.font = "9px 'Courier New'"
      ctx.fillText("PEAK ZONE →", peakX - 68, 12)

      // Draw main wave (primary color)
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = 1.8
      ctx.shadowBlur = stage === "DEAD" ? 0 : 15
      ctx.shadowColor = color

      for (let x = 0; x <= W; x++) {
        const t = frameRef.current
        const noise = (Math.random() - 0.5) * cfg.noise * cfg.amplitude
        let y = H / 2

        if (stage === "DEAD") {
          y += noise * 0.4
        } else if (stage === "PEAK") {
          const raw = Math.sin(x * cfg.frequency + t) * cfg.amplitude
          y += Math.max(-cfg.amplitude * 0.7, Math.min(cfg.amplitude * 0.7, raw * 1.4)) + noise
        } else if (stage === "IGNITION") {
          const saw = ((x * cfg.frequency + t) % (Math.PI * 2)) / (Math.PI * 2) * cfg.amplitude * 2 - cfg.amplitude
          y += saw * 0.7 + Math.sin(x * cfg.frequency + t) * cfg.amplitude * 0.4 + noise
        } else if (stage === "DISTRIBUTION") {
          const decay = 1 - (x / W) * 0.5
          y += Math.sin(x * cfg.frequency + t) * cfg.amplitude * decay + noise
        } else {
          y += Math.sin(x * cfg.frequency + t) * cfg.amplitude
            + Math.sin(x * cfg.frequency * 3 + t * 2) * cfg.amplitude * 0.2 + noise
        }

        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Draw second harmonic wave (purple/offset color — like MLO dual wave)
      ctx.beginPath()
      ctx.strokeStyle = "#a855f7"
      ctx.lineWidth = 1.2
      ctx.shadowBlur = stage === "DEAD" ? 0 : 8
      ctx.shadowColor = "#a855f7"
      ctx.globalAlpha = 0.5

      for (let x = 0; x <= W; x++) {
        const t = frameRef.current + Math.PI * 0.4  // offset phase
        let y = H / 2

        if (stage === "DEAD") {
          y += (Math.random() - 0.5) * 2
        } else {
          y += Math.sin(x * cfg.frequency * 1.1 + t) * cfg.amplitude * 0.7
            + Math.sin(x * cfg.frequency * 2.2 + t * 1.5) * cfg.amplitude * 0.2
        }

        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.globalAlpha = 1.0
      ctx.shadowBlur = 0

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)

    return () => {
      cancelAnimationFrame(animRef.current)
      ro.disconnect()
    }
  }, [stage, stageColor])

  return (
    <div style={{
      background: "rgba(0,0,0,0.5)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "10px",
      padding: "14px"
    }}>
      {/* Top row */}
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        marginBottom: "10px", fontSize: "10px"
      }}>
        <div style={{
          width: "6px", height: "6px", borderRadius: "50%",
          background: color, animation: "pulse 1.5s infinite"
        }} />
        <span style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>MEMBRANE ACTIVE</span>
        <span style={{ marginLeft: "auto" }}>
          <span style={{
            padding: "3px 12px", borderRadius: "6px", fontSize: "11px",
            fontWeight: 700, letterSpacing: "0.1em",
            background: color + "20", color, border: `1px solid ${color}40`
          }}>
            {stage}
          </span>
        </span>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: "100%", height: "120px",
          borderRadius: "6px", display: "block",
          background: "rgba(0,0,0,0.4)"
        }}
      />

      {/* Bottom: Stage name + TX Velocity */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-end", marginTop: "10px"
      }}>
        <div>
          <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
            CURRENT STAGE
          </div>
          <div style={{
            fontSize: "22px", fontWeight: 700, color,
            letterSpacing: "0.08em", lineHeight: 1.1
          }}>
            {stage}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
            TX VELOCITY
          </div>
          <div style={{ fontSize: "22px", fontWeight: 700, color }}>
            {stage === "DEAD" ? "0%" : `${Math.round(txVelocityPct || 0)}%`}
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  )
}