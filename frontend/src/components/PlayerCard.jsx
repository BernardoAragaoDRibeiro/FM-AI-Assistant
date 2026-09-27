import {useState} from "react";
import {getKeyAttributes} from "../data/positions.js";
import {PERSONALITIES} from "../data/personalities.js";
import {TRAITS} from "../data/traits.js";

function PersonalitySelect({value, editing, onChange}) {
    return (<div>
        <div className="text-[#7b82a0] mb-0.5">Personality</div>
        {editing ? (<select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[#232938] border border-[#2d3448] rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-[#00b894]"
        >
            {PERSONALITIES.map((p) => (<option key={p} value={p}>{p || "—"}</option>))}
        </select>) : (<div className="text-[#e8eaf0]">{value || "—"}</div>)}
    </div>);
}

const FOOT_OPTIONS = ["", "Very Strong", "Strong", "Fairly Strong", "Reasonable", "Weak", "Very Weak"];

function FootSelect({label, value, editing, onChange}) {
    return (<div>
        <div className="text-[#7b82a0] mb-0.5">{label}</div>
        {editing ? (<select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[#232938] border border-[#2d3448] rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-[#00b894]"
        >
            {FOOT_OPTIONS.map((o) => (<option key={o} value={o}>{o || "—"}</option>))}
        </select>) : (<div className="text-[#e8eaf0]">{value || "—"}</div>)}
    </div>);
}

export default function PlayerCard({player, onDelete, onUpdate}) {
    const [expanded, setExpanded] = useState(false);
    const {label, attrs} = getKeyAttributes(player);

    return (<div className="bg-[#1a1f2e] border border-[#2d3448] rounded-lg overflow-hidden">
        {/* Header row */}
        <div
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#232938] transition-colors"
            onClick={() => setExpanded((v) => !v)}
        >
            <div className="flex items-center gap-4 min-w-0">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{player.name}</span>
                        <span className="text-xs text-[#7b82a0] shrink-0">{player.age}y</span>
                        <span className="text-xs text-[#7b82a0] shrink-0">{player.nationality}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-[#7b82a0]">{label}</span>
                        <span className="text-xs text-[#7b82a0]">
                CA {player.current_ability ?? "?"} · PA {player.potential_ability ?? "?"}
              </span>
                    </div>
                </div>
            </div>

            {/* Key attributes inline */}
            <div className="hidden md:flex items-center gap-4 mx-4">
                {attrs.map(({key, label, value}) => (<div key={key} className="text-center">
                    <div
                        className={`text-sm font-medium ${typeof value === "number" && value >= 15 ? "text-[#00b894]" : typeof value === "number" && value <= 7 ? "text-[#7b82a0]" : "text-[#e8eaf0]"}`}>
                        {value || "—"}
                    </div>
                    <div className="text-[10px] text-[#7b82a0] truncate max-w-12">{label}</div>
                </div>))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(player.name);
                    }}
                    className="text-xs text-[#7b82a0] hover:text-[#e17055] transition-colors px-2 py-1"
                >
                    Remove
                </button>
                <span className="text-xs text-[#7b82a0]">{expanded ? "▲" : "▼"}</span>
            </div>
        </div>

        {/* Expanded details */}
        {expanded && (<PlayerDetail player={player} onUpdate={onUpdate}/>)}
    </div>);
}

function PlayerDetail({player, onUpdate}) {
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

    return (<div className="border-t border-[#2d3448] px-4 py-4 space-y-4">
        {/* Info row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <Info label="Height" value={data.height} editing={editing} onChange={(v) => updateField("height", v)}/>
            <PersonalitySelect value={data.personality} editing={editing}
                               onChange={(v) => updateField("personality", v)}/>
            <Info label="Wage" value={data.contract?.wage} editing={editing}
                  onChange={(v) => updateContract("wage", v)}/>
            <Info label="Value" value={data.contract?.value} editing={editing}
                  onChange={(v) => updateContract("value", v)}/>
            <Info label="Contract" value={data.contract?.expires} editing={editing}
                  onChange={(v) => updateContract("expires", v)}/>
            <FootSelect
                label="Right foot"
                value={data.foot?.right}
                editing={editing}
                onChange={(v) => setData((p) => ({...p, foot: {...p.foot, right: v}}))}
            />
            <FootSelect
                label="Left foot"
                value={data.foot?.left}
                editing={editing}
                onChange={(v) => setData((p) => ({...p, foot: {...p.foot, left: v}}))}
            />
        </div>

        {/* Traits */}
        <div>
            <button
                onClick={() => setShowTraits((v) => !v)}
                className="flex items-center gap-2 text-[10px] font-semibold text-[#7b82a0] uppercase tracking-wider hover:text-[#e8eaf0] transition-colors"
            >
                Traits {data.traits?.length > 0 && `(${data.traits.length})`}
                <span>{showTraits ? "▲" : "▼"}</span>
            </button>

            {data.traits?.length > 0 && (<div className="text-xs text-[#7b82a0] mt-1">
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
                        className={`text-xs ${(data.traits || []).includes(trait) ? "text-[#e8eaf0]" : "text-[#7b82a0]"} group-hover:text-[#e8eaf0] transition-colors`}>
            {trait}
          </span>
                </label>))}
            </div>)}
        </div>

        {/* Attributes */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <AttrCol title="Technical" attrs={data.technical} group="technical" editing={editing}
                     onChange={updateAttr}/>
            <AttrCol title="Mental" attrs={data.mental} group="mental" editing={editing} onChange={updateAttr}/>
            <AttrCol title="Physical" attrs={data.physical} group="physical" editing={editing}
                     onChange={updateAttr}/>
            {data.is_goalkeeper && (
                <AttrCol title="Goalkeeping" attrs={data.goalkeeping} group="goalkeeping" editing={editing}
                         onChange={updateAttr}/>)}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-[#2d3448]">
            {!editing ? (<button
                onClick={() => setEditing(true)}
                className="px-3 py-1.5 bg-[#232938] text-xs rounded hover:bg-[#2d3448] transition-colors"
            >
                Edit
            </button>) : (<>
                <button
                    onClick={handleSave}
                    className="px-3 py-1.5 bg-[#00b894] text-[#0f1117] text-xs font-semibold rounded hover:bg-[#00a884] transition-colors"
                >
                    Save
                </button>
                <button
                    onClick={() => {
                        setData(player);
                        setEditing(false);
                    }}
                    className="px-3 py-1.5 bg-[#232938] text-xs rounded hover:bg-[#2d3448] transition-colors"
                >
                    Cancel
                </button>
            </>)}
        </div>
    </div>);
}

function Info({label, value, editing, onChange}) {
    return (<div>
        <div className="text-[#7b82a0] mb-0.5">{label}</div>
        {editing ? (<input
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[#232938] border border-[#2d3448] rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-[#00b894]"
        />) : (<div className="text-[#e8eaf0]">{value || "—"}</div>)}
    </div>);
}

function AttrCol({title, attrs, group, editing, onChange}) {
    if (!attrs) return null;
    const entries = Object.entries(attrs).filter(([, v]) => v !== 0 && v !== null);
    if (entries.length === 0) return null;

    return (<div>
        <h4 className="text-[10px] font-semibold text-[#7b82a0] uppercase tracking-wider mb-1.5">{title}</h4>
        <div className="space-y-0.5">
            {entries.map(([key, val]) => (<div key={key} className="flex justify-between items-center text-xs">
                <span className="text-[#7b82a0] capitalize">{key.replace(/_/g, " ")}</span>
                {editing ? (<input
                    value={val ?? ""}
                    onChange={(e) => onChange(group, key, e.target.value)}
                    className="w-12 bg-[#232938] border border-[#2d3448] rounded px-1 py-0.5 text-right text-xs focus:outline-none focus:border-[#00b894]"
                />) : (<span
                    className={`font-medium ${typeof val === "number" && val >= 15 ? "text-[#00b894]" : typeof val === "number" && val <= 7 ? "text-[#7b82a0]" : "text-[#e8eaf0]"}`}>{val}</span>)}
            </div>))}
        </div>
    </div>);
}