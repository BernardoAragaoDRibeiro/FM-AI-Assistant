import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Upload, Scan as ScanIcon, Save, Check, HelpCircle, Clipboard } from "lucide-react";
import { TRAITS } from "../data/traits.js";
import { PERSONALITIES } from "../data/personalities.js";
import { FormSkeleton } from "../components/Skeleton.jsx";
import Tooltip from "../components/Tooltip.jsx";
import { StepProgress, ProgressBar } from "../components/Progress.jsx";

const API = "http://localhost:8000";

const FOOT_OPTIONS = ["", "Very Strong", "Strong", "Fairly Strong", "Reasonable", "Weak", "Very Weak"];

const SCAN_STEPS = [
    { label: "Upload" },
    { label: "Vision AI" },
    { label: "Parse Stats" },
    { label: "Ready" }
];

export default function Scan({ addToast, darkMode }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [extracted, setExtracted] = useState(null);
    const [isTarget, setIsTarget] = useState(false);
    const [loading, setLoading] = useState(false);
    const [scanStep, setScanStep] = useState(0);
    const [scanProgress, setScanProgress] = useState(0);
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);

    // Support direct pasting of screenshot (Ctrl+V)
    useEffect(() => {
        function handlePaste(e) {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") !== -1) {
                    const blob = items[i].getAsFile();
                    if (blob) {
                        setFile(blob);
                        setPreview(URL.createObjectURL(blob));
                        setExtracted(null);
                        setSaved(false);
                        setError(null);
                        addToast("Screenshot pasted from clipboard", "info");
                    }
                    break;
                }
            }
        }
        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, [addToast]);

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
        setScanStep(0);
        setScanProgress(15);

        // Step simulation intervals for smooth feedback during vision model response
        const progressInterval = setInterval(() => {
            setScanProgress((prev) => {
                if (prev >= 85) return prev;
                return prev + Math.floor(Math.random() * 8 + 3);
            });
        }, 600);

        const stepTimer1 = setTimeout(() => setScanStep(1), 700);
        const stepTimer2 = setTimeout(() => setScanStep(2), 2200);

        try {
            const form = new FormData();
            form.append("file", file);
            const res = await axios.post(`${API}/scan?target=false`, form);
            const players = res.data.players;
            if (!players || players.length === 0) {
                setError("No players found in screenshot.");
                addToast("No players found in screenshot", "warning");
                return;
            }
            setScanStep(3);
            setScanProgress(100);
            setExtracted(players);
            addToast(`Found ${players.length} player(s)`, "success");
        } catch (err) {
            setError(err.response?.data?.detail || "Extraction failed.");
            addToast(err.response?.data?.detail || "Extraction failed", "error");
        } finally {
            clearInterval(progressInterval);
            clearTimeout(stepTimer1);
            clearTimeout(stepTimer2);
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
            addToast(`${editedPlayer.name} saved successfully`, "success");
        } catch (err) {
            setError(err.response?.data?.detail || "Save failed.");
            addToast(err.response?.data?.detail || "Save failed", "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-lg font-semibold">Scan Player</h1>
                <Tooltip text="You can paste images directly with Ctrl+V" darkMode={darkMode}>
                    <span className={`text-xs flex items-center gap-1 cursor-help ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>
                        <Clipboard size={13} />
                        Ctrl+V to paste screenshot
                    </span>
                </Tooltip>
            </div>

            <motion.div
                className={`bg-[${darkMode ? "1a1f2e" : "white"}]/80 backdrop-blur-xl border ${darkMode ? "border-white/10" : "border-gray-200"} rounded-lg p-6 mb-4`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                <label className={`block text-xs mb-3 flex items-center gap-2 ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>
                    <Upload size={14} />
                    Screenshot
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    className={`block w-full text-xs ${darkMode ? "text-[#7b82a0] file:bg-[#232938]/50 file:text-[#e8eaf0]" : "text-[#636e72] file:bg-gray-100 file:text-[#2d3436]"} file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:cursor-pointer`}
                />
                {preview && (
                    <img
                        src={preview}
                        alt="preview"
                        className={`mt-4 rounded border ${darkMode ? "border-white/10" : "border-gray-200"} max-h-48 object-contain`}
                    />
                )}
            </motion.div>

            <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>Save as</span>
                <button
                    onClick={() => setIsTarget(false)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 ${!isTarget ? "bg-[#00b89420] text-[#00b894]" : darkMode ? "bg-[#1a1f2e]/50 text-[#7b82a0] hover:text-[#e8eaf0]" : "bg-gray-100 text-[#636e72] hover:text-[#2d3436]"}`}
                >
                    Squad player
                </button>
                <button
                    onClick={() => setIsTarget(true)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 ${isTarget ? "bg-[#00b89420] text-[#00b894]" : darkMode ? "bg-[#1a1f2e]/50 text-[#7b82a0] hover:text-[#e8eaf0]" : "bg-gray-100 text-[#636e72] hover:text-[#2d3436]"}`}
                >
                    Transfer target
                </button>
            </div>

            <button
                onClick={handleScan}
                disabled={!file || loading}
                className="px-4 py-2 bg-[#00b894] text-[#0f1117] text-xs font-semibold rounded hover:bg-[#00a884] disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-6 flex items-center gap-2"
            >
                <ScanIcon size={14} />
                {loading ? "Scanning..." : "Scan screenshot"}
            </button>

            {loading && (
                <motion.div
                    className={`bg-[${darkMode ? "1a1f2e" : "white"}]/80 backdrop-blur-xl border ${darkMode ? "border-white/10" : "border-gray-200"} rounded-lg p-5 mb-6 space-y-4`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <StepProgress steps={SCAN_STEPS} currentStep={scanStep} darkMode={darkMode} />
                    <ProgressBar progress={scanProgress} label="Analyzing player attributes from image..." darkMode={darkMode} />
                </motion.div>
            )}

            {error && <p className="text-[#e17055] text-xs mb-4">{error}</p>}
            {saved && (
                <motion.p 
                    className="text-[#00b894] text-xs mb-4 flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Check size={14} />
                    Player saved successfully.
                </motion.p>
            )}

            {extracted && extracted.map((player, i) => (
                <PlayerReview key={i} player={player} onSave={handleSave} loading={loading} darkMode={darkMode} />
            ))}
        </div>
    );
}

function PlayerReview({ player, onSave, loading, darkMode }) {
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
        <motion.div
            className={`bg-[${darkMode ? "1a1f2e" : "white"}]/80 backdrop-blur-xl border ${darkMode ? "border-white/10" : "border-gray-200"} rounded-lg p-6 space-y-6`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >

            {/* Header */}
            <div className="grid grid-cols-2 gap-4">
                <Field label="Name" value={data.name} onChange={(v) => updateField("name", v)} darkMode={darkMode} />
                <Field label="Age" value={data.age} onChange={(v) => updateField("age", v)} type="number" darkMode={darkMode} />
                <Field label="Nationality" value={data.nationality} onChange={(v) => updateField("nationality", v)} darkMode={darkMode} />
                <Field label="Height" value={data.height} onChange={(v) => updateField("height", v)} darkMode={darkMode} />
                <div>
                    <label className={`block text-xs mb-1 ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>Personality</label>
                    <select
                        value={data.personality || ""}
                        onChange={(e) => updateField("personality", e.target.value)}
                        className={`w-full ${darkMode ? "bg-[#232938] border-[#2d3448]" : "bg-gray-100 border-gray-200"} border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00b894]`}
                    >
                        {PERSONALITIES.map((p) => (
                            <option key={p} value={p}>{p || "—"}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={`block text-xs mb-1 ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>Positions</label>
                    <input
                        value={(data.positions || []).join(", ")}
                        onChange={(e) => updateField("positions", e.target.value.split(",").map((s) => s.trim()))}
                        className={`w-full ${darkMode ? "bg-[#232938] border-[#2d3448]" : "bg-gray-100 border-gray-200"} border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00b894]`}
                    />
                </div>
            </div>

            {/* Ability + Contract */}
            <div className="grid grid-cols-2 gap-4">
                <Field 
                    label="Current Ability (stars)" 
                    tooltip="Current ability rating from 1 to 5 stars"
                    value={data.current_ability ?? ""} 
                    onChange={(v) => updateField("current_ability", v === "" ? null : Number(v))} 
                    darkMode={darkMode} 
                />
                <Field 
                    label="Potential Ability (stars)" 
                    tooltip="Maximum estimated potential rating from 1 to 5 stars"
                    value={data.potential_ability ?? ""} 
                    onChange={(v) => updateField("potential_ability", v === "" ? null : Number(v))} 
                    darkMode={darkMode} 
                />
                <Field label="Wage" value={data.contract?.wage ?? ""} onChange={(v) => updateContract("wage", v)} darkMode={darkMode} />
                <Field label="Contract expires" value={data.contract?.expires ?? ""} onChange={(v) => updateContract("expires", v)} darkMode={darkMode} />
                <Field label="Market value" value={data.contract?.value ?? ""} onChange={(v) => updateContract("value", v)} darkMode={darkMode} />
            </div>

            {/* Feet */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={`block text-xs mb-1 ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>Right Foot</label>
                    <select
                        value={data.foot?.right ?? ""}
                        onChange={(e) => updateFoot("right", e.target.value)}
                        className={`w-full ${darkMode ? "bg-[#232938] border-[#2d3448]" : "bg-gray-100 border-gray-200"} border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00b894]`}
                    >
                        {FOOT_OPTIONS.map((o) => <option key={o} value={o}>{o || "—"}</option>)}
                    </select>
                </div>
                <div>
                    <label className={`block text-xs mb-1 ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>Left Foot</label>
                    <select
                        value={data.foot?.left ?? ""}
                        onChange={(e) => updateFoot("left", e.target.value)}
                        className={`w-full ${darkMode ? "bg-[#232938] border-[#2d3448]" : "bg-gray-100 border-gray-200"} border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00b894]`}
                    >
                        {FOOT_OPTIONS.map((o) => <option key={o} value={o}>{o || "—"}</option>)}
                    </select>
                </div>
            </div>

            {/* Attributes */}
            <div className="grid grid-cols-2 gap-6">
                <AttrGroup title="Technical" attrs={data.technical} group="technical" onChange={updateAttr} darkMode={darkMode} />
                <AttrGroup title="Mental" attrs={data.mental} group="mental" onChange={updateAttr} darkMode={darkMode} />
                <AttrGroup title="Physical" attrs={data.physical} group="physical" onChange={updateAttr} darkMode={darkMode} />
                <AttrGroup title="Set Pieces" attrs={data.set_pieces} group="set_pieces" onChange={updateAttr} darkMode={darkMode} />
                {data.is_goalkeeper && (
                    <AttrGroup title="Goalkeeping" attrs={data.goalkeeping} group="goalkeeping" onChange={updateAttr} darkMode={darkMode} />
                )}
            </div>

            {/* Traits */}
            <div>
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>Traits</h3>
                <div className="grid grid-cols-2 gap-1">
                    {TRAITS.map((trait) => (
                        <label key={trait} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedTraits.includes(trait)}
                                onChange={() => toggleTrait(trait)}
                                className="accent-[#00b894]"
                            />
                            <span className={`text-xs ${selectedTraits.includes(trait) ? (darkMode ? "text-[#e8eaf0]" : "text-[#2d3436]") : (darkMode ? "text-[#7b82a0]" : "text-[#636e72]")} group-hover:${darkMode ? "text-[#e8eaf0]" : "text-[#2d3436]"} transition-colors`}>
                {trait}
              </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Save */}
            <div className={`flex items-center justify-between pt-4 border-t ${darkMode ? "border-white/10" : "border-gray-200"}`}>
                <p className={`text-xs ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>Review and correct any data before saving.</p>
                <button
                    onClick={() => onSave(data)}
                    disabled={loading}
                    className="px-4 py-2 bg-[#00b894] text-[#0f1117] text-xs font-semibold rounded hover:bg-[#00a884] disabled:opacity-40 transition-colors ml-4 shrink-0 flex items-center gap-2"
                >
                    <Save size={14} />
                    {loading ? "Saving..." : "Looks good, save"}
                </button>
            </div>
        </motion.div>
    );
}

function Field({ label, tooltip, value, onChange, type = "text", darkMode }) {
    return (
        <div>
            <div className="flex items-center gap-1 mb-1">
                <label className={`block text-xs ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>{label}</label>
                {tooltip && (
                    <Tooltip text={tooltip} darkMode={darkMode}>
                        <HelpCircle size={12} className={darkMode ? "text-[#7b82a0] hover:text-[#e8eaf0]" : "text-[#636e72] hover:text-[#2d3436]"} />
                    </Tooltip>
                )}
            </div>
            <input
                type={type}
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full ${darkMode ? "bg-[#232938] border-[#2d3448]" : "bg-gray-100 border-gray-200"} border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00b894]`}
            />
        </div>
    );
}

function AttrGroup({ title, attrs, group, onChange, darkMode }) {
    if (!attrs) return null;
    const entries = Object.entries(attrs);
    if (entries.length === 0) return null;

    return (
        <div>
            <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>{title}</h3>
            <div className="space-y-1">
                {entries.map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center text-xs">
                        <span className={`capitalize ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>{key.replace(/_/g, " ")}</span>
                        <input
                            value={val ?? ""}
                            onChange={(e) => onChange(group, key, e.target.value)}
                            className={`w-14 ${darkMode ? "bg-[#232938] border-[#2d3448]" : "bg-gray-100 border-gray-200"} border rounded px-1.5 py-0.5 text-right text-xs focus:outline-none focus:border-[#00b894] ${
                                typeof val === "number" && val >= 15 ? "text-[#00b894]" :
                                    typeof val === "number" && val <= 7 ? (darkMode ? "text-[#7b82a0]" : "text-[#636e72]") : (darkMode ? "text-[#e8eaf0]" : "text-[#2d3436]")
                            }`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}