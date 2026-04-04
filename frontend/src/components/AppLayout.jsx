import { NavLink } from "react-router-dom";
import { useKubera } from "../context/KuberaContext";
import StatusBanner from "./ui/StatusBanner";

const navItems = [
  { to: "/", label: "Overview" },
  { to: "/worker", label: "Worker & Premium" },
  { to: "/disruption", label: "Disruption" },
  { to: "/claims", label: "Claims" },
];

function navClass({ isActive }) {
  return isActive
    ? "rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-[0_8px_16px_-10px_rgba(59,130,246,0.9)]"
    : "rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900";
}

function statusDotClass(apiStatus) {
  if (apiStatus === "online") {
    return "bg-emerald-500";
  }
  if (apiStatus === "offline") {
    return "bg-rose-500";
  }
  return "bg-amber-500";
}

export default function AppLayout({ children }) {
  const { apiStatus, apiDisplayLabel, loading, error, notice } = useKubera();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      <div className="pointer-events-none absolute -left-16 -top-20 h-72 w-72 rounded-full bg-sky-300/45 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 rounded-full bg-amber-300/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-300/25 blur-3xl" />

      <header className="sticky top-0 z-20 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/85 px-4 py-3 shadow-[0_14px_34px_-18px_rgba(15,23,42,0.6)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                KuberaAI
              </p>
              <h1 className="font-display text-xl font-bold text-slate-900">
                Insurance Console
              </h1>
            </div>

            <nav className="flex flex-wrap gap-1 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-1">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={navClass} end={item.to === "/"}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="min-w-[180px] rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-xs text-slate-600">
              <p className="inline-flex items-center gap-2 font-semibold text-slate-700">
                <span className={`h-2.5 w-2.5 rounded-full ${statusDotClass(apiStatus)}`} />
                API: {apiStatus}
              </p>
              <p className="truncate">{apiDisplayLabel}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-7xl gap-4 px-4 py-5 pb-10">
        <StatusBanner loading={loading} error={error} notice={notice} />
        {children}
      </main>
    </div>
  );
}
