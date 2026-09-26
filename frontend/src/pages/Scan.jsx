import { useState } from "react";
import axios from "axios";
import { TRAITS } from "../data/traits.js";

const API = "http://localhost:8000";

const FOOT_OPTIONS = ["", "Very Strong", "Strong", "Reasonable", "Weak", "Very Weak"];

export default function Scan() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extracted, setExtracted] = useState(null);
  const [isTarget, setIsTarget] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setExtracted(null);
    setSaved(false);
    setError(null);
  }

  async function handleScan() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await axios.post(`${API}/scan?target=false`, form);
      const players = res.data.players;
      if (!players || players.length === 0) {
        setError("No players found in screenshot.");
        return;
      }
      setExtracted(players);
    } catch (err) {
      setError(err.response?.data?.detail || "Extraction failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(editedPlayer) {
  setLoading(true);
  setError(null);
  try {
    await axios.post(`${API}/squad/player`, { player: editedPlayer, target: isTarget });
    setSaved(true);
    setExtracted(null);
    setFile(null);
    setPreview(null);
  } catch (err) {
    setError(err.response?.data?.detail || "Save failed.");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-lg font-semibold mb-6">Scan Player</h1>

      <div className="bg-[#1a1f2e] border border-[#2d3448] rounded-lg p-6 mb-4">
        <label className="block text-xs text-[#7b82a0] mb-3">Screenshot</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="block w-full text-xs text-[#7b82a0] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-[#232938] file:text-[#e8eaf0] file:cursor-pointer"
        />
        {preview && (
          <img
            src={preview}
            alt="preview"
            className="mt-4 rounded border border-[#2d3448] max-h-48 object-contain"
          />
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-[#7b82a0]">Save as</span>
        <button
          onClick={() => setIsTarget(false)}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${!isTarget ? "bg-[#00b89420] text-[#00b894]" : "bg-[#1a1f2e] text-[#7b82a0] hover:text-[#e8eaf0]"}`}
        >
          Squad player
        </button>
        <button
          onClick={() => setIsTarget(true)}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${isTarget ? "bg-[#00b89420] text-[#00b894]" : "bg-[#1a1f2e] text-[#7b82a0] hover:text-[#e8eaf0]"}`}
        >
          Transfer target
        </button>
      </div>

      <button
        onClick={handleScan}
        disabled={!file || loading}
        className="px-4 py-2 bg-[#00b894] text-[#0f1117] text-xs font-semibold rounded hover:bg-[#00a884] disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-6"
      >
        {loading ? "Scanning..." : "Scan screenshot"}
      </button>

      {error && <p className="text-[#e17055] text-xs mb-4">{error}</p>}
      {saved && <p className="text-[#00b894] text-xs mb-4">Player saved successfully.</p>}

      {extracted && extracted.map((player, i) => (
        <PlayerReview key={i} player={player} onSave={handleSave} loading={loading} />
      ))}
    </div>
  );
}

function PlayerReview({ player, onSave, loading }) {
  const [data, setData] = useState({ ...player, traits: [] });

  function updateAttr(group, key, val) {
    setData((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: val === "" ? 0 : isNaN(Number(val)) ? val : Number(val),
      },
    }));
  }

  function updateField(key, val) {
    setData((prev) => ({ ...prev, [key]: val }));
  }

  function updateContract(key, val) {
    setData((prev) => ({ ...prev, contract: { ...prev.contract, [key]: val } }));
  }

  function updateFoot(side, val) {
    setData((prev) => ({ ...prev, foot: { ...prev.foot, [side]: val } }));
  }

  function toggleTrait(trait) {
    setData((prev) => {
      const current = prev.traits || [];
      return {
        ...prev,
        traits: current.includes(trait)
          ? current.filter((t) => t !== trait)
          : [...current, trait],
      };
    });
  }

  const selectedTraits = data.traits || [];

  return (
    <div className="bg-[#1a1f2e] border border-[#2d3448] rounded-lg p-6 space-y-6">

      {/* Header */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Name" value={data.name} onChange={(v) => updateField("name", v)} />
        <Field label="Age" value={data.age} onChange={(v) => updateField("age", v)} type="number" />
        <Field label="Nationality" value={data.nationality} onChange={(v) => updateField("nationality", v)} />
        <Field label="Height" value={data.height} onChange={(v) => updateField("height", v)} />
        <Field label="Personality" value={data.personality} onChange={(v) => updateField("personality", v)} />
        <div>
          <label className="block text-xs text-[#7b82a0] mb-1">Positions</label>
          <input
            value={(data.positions || []).join(", ")}
            onChange={(e) => updateField("positions", e.target.value.split(",").map((s) => s.trim()))}
            className="w-full bg-[#232938] border border-[#2d3448] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00b894]"
          />
        </div>
      </div>

      {/* Ability + Contract */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Current Ability (stars)" value={data.current_ability ?? ""} onChange={(v) => updateField("current_ability", v === "" ? null : Number(v))} />
        <Field label="Potential Ability (stars)" value={data.potential_ability ?? ""} onChange={(v) => updateField("potential_ability", v === "" ? null : Number(v))} />
        <Field label="Wage" value={data.contract?.wage ?? ""} onChange={(v) => updateContract("wage", v)} />
        <Field label="Contract expires" value={data.contract?.expires ?? ""} onChange={(v) => updateContract("expires", v)} />
        <Field label="Market value" value={data.contract?.value ?? ""} onChange={(v) => updateContract("value", v)} />
      </div>

      {/* Feet */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[#7b82a0] mb-1">Right Foot</label>
          <select
            value={data.foot?.right ?? ""}
            onChange={(e) => updateFoot("right", e.target.value)}
            className="w-full bg-[#232938] border border-[#2d3448] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00b894]"
          >
            {FOOT_OPTIONS.map((o) => <option key={o} value={o}>{o || "—"}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#7b82a0] mb-1">Left Foot</label>
          <select
            value={data.foot?.left ?? ""}
            onChange={(e) => updateFoot("left", e.target.value)}
            className="w-full bg-[#232938] border border-[#2d3448] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00b894]"
          >
            {FOOT_OPTIONS.map((o) => <option key={o} value={o}>{o || "—"}</option>)}
          </select>
        </div>
      </div>

      {/* Attributes */}
      <div className="grid grid-cols-2 gap-6">
        <AttrGroup title="Technical" attrs={data.technical} group="technical" onChange={updateAttr} />
        <AttrGroup title="Mental" attrs={data.mental} group="mental" onChange={updateAttr} />
        <AttrGroup title="Physical" attrs={data.physical} group="physical" onChange={updateAttr} />
        <AttrGroup title="Set Pieces" attrs={data.set_pieces} group="set_pieces" onChange={updateAttr} />
        {data.is_goalkeeper && (
          <AttrGroup title="Goalkeeping" attrs={data.goalkeeping} group="goalkeeping" onChange={updateAttr} />
        )}
      </div>

      {/* Traits */}
      <div>
        <h3 className="text-xs font-semibold text-[#7b82a0] uppercase tracking-wider mb-3">Traits</h3>
        <div className="grid grid-cols-2 gap-1">
          {TRAITS.map((trait) => (
            <label key={trait} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedTraits.includes(trait)}
                onChange={() => toggleTrait(trait)}
                className="accent-[#00b894]"
              />
              <span className={`text-xs ${selectedTraits.includes(trait) ? "text-[#e8eaf0]" : "text-[#7b82a0]"} group-hover:text-[#e8eaf0] transition-colors`}>
                {trait}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-between pt-4 border-t border-[#2d3448]">
        <p className="text-xs text-[#7b82a0]">Review and correct any data before saving.</p>
        <button
          onClick={() => onSave(data)}
          disabled={loading}
          className="px-4 py-2 bg-[#00b894] text-[#0f1117] text-xs font-semibold rounded hover:bg-[#00a884] disabled:opacity-40 transition-colors ml-4 shrink-0"
        >
          {loading ? "Saving..." : "Looks good, save"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-xs text-[#7b82a0] mb-1">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#232938] border border-[#2d3448] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00b894]"
      />
    </div>
  );
}

function AttrGroup({ title, attrs, group, onChange }) {
  if (!attrs) return null;
  const entries = Object.entries(attrs);
  if (entries.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold text-[#7b82a0] uppercase tracking-wider mb-2">{title}</h3>
      <div className="space-y-1">
        {entries.map(([key, val]) => (
          <div key={key} className="flex justify-between items-center text-xs">
            <span className="text-[#7b82a0] capitalize">{key.replace(/_/g, " ")}</span>
            <input
              value={val ?? ""}
              onChange={(e) => onChange(group, key, e.target.value)}
              className={`w-14 bg-[#232938] border border-[#2d3448] rounded px-1.5 py-0.5 text-right text-xs focus:outline-none focus:border-[#00b894] ${
                typeof val === "number" && val >= 15 ? "text-[#00b894]" :
                typeof val === "number" && val <= 7 ? "text-[#7b82a0]" : "text-[#e8eaf0]"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}