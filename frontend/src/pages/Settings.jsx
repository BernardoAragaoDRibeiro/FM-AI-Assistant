import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Save as SaveIcon, Eye, EyeOff, Key, HelpCircle } from "lucide-react";
import { FormSkeleton } from "../components/Skeleton.jsx";
import Tooltip from "../components/Tooltip.jsx";

const API = "http://localhost:8000";

const PROVIDERS = [
    {
        label: "Groq",
        prefix: "groq/",
        example: "groq/qwen/qwen3.8-27b",
        needsKey: true,
        keyUrl: "https://console.groq.com/keys",
    },
    {
        label: "Google Gemini",
        prefix: "gemini/",
        example: "gemini/gemini-2.0-flash",
        needsKey: true,
        keyUrl: "https://aistudio.google.com/app/apikey",
    },
    {
        label: "OpenAI",
        prefix: "openai/",
        example: "openai/gpt-4o",
        needsKey: true,
        keyUrl: "https://platform.openai.com/api-keys",
    },
    {
        label: "Anthropic",
        prefix: "anthropic/",
        example: "anthropic/claude-haiku-4-5-20251001",
        needsKey: true,
        keyUrl: "https://console.anthropic.com/settings/keys",
    },
    {
        label: "OpenRouter",
        prefix: "openrouter/",
        example: "openrouter/meta-llama/llama-3.2-11b-vision-instruct",
        needsKey: true,
        keyUrl: "https://openrouter.ai/keys",
    },
    {
        label: "Ollama (local)",
        prefix: "ollama/",
        example: "ollama/llama3.2-vision",
        needsKey: false,
        keyUrl: null,
    },
];

function detectProvider(model) {
    for (const p of PROVIDERS) {
        if (model && model.startsWith(p.prefix)) return p;
    }
    return PROVIDERS[0];
}

