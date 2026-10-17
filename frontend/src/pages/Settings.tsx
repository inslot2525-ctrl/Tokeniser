import { useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import Card from "../components/Common/Card";
import Button from "../components/Common/Button";
import { useSettings } from "../context/SettingsContext";
import { API_URL, getDashboard } from "../services/api";
import type { DashboardStats, Mode } from "../types/api";

function maskKey(key: string) {
  return key.length > 8 ? `${key.slice(0, 4)}…${key.slice(-4)}` : "••••";
}

export default function Settings() {
  const { mode, setMode, geminiKey, rememberKey, saveGeminiKey, clearGeminiKey } = useSettings();
  const [draftKey, setDraftKey] = useState("");
  const [remember, setRemember] = useState(rememberKey);
  const [showKey, setShowKey] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  async function testConnection() {
    setLoading(true);
    try {
      const data = await getDashboard();
      setStats(data);
      toast.success("Backend connected");
    } catch {
      setStats(null);
      toast.error("Cannot reach backend — make sure it is running");
    } finally {
      setLoading(false);
    }
  }

  function handleSaveKey() {
    if (!draftKey.trim()) return;
    saveGeminiKey(draftKey, remember);
    setDraftKey("");
    setShowKey(false);
    toast.success("Gemini key saved");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Mode + key */}
      <Card>
        <h2 className="text-base font-semibold text-white">Mode</h2>
        <p className="mt-1 text-sm text-gray-500">
          Free mode uses rules and local models only and never calls Gemini. AI mode uses
          Gemini with your own API key, so you control the cost.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {([
            { value: "free", title: "Free", body: "Rule-based compression and answer checks. Answers come from Ollama when it's running; otherwise you get the optimized prompt to use anywhere." },
            { value: "ai", title: "AI (your Gemini key)", body: "Adds Gemini answers for hard prompts, the LLM judge, and escalation when a local answer fails a check." },
          ] as { value: Mode; title: string; body: string }[]).map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              aria-pressed={mode === m.value}
              className={`rounded-2xl border p-4 text-left transition ${
                mode === m.value
                  ? "border-orange-500/60 bg-orange-500/10"
                  : "border-white/10 bg-black/30 hover:border-white/20"
              }`}
            >
              <p className="text-sm font-semibold text-white">{m.title}</p>
              <p className="mt-1 text-xs leading-5 text-gray-400">{m.body}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 border-t border-white/10 pt-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <KeyRound size={15} /> Gemini API key
          </h3>

          {geminiKey ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <code className="rounded-lg bg-white/5 px-3 py-2 text-sm text-gray-300">
                {maskKey(geminiKey)}
              </code>
              <span className="text-xs text-gray-500">
                {rememberKey ? "Remembered on this device" : "Kept until you close this tab"}
              </span>
              <Button variant="ghost" onClick={() => { clearGeminiKey(); toast("Key removed"); }}>
                Remove
              </Button>
            </div>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              Get a free key from{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-orange-400 hover:underline"
              >
                Google AI Studio
              </a>
              .
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-3">
            <div className="relative min-w-0 flex-1">
              <input
                type={showKey ? "text" : "password"}
                value={draftKey}
                onChange={(e) => setDraftKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveKey()}
                placeholder={geminiKey ? "Replace key…" : "Paste your Gemini API key"}
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 pr-10 text-sm text-white outline-none focus:border-orange-400/50"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                aria-label={showKey ? "Hide key" : "Show key"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Button onClick={handleSaveKey} disabled={!draftKey.trim()}>
              Save key
            </Button>
          </div>

          <label className="mt-3 flex items-center gap-2 text-xs text-gray-400">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="accent-orange-500"
            />
            Remember on this device (otherwise it's cleared when you close the tab)
          </label>

          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-gray-500">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-400" />
            Your key stays in this browser and is sent only to this app's backend, with AI-mode
            requests. The backend uses it for that request and never stores or logs it.
          </p>
        </div>
      </Card>

      {/* Connection */}
      <Card>
        <h2 className="text-base font-semibold text-white">Backend Connection</h2>
        <p className="mt-1 text-sm text-gray-500">
          This build talks to the backend below (set with <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-orange-300">VITE_API_URL</code>).
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <code className="min-w-0 flex-1 truncate rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-gray-300">
            {API_URL || "(not set)"}
          </code>
          <Button onClick={testConnection} disabled={loading}>
            {loading ? "Testing…" : "Test Connection"}
          </Button>
        </div>

        {/* Live stats */}
        {stats && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total Requests",   value: stats.total_requests },
              { label: "Tokens Saved",     value: stats.total_tokens_saved?.toLocaleString() },
              { label: "Avg Savings",      value: `${stats.avg_savings_percent?.toFixed(1)}%` },
              { label: "Net After Overhead", value: stats.net_tokens_saved?.toLocaleString() },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="mt-1 text-xl font-bold text-white">{s.value ?? "—"}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* API Endpoints */}
      <Card>
        <h2 className="text-base font-semibold text-white">API Endpoints</h2>
        <p className="mt-1 text-xs text-gray-500">
          POST bodies take <code className="text-orange-300">{'{ "prompt": "...", "mode": "free" | "ai" }'}</code>. AI mode reads the key from the <code className="text-orange-300">X-Gemini-Key</code> header.
        </p>
        <div className="mt-4 space-y-2">
          {[
            { method: "POST", path: "/agent",       desc: "Full pipeline" },
            { method: "POST", path: "/compress",    desc: "Local compression + metrics (no model)" },
            { method: "POST", path: "/enhance",     desc: "Grammar & clarity (needs a model)" },
            { method: "POST", path: "/tokenize",    desc: "Count tokens in a prompt" },
            { method: "POST", path: "/detect-risk", desc: "Jailbreak detection" },
            { method: "GET",  path: "/dashboard",   desc: "Analytics dashboard data" },
          ].map((e) => (
            <div
              key={e.path}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/30 px-4 py-3"
            >
              <span className={`w-14 shrink-0 rounded px-2 py-0.5 text-center text-xs font-bold ${
                e.method === "POST" ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400"
              }`}>
                {e.method}
              </span>
              <code className="text-sm text-gray-300">{e.path}</code>
              <span className="ml-auto text-xs text-gray-600">{e.desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
