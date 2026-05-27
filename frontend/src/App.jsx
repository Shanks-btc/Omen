import { useState } from "react"
import ScanDashboard from "./components/ModeA/ScanDashboard.jsx"
import CycleScanner from "./components/ModeB/CycleScanner.jsx"
import ModeToggle from "./components/ModeToggle.jsx"
import Header from "./components/shared/Header.jsx"

export default function App() {
  const [active, setActive] = useState("B")

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0d12",
      color: "#fff",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <Header />
      <ModeToggle active={active} setActive={setActive} />
      <div style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 20px",
        boxSizing: "border-box",
      }}>
        {active === "B" && <CycleScanner />}
        {active === "A" && <ScanDashboard />}
      </div>
    </div>
  )
}