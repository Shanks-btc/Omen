import { useState, useRef } from "react"
import TokenInput from "./TokenInput"
import MembraneSurface from "./MembraneSurface"
import ConfidenceGauge from "./ConfidenceGauge"
import StageDisplay from "./StageDisplay"
import SignalCards from "./SignalCards"
import LaunchParams from "./LaunchParams"
import SocialMembrane from "./SocialMembrane"
import TradeLogicPanel from "./TradeLogicPanel"
import AgentStatusBar from "./AgentStatusBar"
import MempoolFeed from "./MempoolFeed"

const STAGE_COLORS = {
  SEEDING: "#22c55e", IGNITION: "#06b6d4",
  PEAK: "#ef4444", DISTRIBUTION: "#f97316", DEAD: "#6b7280"
}

const F = "'Inter', system-ui, sans-serif"

function IdleState() {
  const agents = [
    {
      color: "#06b6d4", name: "LIFECYCLE DETECTOR",
      sub: "Stage classification engine",
      msgs: [
        "Classifies any new token: SEEDING → IGNITION → PEAK → DEAD",
        "Reads velocity, liquidity depth & holder maturity on-chain",
        "Paste a new token CA to know where it sits in its cycle ▌"
      ],
      delays: [0, 0.15, 0.3, 0.45, 0.6], speed: "2s"
    },
    {
      color: "#a855f7", name: "ATTENTION ANALYST",
      sub: "Virality & narrative tracker",
      msgs: [
        "Is CT attention early, building, peaked or fading on this token?",
        "Scores virality potential — are you early or already late?",
        "Social membrane decay tells you if the hype is dying ▌"
      ],
      delays: [0.2, 0.35, 0.5, 0.65, 0.8], speed: "2.4s"
    },
    {
      color: "#f97316", name: "TRADE LOGIC ENGINE",
      sub: "Entry & exit parameter calculator",
      msgs: [
        "Should you ape? Calculates risk/reward for the current cycle stage",
        "Gas timing, slippage, anti-snipe & MEV protection params",
        "Entry, exit & invalidation signals — specific, not generic ▌"
      ],
      delays: [0.4, 0.55, 0.7, 0.85, 1.0], speed: "1.8s"
    }
  ]
  const barH = [[8,16,10,18,12],[12,18,8,14,20],[16,10,20,8,14]]

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "14px", padding: "24px", marginTop: "4px"
    }}>
      <div style={{
        textAlign: "center", fontSize: "13px",
        color: "rgba(255,255,255,0.3)",
        letterSpacing: "0.08em", fontWeight: 600,
        marginBottom: "20px"
      }}>
        INTELLIGENCE AGENTS STANDING BY
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {agents.map((ag, idx) => (
          <div key={idx} style={{
            background: ag.color + "08",
            border: `1px solid ${ag.color}35`,
            borderRadius: "12px", padding: "18px",
            position: "relative", overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0,
              height: "100%", width: "40%",
              background: `linear-gradient(90deg,transparent,${ag.color}0A,transparent)`,
              animation: `scanline ${ag.speed} linear infinite`
            }} />
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{
                width: "10px", height: "10px", borderRadius: "50%",
                background: ag.color, flexShrink: 0,
                animation: "agpulse 1s infinite",
                animationDelay: `${idx * 0.3}s`
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: ag.color, letterSpacing: "0.04em" }}>
                  {ag.name}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
                  {ag.sub}
                </div>
              </div>
              <div style={{ display: "flex", gap: "3px", alignItems: "flex-end", height: "22px", flexShrink: 0 }}>
                {ag.delays.map((delay, i) => (
                  <div key={i} style={{
                    width: "4px", borderRadius: "3px", background: ag.color,
                    animation: "audiobar 1s ease-in-out infinite",
                    animationDelay: `${delay}s`, height: `${barH[idx][i]}px`
                  }} />
                ))}
              </div>
            </div>
            {ag.msgs.map((msg, i) => (
              <div key={i} style={{
                display: "flex", gap: "8px", fontSize: "13px",
                color: "rgba(255,255,255,0.5)",
                marginBottom: i < ag.msgs.length - 1 ? "6px" : 0
              }}>
                <span style={{ color: ag.color, fontWeight: 700, flexShrink: 0 }}>→</span>
                <span style={{ wordBreak: "break-word" }}>{msg}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{
        textAlign: "center", marginTop: "16px",
        fontSize: "12px", color: "rgba(255,255,255,0.2)",
        letterSpacing: "0.06em"
      }}>
        SELECT A TOKEN ABOVE OR PASTE A NEW CONTRACT ADDRESS TO SCAN
      </div>

      <style>{`
        @keyframes scanline{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}
        @keyframes agpulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes audiobar{0%,100%{transform:scaleY(0.4)}50%{transform:scaleY(1)}}
      `}</style>
    </div>
  )
}

export default function CycleScanner() {
  const [scanning, setScanning] = useState(false)
  const [chainInfo, setChainInfo] = useState(null)
  const [token, setToken] = useState(null)
  const [lifecycle, setLifecycle] = useState(null)
  const [agents, setAgents] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [trade, setTrade] = useState(null)
  const [error, setError] = useState(null)
  const [eventCount, setEventCount] = useState(0)
  const [antiSnipe, setAntiSnipe] = useState(true)
  const [mevProtection, setMevProtection] = useState(true)
  const [currentAddress, setCurrentAddress] = useState("")
  const esRef = useRef(null)

  const runScan = (address, chain) => {
    if (esRef.current) esRef.current.close()
    setScanning(true)
    setError(null); setChainInfo(null); setToken(null)
    setLifecycle(null); setAgents([]); setAnalysis(null)
    setTrade(null); setEventCount(0); setCurrentAddress(address)

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"
    const es = new EventSource(`${API_URL}/api/mode-b/analyse?token_address=${address}&chain=${chain}`)
    esRef.current = es

    es.addEventListener("chain_detected", e => { setChainInfo(JSON.parse(e.data)); setEventCount(p=>p+1) })
    es.addEventListener("token_resolved", e => { setToken(JSON.parse(e.data)); setEventCount(p=>p+1) })
    es.addEventListener("lifecycle_classified", e => { setLifecycle(JSON.parse(e.data)); setEventCount(p=>p+1) })
    es.addEventListener("agent_start", e => { setAgents(p=>[...p,JSON.parse(e.data)]); setEventCount(p=>p+1) })
    es.addEventListener("analysis_complete", e => { setAnalysis(JSON.parse(e.data)); setEventCount(p=>p+1) })
    es.addEventListener("trade_complete", e => { setTrade(JSON.parse(e.data)); setEventCount(p=>p+1) })
    es.addEventListener("scan_complete", () => { setScanning(false); es.close() })
    es.addEventListener("error", e => {
      try { setError(JSON.parse(e.data).error) }
      catch { setError("Backend error — is it running on port 8000?") }
      setScanning(false); es.close()
    })
  }

  const stageColor = lifecycle ? (STAGE_COLORS[lifecycle.stage] || "#6b7280") : "#06b6d4"
  const txSuccessPct = lifecycle
    ? Math.min(99, Math.round(60 + lifecycle.velocity_score * 20 + lifecycle.liquidity_score * 20))
    : null

  return (
    <div style={{
      padding: "20px 0",
      display: "flex", flexDirection: "column", gap: "14px",
      fontFamily: F, width: "100%", overflowX: "hidden"
    }}>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "0.04em", color: "#fff" }}>
          OMEN SCAN
        </div>
        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>
          Scan any new token before you ape - Solana & BSC lifecycle intelligence
        </div>
      </div>

      <TokenInput onScan={runScan} scanning={scanning} />

      {error && (
        <div style={{
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "12px", padding: "14px 18px", fontSize: "14px", color: "#ef4444",
          wordBreak: "break-word"
        }}>⚠️ {error}</div>
      )}

      {!token && !scanning && !error && <IdleState />}

      {scanning && !token && (
        <div style={{
          background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.3)",
          borderRadius: "12px", padding: "24px", textAlign: "center"
        }}>
          <div style={{ fontSize: "14px", color: "#06b6d4", fontWeight: 600 }}>
            FETCHING ON-CHAIN DATA...
          </div>
          {chainInfo && (
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "8px" }}>
              {chainInfo.message}
            </div>
          )}
        </div>
      )}

      {(chainInfo || token || lifecycle) && (
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "10px 16px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "10px", fontSize: "13px", flexWrap: "wrap"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ color: "#22c55e", fontWeight: 600 }}>Connected</span>
          </div>
          {lifecycle && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>Stage:</span>
              <span style={{ color: stageColor, fontWeight: 700 }}>{lifecycle.stage}</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>Events:</span>
            <span style={{ color: "#06b6d4", fontWeight: 600 }}>{eventCount}</span>
          </div>
          {chainInfo && (
            <div style={{
              marginLeft: "auto", padding: "4px 12px", borderRadius: "6px",
              fontSize: "12px", fontWeight: 700,
              background: chainInfo.chain === "solana" ? "rgba(153,69,255,0.2)" : "rgba(243,186,47,0.2)",
              color: chainInfo.chain === "solana" ? "#9945FF" : "#F3BA2F",
              border: `1px solid ${chainInfo.chain === "solana" ? "rgba(153,69,255,0.4)" : "rgba(243,186,47,0.4)"}`
            }}>
              {chainInfo.chain === "solana" ? "◎ SOLANA LIVE" : "⬡ BSC LIVE"}
            </div>
          )}
        </div>
      )}

      {token && (
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px", padding: "16px 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          gap: "14px", alignItems: "center"
        }}>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#fff" }}>{token.symbol}</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>{token.name}</div>
          </div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#06b6d4" }}>
              ${Number(token.price).toFixed(8)}
            </div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: Number(token.priceChange24h) >= 0 ? "#22c55e" : "#ef4444" }}>
              {Number(token.priceChange24h) >= 0 ? "+" : ""}{Number(token.priceChange24h).toFixed(2)}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>LIQUIDITY</div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>
              ${(Number(token.liquidity)/1000000).toFixed(2)}M
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>HOLDERS</div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>
              {Number(token.holders).toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>24H VOL</div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>
              ${(Number(token.volume24h)/1000).toFixed(0)}K
            </div>
          </div>
        </div>
      )}

      {agents.length > 0 && <AgentStatusBar agents={agents} scanning={scanning} />}

      {lifecycle && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
            <MembraneSurface stage={lifecycle.stage} velocityScore={lifecycle.velocity_score} stageColor={stageColor} txVelocityPct={lifecycle.tx_velocity_pct} />
            <ConfidenceGauge confidence={lifecycle.confidence} bias={lifecycle.stage_bias} stageColor={stageColor} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
            <StageDisplay lifecycle={lifecycle} />
            <SignalCards short={lifecycle.short_signal} mid={lifecycle.mid_signal} long={lifecycle.long_signal} stageColor={stageColor} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
            <LaunchParams lifecycle={lifecycle} antiSnipe={antiSnipe} setAntiSnipe={setAntiSnipe} mevProtection={mevProtection} setMevProtection={setMevProtection} txSuccessPct={txSuccessPct} />
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <SocialMembrane socialDecay={lifecycle.social_decay_pct} analysis={analysis} token={token} stageColor={stageColor} />
              <MempoolFeed tokenAddress={currentAddress} tokenSymbol={token?.symbol} chain={token?.chain} stageColor={stageColor} />
            </div>
          </div>
        </>
      )}

      {trade && <TradeLogicPanel data={trade} token={token} />}
    </div>
  )
}