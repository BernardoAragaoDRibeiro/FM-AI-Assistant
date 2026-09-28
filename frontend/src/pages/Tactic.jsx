import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Save as SaveIcon, ClipboardList, HelpCircle } from "lucide-react";
import { FormSkeleton } from "../components/Skeleton.jsx";
import Tooltip from "../components/Tooltip.jsx";

const API = "http://localhost:8000";

export default function Tactic({ addToast, darkMode }) {
  const [tactic, setTactic] = useState({
    formation: "",
    in_possession: "",
    out_of_possession: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchTactic() {
      try {
        const res = await axios.get(`${API}/tactic`);
        setTactic(res.data);
      } catch (err) {
        console.error("Failed to fetch tactic:", err);
        addToast("Failed to load tactic data", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchTactic();
  }, [addToast]);

  function handleChange(key, val) {
    setSaved(false);
    setTactic((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSave() {
    try {
      await axios.post(`${API}/tactic`, tactic);
      setSaved(true);
      addToast("Tactic saved successfully", "success");
    } catch (err) {
      console.error("Failed to save tactic:", err);
      addToast("Failed to save tactic", "error");
    }
  }

  if (loading) return <FormSkeleton />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-lg font-semibold">Tactical Setup</h1>
      <p className={`text-xs ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>
        Describe your tactical system. This context is used in every analysis.
      </p>

      <motion.div 
        className={`bg-[${darkMode ? "1a1f2e" : "white"}]/80 backdrop-blur-xl border ${darkMode ? "border-white/10" : "border-gray-200"} rounded-lg p-6 space-y-4`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Field
          label="Formation"
          tooltip="E.g. 4-3-3, 4-2-3-1 Gegenpress, 3-5-2"
          placeholder="e.g. 4-3-3, 4-1-4-1, 3-5-2"
          value={tactic.formation}
          onChange={(v) => handleChange("formation", v)}
          darkMode={darkMode}
        />
        <TextArea
          label="In possession"
          tooltip="Build-up play, passing style, tempo, width, and attacking roles"
          placeholder="Describe your attacking shape, roles, build-up style..."
          value={tactic.in_possession}
          onChange={(v) => handleChange("in_possession", v)}
          darkMode={darkMode}
        />
        <TextArea
          label="Out of possession"
          tooltip="Pressing line of engagement, defensive line, pressing trigger intensity"
          placeholder="Describe your defensive shape, press intensity, defensive line..."
          value={tactic.out_of_possession}
          onChange={(v) => handleChange("out_of_possession", v)}
          darkMode={darkMode}
        />
        <TextArea
          label="Notes"
          tooltip="Specific set piece instructions, opposition instructions, or custom roles"
          placeholder="Anything else the assistant should know about your style..."
          value={tactic.notes}
          onChange={(v) => handleChange("notes", v)}
          darkMode={darkMode}
        />
      </motion.div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#00b894] text-[#0f1117] text-xs font-semibold rounded hover:bg-[#00a884] transition-colors flex items-center gap-2"
        >
          <SaveIcon size={14} />
          Save tactic
        </button>
        {saved && <p className="text-xs text-[#00b894]">Tactic saved.</p>}
      </div>
    </div>
  );
}

function Field({ label, tooltip, placeholder, value, onChange, darkMode }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <label className={`block text-xs ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>{label}</label>
        {tooltip && (
          <Tooltip text={tooltip} darkMode={darkMode}>
            <HelpCircle size={12} className={darkMode ? "text-[#7b82a0]" : "text-[#636e72]"} />
          </Tooltip>
        )}
      </div>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${darkMode ? "bg-[#232938]/50 border-white/10" : "bg-gray-100 border-gray-200"} border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00b894]`}
      />
    </div>
  );
}

function TextArea({ label, tooltip, placeholder, value, onChange, darkMode }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <label className={`block text-xs ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>{label}</label>
        {tooltip && (
          <Tooltip text={tooltip} darkMode={darkMode}>
            <HelpCircle size={12} className={darkMode ? "text-[#7b82a0]" : "text-[#636e72]"} />
          </Tooltip>
        )}
      </div>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className={`w-full ${darkMode ? "bg-[#232938]/50 border-white/10" : "bg-gray-100 border-gray-200"} border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00b894] resize-y`}
      />
    </div>
  );
}