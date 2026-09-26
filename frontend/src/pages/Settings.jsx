import { useState, useEffect } from "react";
import axios from "axios";

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

function ModelSection({ title, modelKey, keyKey, config, onChange }) {
  const provider = detectProvider(config[modelKey]);
  const [showKey, setShowKey] = useState(false);

  function handleProviderChange(e) {
    const selected = PROVIDERS.find((p) => p.label === e.target.value);
    onChange(modelKey, selected.example);
    if (!selected.needsKey) onChange(keyKey, "");
  }

  return (
    <div className="bg-[#1a1f2e] border border-[#2d3448] rounded-lg p-6 space-y-4">
      <h2 className="text-sm font-semibold">{title}</h2>

      <div>
        <label className="block text-xs text-[#7b82a0] mb-1">Provider</label>
        <select
          value={provider.label}
          onChange={handleProviderChange}
          className="w-full bg-[#232938] border border-[#2d3448] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00b894]"
        >
          {PROVIDERS.map((p) => (
            <option key={p.label} value={p.label}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-[#7b82a0] mb-1">Model</label>
        <input
          value={config[modelKey] || ""}
          onChange={(e) => onChange(modelKey, e.target.value)}
          className="w-full bg-[#232938] border border-[#2d3448] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00b894] font-mono"
        />
        <p className="text-xs text-[#7b82a0] mt-1">
          Example:{" "}
          <span className="font-mono text-[#e8eaf0]">{provider.example}</span>
        </p>
      </div>

      {provider.needsKey && (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className="text-xs text-[#7b82a0]">API Key</label>
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
              className="w-full bg-[#232938] border border-[#2d3448] rounded px-2 py-1.5 pr-16 text-xs focus:outline-none focus:border-[#00b894] font-mono"
            />
            <button
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#7b82a0] hover:text-[#e8eaf0]"
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
        </div>
      )}

      {!provider.needsKey && (
        <p className="text-xs text-[#7b82a0]">
          No API key needed. Make sure Ollama is running at{" "}
          <span className="font-mono text-[#e8eaf0]">http://localhost:11434</span>
        </p>
      )}
    </div>
  );
}

export default function Settings() {
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
      .catch(() => setLoading(false));
  }, []);

  function handleChange(key, value) {
    setSaved(false);
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setError(null);
    try {
      await axios.post(`${API}/config`, config);
      setSaved(true);
    } catch {
      setError("Failed to save settings.");
    }
  }

  if (loading) {
    return <p className="text-xs text-[#7b82a0]">Loading...</p>;
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
      />

      <ModelSection
        title="Analysis Model"
        modelKey="analysis_model"
        keyKey="analysis_api_key"
        config={config}
        onChange={handleChange}
      />

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#00b894] text-[#0f1117] text-xs font-semibold rounded hover:bg-[#00a884] transition-colors"
        >
          Save settings
        </button>
        {saved && <p className="text-xs text-[#00b894]">Settings saved.</p>}
        {error && <p className="text-xs text-[#e17055]">{error}</p>}
      </div>

      <div className="bg-[#1a1f2e] border border-[#2d3448] rounded-lg p-6">
        <h2 className="text-sm font-semibold mb-3">Quick reference</h2>
        <div className="space-y-2">
          {PROVIDERS.map((p) => (
            <div key={p.label} className="flex items-start gap-3 text-xs">
              <span className="text-[#e8eaf0] w-32 shrink-0">{p.label}</span>
              <span className="font-mono text-[#7b82a0]">{p.example}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}