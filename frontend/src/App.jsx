import { Routes, Route, NavLink } from "react-router-dom";
import Squad from "./pages/Squad.jsx";
import Scan from "./pages/Scan.jsx";
import Targets from "./pages/Targets.jsx";
import Tactic from "./pages/Tactic.jsx";
import Analyze from "./pages/Analyze.jsx";
import Settings from "./pages/Settings.jsx"

const nav = [
  { to: "/", label: "Squad" },
  { to: "/scan", label: "Scan" },
  { to: "/targets", label: "Targets" },
  { to: "/tactic", label: "Tactic" },
  { to: "/analyze", label: "Analyze" },
];

export default function App() {
  return (
    <div className="flex min-h-screen bg-[#0f1117] text-[#e8eaf0] font-sans text-sm">
      <aside className="w-48 bg-[#1a1f2e] border-r border-[#2d3448] flex flex-col py-6 shrink-0">
        <div className="text-[#00b894] font-semibold tracking-wide text-xs px-5 pb-6 border-b border-[#2d3448] mb-4">
          FM Assistant
        </div>
        <nav className="flex flex-col gap-0.5 px-2">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#00b89420] text-[#00b894]"
                    : "text-[#7b82a0] hover:bg-[#232938] hover:text-[#e8eaf0]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Squad />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/targets" element={<Targets />} />
          <Route path="/tactic" element={<Tactic />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/settings" element={<Settings/>} />
        </Routes>
      </main>
    </div>
  );
}