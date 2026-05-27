// SPECTRA — StageDisplay.jsx
const PANEL = { background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"10px",padding:"14px" }
const STAGES = ["SEEDING","IGNITION","PEAK","DISTRIBUTION","DEAD"]
const COLORS = { SEEDING:"#22c55e", IGNITION:"#06b6d4", PEAK:"#ef4444", DISTRIBUTION:"#f97316", DEAD:"#6b7280" }
const POSITIONS = { SEEDING:"8%", IGNITION:"28%", PEAK:"55%", DISTRIBUTION:"78%", DEAD:"96%" }

export default function StageDisplay({ lifecycle }) {
  const color = lifecycle.stage_color || COLORS[lifecycle.stage] || "#6b7280"
  return (
    <div style={PANEL}>
      <div style={{ fontSize:"10px",color:"rgba(255,255,255,0.3)",letterSpacing:"0.1em",marginBottom:"4px" }}>CURRENT STAGE</div>
      <div style={{ fontSize:"28px",fontWeight:700,color,letterSpacing:"0.08em",margin:"6px 0" }}>{lifecycle.stage}</div>

      {/* Progress bar */}
      <div style={{ height:"4px",background:"rgba(255,255,255,0.05)",borderRadius:"4px",margin:"8px 0",position:"relative",display:"flex",overflow:"hidden" }}>
        {STAGES.map(s => (
          <div key={s} style={{ flex:1,height:"100%",background:COLORS[s]+"25" }} />
        ))}
        <div style={{ position:"absolute",top:"-3px",width:"10px",height:"10px",borderRadius:"50%",background:color,left:POSITIONS[lifecycle.stage],transform:"translateX(-50%)",transition:"left 1s ease" }} />
      </div>
      <div style={{ display:"flex",justifyContent:"space-between",fontSize:"9px",color:"rgba(255,255,255,0.2)",marginBottom:"12px" }}>
        <span>SEED</span><span>IGNI</span><span>PEAK</span><span>DIST</span><span>DEAD</span>
      </div>

      {/* Score bars */}
      {[
        { label:"VELOCITY", val:lifecycle.velocity_score },
        { label:"LIQUIDITY", val:lifecycle.liquidity_score },
        { label:"MATURITY",  val:lifecycle.age_score },
      ].map(s => (
        <div key={s.label} style={{ display:"flex",alignItems:"center",gap:"8px",margin:"4px 0" }}>
          <span style={{ fontSize:"10px",color:"rgba(255,255,255,0.3)",width:"52px" }}>{s.label}</span>
          <div style={{ flex:1,height:"3px",background:"rgba(255,255,255,0.05)",borderRadius:"3px",overflow:"hidden" }}>
            <div style={{ height:"100%",borderRadius:"3px",background:color,width:`${s.val*100}%`,transition:"width 1s ease" }} />
          </div>
          <span style={{ fontSize:"10px",color:"rgba(255,255,255,0.5)",width:"24px",textAlign:"right" }}>{Math.round(s.val*100)}%</span>
        </div>
      ))}

      {/* Trader action */}
      <div style={{ marginTop:"10px",padding:"8px 10px",borderRadius:"6px",background:color+"15",border:`1px solid ${color}30` }}>
        <div style={{ fontSize:"9px",color:"rgba(255,255,255,0.3)",marginBottom:"2px" }}>TRADER ACTION</div>
        <div style={{ fontSize:"11px",fontWeight:700,color }}>{lifecycle.trader_action}</div>
      </div>
    </div>
  )
}