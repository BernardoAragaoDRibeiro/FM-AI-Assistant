import {useState} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {getKeyAttributes} from "../data/positions.js";
import {PERSONALITIES} from "../data/personalities.js";
import {TRAITS} from "../data/traits.js";
import {ChevronDown, ChevronUp, Trash2, Edit, Save, X, HelpCircle} from "lucide-react";
import Tooltip from "./Tooltip.jsx";

function PersonalitySelect({value, editing, onChange, darkMode}) {
    return (<div>
        <div className={`mb-0.5 ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>Personality</div>
        {editing ? (<select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full ${darkMode ? "bg-[#232938] border-[#2d3448]" : "bg-gray-100 border-gray-200"} border rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-[#00b894]`}
        >
            {PERSONALITIES.map((p) => (<option key={p} value={p}>{p || "—"}</option>))}
        </select>) : (<div className={darkMode ? "text-[#e8eaf0]" : "text-[#2d3436]"}>{value || "—"}</div>)}
    </div>);
}

const FOOT_OPTIONS = ["", "Very Strong", "Strong", "Fairly Strong", "Reasonable", "Weak", "Very Weak"];

function FootSelect({label, value, editing, onChange, darkMode}) {
    return (<div>
        <div className={`mb-0.5 ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>{label}</div>
        {editing ? (<select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full ${darkMode ? "bg-[#232938] border-[#2d3448]" : "bg-gray-100 border-gray-200"} border rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-[#00b894]`}
        >
            {FOOT_OPTIONS.map((o) => (<option key={o} value={o}>{o || "—"}</option>))}
        </select>) : (<div className={darkMode ? "text-[#e8eaf0]" : "text-[#2d3436]"}>{value || "—"}</div>)}
    </div>);
}

