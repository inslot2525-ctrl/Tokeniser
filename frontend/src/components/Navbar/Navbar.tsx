import { Sparkles, Settings, BarChart3, Zap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const NAV = [
  { label: "Dashboard", path: "/dashboard", icon: BarChart3 },
  { label: "Optimizer",  path: "/optimizer",  icon: Zap },
  { label: "Settings",   path: "/settings",   icon: Settings },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
            <Sparkles size={16} className="text-white" />
          </div>
          <div className="leading-none">
            <p className="text-sm font-bold text-white">TokenWise</p>
            <p className="text-[10px] text-gray-500">AI Prompt Optimizer</p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {NAV.map(({ label, path, icon: Icon }) => {
            const active = pathname === path || (path === "/dashboard" && pathname === "/");
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-orange-500/15 text-orange-400"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
