import { motion } from "framer-motion";

const ITEMS = [
  { key: "short", label: "SHORT", timeframe: "1-7 days" },
  { key: "mid", label: "MID", timeframe: "1-4 weeks" },
  { key: "long", label: "LONG", timeframe: "1-3 months" },
];

function color(value) {
  if (value > 60) return "#22c55e";
  if (value > 30) return "#f97316";
  return "#ef4444";
}

export default function SignalCards({ short, mid, long }) {
  const values = { short, mid, long };

  return (
    <div style={panelStyle}>
      <div style={panelLabelStyle}>SIGNAL STRENGTH</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
        {ITEMS.map((item) => {
          const val = Math.round(Math.max(0, Math.min(100, Number(values[item.key] || 0))));
          const c = color(val);
          return (
            <div key={item.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>
                {item.label}
              </div>
              <div style={barBoxStyle}>
                <motion.div
                  style={{
                    width: "100%",
                    borderRadius: "4px 4px 0 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    background: `${c}4d`,
                    color: c,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${val}%` }}
                  transition={{ duration: 0.75 }}
                >
                  +{val}%
                </motion.div>
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>{item.timeframe}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const panelStyle = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  padding: 14,
};
const panelLabelStyle = { fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginBottom: 10 };
const barBoxStyle = {
  width: "100%",
  height: 70,
  background: "rgba(0,0,0,0.3)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 6,
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  overflow: "hidden",
  position: "relative",
};
