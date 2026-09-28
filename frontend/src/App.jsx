import { useState, useEffect } from "react";
import { Routes, Route, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Scan as ScanIcon, Target, Trophy, MessageSquare, Settings as SettingsIcon, Sun, Moon, Keyboard } from "lucide-react";
import Squad from "./pages/Squad.jsx";
import Scan from "./pages/Scan.jsx";
import Targets from "./pages/Targets.jsx";
import Tactic from "./pages/Tactic.jsx";
import Analyze from "./pages/Analyze.jsx";
import Settings from "./pages/Settings.jsx";
import { ToastContainer } from "./components/Toast.jsx";
import Tooltip from "./components/Tooltip.jsx";

const nav = [
    { to: "/", label: "Squad", icon: Users, shortcut: "1" },
    { to: "/scan", label: "Scan", icon: ScanIcon, shortcut: "2" },
    { to: "/targets", label: "Targets", icon: Target, shortcut: "3" },
    { to: "/tactic", label: "Tactic", icon: Trophy, shortcut: "4" },
    { to: "/analyze", label: "Analyze", icon: MessageSquare, shortcut: "5" },
    { to: "/settings", label: "Settings", icon: SettingsIcon, shortcut: "6" },
];

export default function App() {
    const location = useLocation();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(true);
    const [toasts, setToasts] = useState([]);

    function addToast(message, type = "info") {
        const newToast = { id: Date.now(), message, type };
        setToasts((prev) => [...prev, newToast]);
    }

    function removeToast(id) {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }

    // Global desktop shortcuts: Alt+1..6 for direct navigation, Alt+T to toggle theme
    useEffect(() => {
        function handleKeyDown(e) {
            // Ignore when user is typing in input or textarea
            const tagName = e.target.tagName?.toUpperCase();
            if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
                return;
            }

            if (e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
                const targetNav = nav.find((item) => item.shortcut === e.key);
                if (targetNav) {
                    e.preventDefault();
                    navigate(targetNav.to);
                    return;
                }
                if (e.key.toLowerCase() === "t") {
                    e.preventDefault();
                    setDarkMode((prev) => !prev);
                    return;
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [navigate]);

    const themeClasses = darkMode
        ? "bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] text-[#e8eaf0]"
        : "bg-gradient-to-br from-[#f5f6fa] via-[#e8eaf6] to-[#f5f6fa] text-[#2d3436]";

    const sidebarClasses = darkMode
        ? "bg-[#1a1f2e]/80 backdrop-blur-xl border-r border-white/10"
        : "bg-white/80 backdrop-blur-xl border-r border-gray-200";

    const navActiveClasses = darkMode
        ? "bg-[#00b89420] text-[#00b894]"
        : "bg-[#00b894]/10 text-[#00b894]";

    const navInactiveClasses = darkMode
        ? "text-[#7b82a0] hover:bg-[#232938]/50 hover:text-[#e8eaf0]"
        : "text-[#636e72] hover:bg-gray-100 hover:text-[#2d3436]";

    return (
        <div className={`flex min-h-screen ${themeClasses} font-sans text-sm`}>
            <aside className={`${sidebarClasses} flex flex-col py-6 shrink-0 w-48`}>
                <div className={`font-semibold tracking-wide text-xs px-5 pb-6 border-b mb-4 flex items-center justify-between ${darkMode ? "text-[#00b894] border-white/10" : "text-[#00b894] border-gray-200"}`}>
                    <span>FM Assistant</span>
                    <Tooltip text="Alt+1..6 for tabs · Alt+T for theme" position="right" darkMode={darkMode}>
                        <Keyboard size={13} className={`cursor-help ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`} />
                    </Tooltip>
                </div>
                <nav className="flex flex-col gap-0.5 px-2">
                    {nav.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/"}
                            className={({ isActive }) =>
                                `px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-between ${
                                    isActive ? navActiveClasses : navInactiveClasses
                                }`
                            }
                        >
                            <div className="flex items-center gap-2">
                                <item.icon size={16} />
                                <span>{item.label}</span>
                            </div>
                            <span className={`text-[10px] font-mono px-1 py-0.5 rounded opacity-50 ${darkMode ? "bg-white/5" : "bg-black/5"}`}>
                                Alt+{item.shortcut}
                            </span>
                        </NavLink>
                    ))}
                </nav>
                <div className="mt-auto px-4">
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${darkMode ? "text-[#7b82a0] hover:bg-[#232938]/50 hover:text-[#e8eaf0]" : "text-[#636e72] hover:bg-gray-100 hover:text-[#2d3436]"}`}
                        title="Toggle theme (Alt+T)"
                    >
                        <div className="flex items-center gap-2">
                            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                            <span>{darkMode ? "Light" : "Dark"}</span>
                        </div>
                        <span className={`text-[10px] font-mono px-1 py-0.5 rounded opacity-50 ${darkMode ? "bg-white/5" : "bg-black/5"}`}>
                            Alt+T
                        </span>
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Routes location={location}>
                            <Route path="/" element={<Squad addToast={addToast} darkMode={darkMode} />} />
                            <Route path="/scan" element={<Scan addToast={addToast} darkMode={darkMode} />} />
                            <Route path="/targets" element={<Targets addToast={addToast} darkMode={darkMode} />} />
                            <Route path="/tactic" element={<Tactic addToast={addToast} darkMode={darkMode} />} />
                            <Route path="/analyze" element={<Analyze addToast={addToast} darkMode={darkMode} />} />
                            <Route path="/settings" element={<Settings addToast={addToast} darkMode={darkMode} />} />
                        </Routes>
                    </motion.div>
                </AnimatePresence>
            </main>
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}