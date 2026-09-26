import { useState, useEffect } from "react";
import axios from "axios";
import PlayerCard from "../components/PlayerCard.jsx";

const API = "http://localhost:8000";

const SORT_OPTIONS = [
  { label: "Name", key: "name" },
  { label: "Age", key: "age" },
  { label: "CA", key: "current_ability" },
  { label: "PA", key: "potential_ability" },
];

export default function Squad() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => { fetchSquad(); }, []);

  async function fetchSquad() {
    const res = await axios.get(`${API}/squad`);
    setPlayers(res.data.players || []);
    setLoading(false);
  }

  async function handleDelete(name) {
    await axios.delete(`${API}/squad/player`, { data: { name } });
    setPlayers((prev) => prev.filter((p) => p.name !== name));
  }

  async function handleUpdate(updated) {
    await axios.post(`${API}/squad/player`, { player: updated, target: false });
    setPlayers((prev) => prev.map((p) => p.name === updated.name ? updated : p));
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

  if (loading) return <p className="text-xs text-[#7b82a0]">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Squad <span className="text-sm text-[#7b82a0] font-normal">({players.length})</span></h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#7b82a0]">Sort by</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleSort(opt.key)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                sortKey === opt.key
                  ? "bg-[#00b89420] text-[#00b894]"
                  : "bg-[#1a1f2e] text-[#7b82a0] hover:text-[#e8eaf0]"
              }`}
            >
              {opt.label} {sortKey === opt.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-[#1a1f2e] border border-[#2d3448] rounded-lg p-8 text-center">
          <p className="text-xs text-[#7b82a0]">No players scanned yet. Go to Scan to add players.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((p) => (
            <PlayerCard key={p.name} player={p} onDelete={handleDelete} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}