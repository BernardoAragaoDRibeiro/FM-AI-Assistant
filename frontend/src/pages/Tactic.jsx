import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";

export default function Tactic() {
  const [tactic, setTactic] = useState({
    formation: "",
    in_possession: "",
    out_of_possession: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios.get(`${API}/tactic`).then((res) => {
      setTactic(res.data);
      setLoading(false);
    });
  }, []);

  function handleChange(key, val) {
    setSaved(false);
    setTactic((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSave() {
    await axios.post(`${API}/tactic`, tactic);
    setSaved(true);
  }

  if (loading) return <p className="text-xs text-[#7b82a0]">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-lg font-semibold">Tactical Setup</h1>
      <p className="text-xs text-[#7b82a0]">
        Describe your tactical system. This context is used in every analysis.
      </p>

      <div className="bg-[#1a1f2e] border border-[#2d3448] rounded-lg p-6 space-y-4">
        <Field
          label="Formation"
          placeholder="e.g. 4-3-3, 4-1-4-1, 3-5-2"
          value={tactic.formation}
          onChange={(v) => handleChange("formation", v)}
        />
        <TextArea
          label="In possession"
          placeholder="Describe your attacking shape, roles, build-up style..."
          value={tactic.in_possession}
          onChange={(v) => handleChange("in_possession", v)}
        />
        <TextArea
          label="Out of possession"
          placeholder="Describe your defensive shape, press intensity, defensive line..."
          value={tactic.out_of_possession}
          onChange={(v) => handleChange("out_of_possession", v)}
        />
        <TextArea
          label="Notes"
          placeholder="Anything else the assistant should know about your style..."
          value={tactic.notes}
          onChange={(v) => handleChange("notes", v)}
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#00b894] text-[#0f1117] text-xs font-semibold rounded hover:bg-[#00a884] transition-colors"
        >
          Save tactic
        </button>
        {saved && <p className="text-xs text-[#00b894]">Tactic saved.</p>}
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-[#7b82a0] mb-1">{label}</label>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#232938] border border-[#2d3448] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00b894]"
      />
    </div>
  );
}

function TextArea({ label, placeholder, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-[#7b82a0] mb-1">{label}</label>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full bg-[#232938] border border-[#2d3448] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00b894] resize-y"
      />
    </div>
  );
}