function ModelSection({ title, modelKey, keyKey, config, onChange, darkMode }) {
    const provider = detectProvider(config[modelKey]);
    const [showKey, setShowKey] = useState(false);

    function handleProviderChange(e) {
        const selected = PROVIDERS.find((p) => p.label === e.target.value);
        onChange(modelKey, selected.example);
        if (!selected.needsKey) onChange(keyKey, "");
    }

    return (
        <motion.div 
            className={`bg-[${darkMode ? "1a1f2e" : "white"}]/80 backdrop-blur-xl border ${darkMode ? "border-white/10" : "border-gray-200"} rounded-lg p-6 space-y-4`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            <h2 className="text-sm font-semibold">{title}</h2>

            <div>
                <div className="flex items-center gap-1 mb-1">
                    <label className={`block text-xs ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>Provider</label>
                    <Tooltip text="Choose the LLM inference provider or local Ollama" darkMode={darkMode}>
                        <HelpCircle size={12} className={darkMode ? "text-[#7b82a0]" : "text-[#636e72]"} />
                    </Tooltip>
                </div>
                <select
                    value={provider.label}
                    onChange={handleProviderChange}
                    className={`w-full ${darkMode ? "bg-[#232938]/50 border-white/10 text-[#e8eaf0]" : "bg-gray-100 border-gray-200 text-[#2d3436]"} border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00b894]`}
                >
                    {PROVIDERS.map((p) => (
                        <option key={p.label} value={p.label}>
                            {p.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className={`block text-xs ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"} mb-1`}>Model</label>
                <input
                    value={config[modelKey] || ""}
                    onChange={(e) => onChange(modelKey, e.target.value)}
                    className={`w-full ${darkMode ? "bg-[#232938]/50 border-white/10 text-[#e8eaf0]" : "bg-gray-100 border-gray-200 text-[#2d3436]"} border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00b894] font-mono`}
                />
                <p className={`text-xs ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"} mt-1`}>
                    Example:{" "}
                    <span className={`font-mono ${darkMode ? "text-[#e8eaf0]" : "text-[#2d3436]"}`}>{provider.example}</span>
                </p>
            </div>

            {provider.needsKey && (
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <label className={`text-xs ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"} flex items-center gap-1`}>
                            <Key size={12} />
                            API Key
                        </label>
                        {provider.keyUrl && (
                            <a
                                href={provider.keyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#00b894] hover:underline"
                            >
                                Get key →
                            </a>
                        )}
                    </div>
                    <div className="relative">
                        <input
                            type={showKey ? "text" : "password"}
                            value={config[keyKey] || ""}
                            onChange={(e) => onChange(keyKey, e.target.value)}
                            placeholder="Paste your API key here"
                            className={`w-full ${darkMode ? "bg-[#232938]/50 border-white/10 text-[#e8eaf0]" : "bg-gray-100 border-gray-200 text-[#2d3436]"} border rounded px-2 py-1.5 pr-16 text-xs focus:outline-none focus:border-[#00b894] font-mono`}
                        />
                        <button
                            onClick={() => setShowKey((v) => !v)}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${darkMode ? "text-[#7b82a0] hover:text-[#e8eaf0]" : "text-[#636e72] hover:text-[#2d3436]"}`}
                        >
                            {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                </div>
            )}

            {!provider.needsKey && (
                <p className={`text-xs ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>
                    No API key needed. Make sure Ollama is running at{" "}
                    <span className={`font-mono ${darkMode ? "text-[#e8eaf0]" : "text-[#2d3436]"}`}>http://localhost:11434</span>
                </p>
            )}
        </motion.div>
    );
}

export default function Settings({ addToast, darkMode = true }) {
    const [config, setConfig] = useState({
        vision_model: "",
        vision_api_key: "",
        analysis_model: "",
        analysis_api_key: "",
    });
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios
            .get(`${API}/config`)
            .then((res) => {
                setConfig(res.data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                if (addToast) addToast("Failed to load settings", "error");
            });
    }, [addToast]);

    function handleChange(key, value) {
        setSaved(false);
        setConfig((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSave() {
        setError(null);
        try {
            await axios.post(`${API}/config`, config);
            setSaved(true);
            if (addToast) addToast("Settings saved successfully", "success");
        } catch {
            setError("Failed to save settings.");
            if (addToast) addToast("Failed to save settings", "error");
        }
    }

    if (loading) {
        return <FormSkeleton />;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-lg font-semibold">Settings</h1>

            <ModelSection
                title="Vision Model"
                modelKey="vision_model"
                keyKey="vision_api_key"
                config={config}
                onChange={handleChange}
                darkMode={darkMode}
            />

            <ModelSection
                title="Analysis Model"
                modelKey="analysis_model"
                keyKey="analysis_api_key"
                config={config}
                onChange={handleChange}
                darkMode={darkMode}
            />

            <motion.div 
                className={`bg-[${darkMode ? "1a1f2e" : "white"}]/80 backdrop-blur-xl border ${darkMode ? "border-white/10" : "border-gray-200"} rounded-lg p-6 space-y-4`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
            >
                <h2 className="text-sm font-semibold">Analysis Settings</h2>
                <div>
                    <div className="flex items-center gap-1 mb-1">
                        <label className={`block text-xs ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>
                            Max output tokens
                        </label>
                        <Tooltip text="Maximum response length generated by the AI" darkMode={darkMode}>
                            <HelpCircle size={12} className={darkMode ? "text-[#7b82a0]" : "text-[#636e72]"} />
                        </Tooltip>
                    </div>
                    <input
                        type="number"
                        value={config.analysis_max_tokens || 1000}
                        onChange={(e) => handleChange("analysis_max_tokens", Number(e.target.value))}
                        min={256}
                        max={8192}
                        step={256}
                        className={`w-32 ${darkMode ? "bg-[#232938]/50 border-white/10 text-[#e8eaf0]" : "bg-gray-100 border-gray-200 text-[#2d3436]"} border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00b894]`}
                    />
                    <p className={`text-xs ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"} mt-1`}>
                        Groq free tier: 1000 · Gemini Flash: 8192 · Local models: unlimited
                    </p>
                </div>
            </motion.div>

            <div className="flex items-center gap-4">
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-[#00b894] text-[#0f1117] text-xs font-semibold rounded hover:bg-[#00a884] transition-colors flex items-center gap-2"
                >
                    <SaveIcon size={14} />
                    Save settings
                </button>
                {saved && <p className="text-xs text-[#00b894]">Settings saved.</p>}
                {error && <p className="text-xs text-[#e17055]">{error}</p>}
            </div>

            <motion.div 
                className={`bg-[${darkMode ? "1a1f2e" : "white"}]/80 backdrop-blur-xl border ${darkMode ? "border-white/10" : "border-gray-200"} rounded-lg p-6`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.2 }}
            >
                <h2 className="text-sm font-semibold mb-3">Quick reference</h2>
                <div className="space-y-2">
                    {PROVIDERS.map((p) => (
                        <div key={p.label} className="flex items-start gap-3 text-xs">
                            <span className={`${darkMode ? "text-[#e8eaf0]" : "text-[#2d3436]"} w-32 shrink-0 font-medium`}>{p.label}</span>
                            <span className={`font-mono ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>{p.example}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}