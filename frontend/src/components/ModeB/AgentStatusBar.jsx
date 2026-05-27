export default function AgentStatusBar({ agents }) {
  if (!agents.length) return null;

  return (
    <div style={panelStyle}>
      <div style={panelLabelStyle}>AGENT STREAM</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {agents.map((item, index) => {
          const color = colorFor(item.agent || "");
          return (
            <div key={`${item.agent}-${index}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, animation: "pulse 1.5s infinite" }} />
              <span style={{ color: "rgba(255,255,255,0.65)", fontWeight: 700 }}>{item.agent}</span>
              <span>-</span>
              <span>{item.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function colorFor(agent) {
  const name = agent.toUpperCase();
  if (name.includes("LIFECYCLE")) return "#06b6d4";
  if (name.includes("ATTENTION")) return "#a855f7";
  if (name.includes("PSYCHOLOGY")) return "#f97316";
  if (name.includes("TRADE")) return "#22c55e";
  return "#6b7280";
}

const panelStyle = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  padding: 14,
};
const panelLabelStyle = { fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginBottom: 10 };
