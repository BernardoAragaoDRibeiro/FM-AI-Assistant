import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import PlayerCard from "../components/PlayerCard.jsx";
import { CardSkeleton } from "../components/Skeleton.jsx";

const API = "http://localhost:8000";

const SORT_OPTIONS = [
    { label: "Name", key: "name" },
    { label: "Age", key: "age" },
    { label: "CA", key: "current_ability" },
    { label: "PA", key: "potential_ability" },
];

export default function Squad({ addToast, darkMode }) {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortKey, setSortKey] = useState("name");
    const [sortDir, setSortDir] = useState("asc");

    useEffect(() => { fetchSquad(); }, []);

    async function fetchSquad() {
        try {
            const res = await axios.get(`${API}/squad`);
            setPlayers(res.data.players || []);
        } catch (err) {
            console.error("Failed to fetch squad:", err);
            addToast("Failed to load squad data", "error");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(name) {
        try {
            await axios.delete(`${API}/squad/player`, { data: { name } });
            setPlayers((prev) => prev.filter((p) => p.name !== name));
            addToast(`${name} removed from squad`, "success");
        } catch (err) {
            console.error("Failed to delete player:", err);
            addToast("Failed to remove player", "error");
        }
    }

    async function handleUpdate(updated) {
        try {
            await axios.post(`${API}/squad/player`, { player: updated, target: false });
            setPlayers((prev) => prev.map((p) => p.name === updated.name ? updated : p));
            addToast(`${updated.name} updated`, "success");
        } catch (err) {
            console.error("Failed to update player:", err);
            addToast("Failed to update player", "error");
        }
    }

    function handleSort(key) {
        if (sortKey === key) {
            setSortDir((d) => d === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    }

    const sorted = [...players].sort((a, b) => {
        const av = a[sortKey] ?? "";
        const bv = b[sortKey] ?? "";
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
    });

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold">Squad</h1>
                </div>
                <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold">Squad <span className={`text-sm font-normal ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>({players.length})</span></h1>
                <div className="flex items-center gap-2">
                    <span className={`text-xs ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>Sort by</span>
                    {SORT_OPTIONS.map((opt) => (
                        <button
                            key={opt.key}
                            onClick={() => handleSort(opt.key)}
                            className={`px-2 py-1 rounded text-xs transition-colors ${
                                sortKey === opt.key
                                    ? "bg-[#00b89420] text-[#00b894]"
                                    : darkMode ? "bg-[#1a1f2e] text-[#7b82a0] hover:text-[#e8eaf0]" : "bg-gray-100 text-[#636e72] hover:text-[#2d3436]"
                            }`}
                        >
                            {opt.label} {sortKey === opt.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                        </button>
                    ))}
                </div>
            </div>

            {sorted.length === 0 ? (
                <motion.div 
                    className={`bg-[${darkMode ? "1a1f2e" : "white"}]/80 backdrop-blur-xl border ${darkMode ? "border-white/10" : "border-gray-200"} rounded-lg p-8 text-center`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <Users size={48} className={`mx-auto mb-4 ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`} />
                    <p className={`text-sm ${darkMode ? "text-[#e8eaf0]" : "text-[#2d3436]"} mb-2`}>No players in your squad yet</p>
                    <p className={`text-xs ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>Go to Scan to add players from screenshots</p>
                </motion.div>
            ) : (
                <div className="space-y-2">
                    {sorted.map((p) => (
                        <PlayerCard key={p.name} player={p} onDelete={handleDelete} onUpdate={handleUpdate} darkMode={darkMode} />
                    ))}
                </div>
            )}
        </div>
    );
}