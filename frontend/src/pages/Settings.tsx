import { useState } from "react";
import toast from "react-hot-toast";
import Card from "../components/Common/Card";
import Button from "../components/Common/Button";
import { getDashboard } from "../services/api";
import type { DashboardStats } from "../types/api";

export default function Settings() {
  const [backendUrl, setBackendUrl] = useState("http://127.0.0.1:8000");
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Connection */}
      <Card>
        <h2 className="text-base font-semibold text-white">Backend Connection</h2>
        <p className="mt-1 text-sm text-gray-500">
          Configure the FastAPI backend URL. Start the server with{" "}
          <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-orange-300">
            uvicorn app.main:app --reload
          </code>
        </p>

        <div className="mt-4 flex gap-3">
          <input
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-white outline-none focus:border-orange-400/50"
          />
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
              { label: "Routes",           value: Object.keys(stats.route_distribution ?? {}).join(", ") || "—" },
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
        <div className="mt-4 space-y-2">
          {[
            { method: "POST", path: "/agent",          desc: "Full optimization pipeline" },
            { method: "POST", path: "/optimize",       desc: "Token compression" },
            { method: "POST", path: "/enhance",        desc: "Grammar & clarity" },
            { method: "POST", path: "/smart-optimize", desc: "Gemini-powered optimization" },
            { method: "POST", path: "/tokenize",       desc: "Count tokens in a prompt" },
            { method: "POST", path: "/detect-risk",    desc: "Jailbreak detection" },
            { method: "POST", path: "/route",          desc: "Route to optimal model" },
            { method: "GET",  path: "/dashboard",      desc: "Analytics dashboard data" },
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
