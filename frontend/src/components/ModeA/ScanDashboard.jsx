import { useState } from "react"
import AgentHuntCard from "./AgentHuntCard"
import BriefPanel from "./BriefPanel"

const AGENTS = [
  { id:"whale",   icon:"🔍", name:"WHALE AGENT",   sub:"Smart Money Scanner",        color:"#06b6d4" },
  { id:"airdrop", icon:"🪂", name:"AIRDROP AGENT", sub:"Airdrop Opportunity Hunter", color:"#22c55e" },
  { id:"risk",    icon:"⚠️", name:"RISK AGENT",    sub:"Unlock & Exploit Monitor",   color:"#f97316" },
  { id:"vc",      icon:"💰", name:"VC AGENT",      sub:"Funding Intelligence",       color:"#a855f7" },
]

const F = "'Inter', system-ui, sans-serif"

export default function ScanDashboard() {
  const [scanning, setScanning] = useState(false)
  const [states, setStates] = useState({})
  const [brief, setBrief] = useState(null)
  const [error, setError] = useState(null)

  const scan = () => {
    setScanning(true)
    setBrief(null); setError(null)
    setStates(AGENTS.reduce((a,ag) => ({...a,[ag.id]:{status:"idle",msgs:[]}}),{}))

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"
const es = new EventSource(`${API_URL}/api/mode-a/scan`)

    es.addEventListener("agent_start", e => {
      const d = JSON.parse(e.data)
      const key = d.agent.toLowerCase().includes("whale") ? "whale"
        : d.agent.toLowerCase().includes("airdrop") ? "airdrop"
        : d.agent.toLowerCase().includes("risk") ? "risk"
        : d.agent.toLowerCase().includes("vc") ? "vc" : null
      if (key) setStates(p => ({...p,[key]:{status:"scanning",msgs:[...(p[key]?.msgs||[]),d.message]}}))
    })

    es.addEventListener("scan_results", () => {
      AGENTS.forEach(ag => setStates(p => ({...p,[ag.id]:{...p[ag.id],status:"complete"}})))
    })

    es.addEventListener("brief_complete", e => {
      const data = JSON.parse(e.data)
      let briefText = data.brief || ""
      if (briefText.includes("OMEN DAILY BRIEF")) {
        briefText = briefText.slice(briefText.indexOf("OMEN DAILY BRIEF"))
      } else if (briefText.includes("SPECTRA DAILY BRIEF")) {
        briefText = briefText.slice(briefText.indexOf("SPECTRA DAILY BRIEF"))
      }
      const seen = new Set()
      const clean = briefText.split("\n").filter(line => {
        const t = line.trim()
        if (!t) return true
        if (seen.has(t)) return false
        seen.add(t); return true
      })
      setBrief(clean.join("\n").trim())
    })

    es.addEventListener("scan_complete", () => { setScanning(false); es.close() })
    es.addEventListener("error", e => {
      try { setError(JSON.parse(e.data).error) }
      catch { setError("Scan failed — check backend is running on port 8000") }
      setScanning(false); es.close()
    })
  }

  return (
    <div style={{ padding: "20px 0", display: "flex", flexDirection: "column", gap: "16px", fontFamily: F }}>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "0.04em", color: "#fff" }}>
          MARKET BRIEF
        </div>
        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>
          Solana & BSC · DeFi exploits · Airdrop opportunities · VC funding signals
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button onClick={scan} disabled={scanning} style={{
          padding: "14px 40px",
          background: scanning ? "rgba(168,85,247,0.08)" : "rgba(168,85,247,0.15)",
          color: scanning ? "rgba(168,85,247,0.4)" : "#a855f7",
          border: `1.5px solid ${scanning ? "rgba(168,85,247,0.15)" : "rgba(168,85,247,0.45)"}`,
          borderRadius: "12px", fontSize: "15px", fontWeight: 700,
          letterSpacing: "0.04em", cursor: scanning ? "not-allowed" : "pointer",
          fontFamily: F, width: "100%", maxWidth: "340px"
        }}>
          {scanning ? "📡 GENERATING BRIEF..." : "📡 RUN DAILY BRIEF"}
        </button>
      </div>

      {!brief && !scanning && (
        <div style={{
          background: "rgba(168,85,247,0.04)",
          border: "1px solid rgba(168,85,247,0.15)",
          borderRadius: "14px", padding: "20px",
          display: "flex", flexDirection: "column", gap: "10px"
        }}>
          <div style={{ fontSize: "13px", color: "rgba(168,85,247,0.8)", fontWeight: 700, letterSpacing: "0.06em" }}>
            WHAT THIS DOES
          </div>
          {[
            { icon: "🔍", text: "Scans smart money whale movements on Solana & BSC" },
            { icon: "🪂", text: "Finds high-TVL protocols with no token yet — airdrop candidates" },
            { icon: "⚠️", text: "Flags recent DeFi exploits and upcoming token unlock risks" },
            { icon: "💰", text: "Tracks VC funding rounds to surface early sector signals" },
            { icon: "📋", text: "Synthesises everything into one actionable daily brief" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
              <span>{item.icon}</span><span>{item.text}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "12px", padding: "14px 18px", fontSize: "14px", color: "#ef4444"
        }}>⚠️ {error}</div>
      )}

      {(scanning || Object.keys(states).length > 0) && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "12px", width: "100%"
        }}>
          {AGENTS.map(ag => (
            <AgentHuntCard key={ag.id} agent={ag} state={states[ag.id] || {status:"idle",msgs:[]}} />
          ))}
        </div>
      )}

      {brief && <BriefPanel brief={brief} />}
    </div>
  )
}