export default function PlayerCard({player, onDelete, onUpdate, darkMode}) {
    const [expanded, setExpanded] = useState(false);
    const {label, attrs} = getKeyAttributes(player);

    return (<motion.div 
        className={`bg-[${darkMode ? "1a1f2e" : "white"}]/80 backdrop-blur-xl border ${darkMode ? "border-white/10 hover:border-white/20" : "border-gray-200 hover:border-gray-300"} rounded-lg overflow-hidden transition-colors`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
    >
        {/* Header row */}
        <div
            className={`flex items-center justify-between px-4 py-3 cursor-pointer ${darkMode ? "hover:bg-[#232938]/50" : "hover:bg-gray-50"} transition-colors`}
            onClick={() => setExpanded((v) => !v)}
        >
            <div className="flex items-center gap-4 min-w-0">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{player.name}</span>
                        <span className={`text-xs shrink-0 ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>{player.age}y</span>
                        <span className={`text-xs shrink-0 ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>{player.nationality}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                        <span className={`text-xs ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>{label}</span>
                        <span className={`text-xs ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"} flex items-center gap-1`}>
                            <Tooltip text="Current Ability (1-5 stars)" darkMode={darkMode}>
                                <span>CA {player.current_ability ?? "?"}</span>
                            </Tooltip>
                            <span>·</span>
                            <Tooltip text="Potential Ability (1-5 stars)" darkMode={darkMode}>
                                <span>PA {player.potential_ability ?? "?"}</span>
                            </Tooltip>
                        </span>
                    </div>
                </div>
            </div>

            {/* Key attributes inline */}
            <div className="hidden md:flex items-center gap-4 mx-4">
                {attrs.map(({key, label, value}) => (<div key={key} className="text-center">
                    <div
                        className={`text-sm font-medium ${typeof value === "number" && value >= 15 ? "text-[#00b894]" : typeof value === "number" && value <= 7 ? (darkMode ? "text-[#7b82a0]" : "text-[#636e72]") : (darkMode ? "text-[#e8eaf0]" : "text-[#2d3436]")}`}>
                        {value || "—"}
                    </div>
                    <div className={`text-[10px] ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"} truncate max-w-12`}>{label}</div>
                </div>))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(player.name);
                    }}
                    className={`text-xs ${darkMode ? "text-[#7b82a0] hover:text-[#e17055]" : "text-[#636e72] hover:text-[#e17055]"} transition-colors px-2 py-1 flex items-center gap-1`}
                >
                    <Trash2 size={14} />
                    Remove
                </button>
                {expanded ? <ChevronUp size={16} className={darkMode ? "text-[#7b82a0]" : "text-[#636e72]"} /> : <ChevronDown size={16} className={darkMode ? "text-[#7b82a0]" : "text-[#636e72]"} />}
            </div>
        </div>

        {/* Expanded details */}
        <AnimatePresence>
            {expanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <PlayerDetail player={player} onUpdate={onUpdate} darkMode={darkMode}/>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>);
}

function PlayerDetail({player, onUpdate, darkMode}) {
    const [data, setData] = useState(player);
    const [editing, setEditing] = useState(false);
    const [showTraits, setShowTraits] = useState(false);

    function updateAttr(group, key, val) {
        setData((prev) => ({
            ...prev, [group]: {
                ...prev[group], [key]: val === "" ? 0 : isNaN(Number(val)) ? val : Number(val),
            },
        }));
    }

    function updateField(key, val) {
        setData((prev) => ({...prev, [key]: val}));
    }

    function updateContract(key, val) {
        setData((prev) => ({...prev, contract: {...prev.contract, [key]: val}}));
    }

    async function handleSave() {
        await onUpdate(data);
        setEditing(false);
    }

    return (<div className={`border-t ${darkMode ? "border-white/10" : "border-gray-200"} px-4 py-4 space-y-4`}>
        {/* Info row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <Info label="Height" value={data.height} editing={editing} onChange={(v) => updateField("height", v)} darkMode={darkMode}/>
            <PersonalitySelect value={data.personality} editing={editing}
                               onChange={(v) => updateField("personality", v)} darkMode={darkMode}/>
            <Info label="Wage" value={data.contract?.wage} editing={editing}
                  onChange={(v) => updateContract("wage", v)} darkMode={darkMode}/>
            <Info label="Value" value={data.contract?.value} editing={editing}
                  onChange={(v) => updateContract("value", v)} darkMode={darkMode}/>
            <Info label="Contract" value={data.contract?.expires} editing={editing}
                  onChange={(v) => updateContract("expires", v)} darkMode={darkMode}/>
            <FootSelect
                label="Right foot"
                value={data.foot?.right}
                editing={editing}
                onChange={(v) => setData((p) => ({...p, foot: {...p.foot, right: v}}))}
                darkMode={darkMode}
            />
            <FootSelect
                label="Left foot"
                value={data.foot?.left}
                editing={editing}
                onChange={(v) => setData((p) => ({...p, foot: {...p.foot, left: v}}))}
                darkMode={darkMode}
            />
        </div>

        {/* Traits */}
        <div>
            <button
                onClick={() => setShowTraits((v) => !v)}
                className={`flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${darkMode ? "text-[#7b82a0] hover:text-[#e8eaf0]" : "text-[#636e72] hover:text-[#2d3436]"}`}
            >
                Traits {data.traits?.length > 0 && `(${data.traits.length})`}
                <span>{showTraits ? "▲" : "▼"}</span>
            </button>

            {data.traits?.length > 0 && (<div className={`text-xs mt-1 ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>
                {data.traits.join(", ")}
            </div>)}

            {showTraits && (<div className="mt-2 grid grid-cols-2 gap-1">
                {TRAITS.map((trait) => (<label key={trait} className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={(data.traits || []).includes(trait)}
                        onChange={() => {
                            const current = data.traits || [];
                            setData((prev) => ({
                                ...prev,
                                traits: current.includes(trait) ? current.filter((t) => t !== trait) : [...current, trait],
                            }));
                        }}
                        className="accent-[#00b894]"
                    />
                    <span
                        className={`text-xs ${(data.traits || []).includes(trait) ? (darkMode ? "text-[#e8eaf0]" : "text-[#2d3436]") : (darkMode ? "text-[#7b82a0]" : "text-[#636e72]")} group-hover:${darkMode ? "text-[#e8eaf0]" : "text-[#2d3436]"} transition-colors`}>
            {trait}
          </span>
                </label>))}
            </div>)}
        </div>

        {/* Attributes */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <AttrCol title="Technical" attrs={data.technical} group="technical" editing={editing}
                     onChange={updateAttr} darkMode={darkMode}/>
            <AttrCol title="Mental" attrs={data.mental} group="mental" editing={editing} onChange={updateAttr} darkMode={darkMode}/>
            <AttrCol title="Physical" attrs={data.physical} group="physical" editing={editing}
                     onChange={updateAttr} darkMode={darkMode}/>
            {data.is_goalkeeper && (
                <AttrCol title="Goalkeeping" attrs={data.goalkeeping} group="goalkeeping" editing={editing}
                         onChange={updateAttr} darkMode={darkMode}/>)}
        </div>

        {/* Actions */}
        <div className={`flex items-center gap-3 pt-2 border-t ${darkMode ? "border-white/10" : "border-gray-200"}`}>
            {!editing ? (<button
                onClick={() => setEditing(true)}
                className={`px-3 py-1.5 ${darkMode ? "bg-[#232938]/50 hover:bg-[#2d3448]" : "bg-gray-100 hover:bg-gray-200"} text-xs rounded transition-colors flex items-center gap-1`}
            >
                <Edit size={14} />
                Edit
            </button>) : (<>
                <button
                    onClick={handleSave}
                    className="px-3 py-1.5 bg-[#00b894] text-[#0f1117] text-xs font-semibold rounded hover:bg-[#00a884] transition-colors flex items-center gap-1"
                >
                    <Save size={14} />
                    Save
                </button>
                <button
                    onClick={() => {
                        setData(player);
                        setEditing(false);
                    }}
                    className={`px-3 py-1.5 ${darkMode ? "bg-[#232938]/50 hover:bg-[#2d3448]" : "bg-gray-100 hover:bg-gray-200"} text-xs rounded transition-colors flex items-center gap-1`}
                >
                    <X size={14} />
                    Cancel
                </button>
            </>)}
        </div>
    </div>);
}

function Info({label, value, editing, onChange, darkMode}) {
    return (<div>
        <div className={`mb-0.5 ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>{label}</div>
        {editing ? (<input
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full ${darkMode ? "bg-[#232938] border-[#2d3448]" : "bg-gray-100 border-gray-200"} border rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-[#00b894]`}
        />) : (<div className={darkMode ? "text-[#e8eaf0]" : "text-[#2d3436]"}>{value || "—"}</div>)}
    </div>);
}

function AttrCol({title, attrs, group, editing, onChange, darkMode}) {
    if (!attrs) return null;
    const entries = Object.entries(attrs).filter(([, v]) => v !== 0 && v !== null);
    if (entries.length === 0) return null;

    return (<div>
        <h4 className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>{title}</h4>
        <div className="space-y-0.5">
            {entries.map(([key, val]) => (<div key={key} className="flex justify-between items-center text-xs">
                <span className={`capitalize ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>{key.replace(/_/g, " ")}</span>
                {editing ? (<input
                    value={val ?? ""}
                    onChange={(e) => onChange(group, key, e.target.value)}
                    className={`w-12 ${darkMode ? "bg-[#232938] border-[#2d3448]" : "bg-gray-100 border-gray-200"} border rounded px-1 py-0.5 text-right text-xs focus:outline-none focus:border-[#00b894]`}
                />) : (<span
                    className={`font-medium ${typeof val === "number" && val >= 15 ? "text-[#00b894]" : typeof val === "number" && val <= 7 ? (darkMode ? "text-[#7b82a0]" : "text-[#636e72]") : (darkMode ? "text-[#e8eaf0]" : "text-[#2d3436]")}`}>{val}</span>)}
            </div>))}
        </div>
    </div>);
}