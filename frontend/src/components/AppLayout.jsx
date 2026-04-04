import { NavLink } from "react-router-dom";
import { useKubera } from "../context/KuberaContext";
import RightInsightsPanel from "./RightInsightsPanel";
import StatusBanner from "./ui/StatusBanner";

const navItems = [
  { to: "/", label: "Overview", icon: "OV" },
  { to: "/worker", label: "Worker", icon: "WK" },
  { to: "/disruption", label: "Trigger", icon: "TR" },
  { to: "/policy", label: "Policy", icon: "PL" },
  { to: "/claims", label: "Claims", icon: "CL" },
];

function navClass({ isActive }) {
  return isActive
    ? "rounded-xl bg-[#111d4a] px-3 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_-12px_rgba(17,29,74,0.85)]"
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
  const { apiStatus, apiDisplayLabel, loading, error, notice, worker, meta, scenarios } = useKubera();
  const firstName = worker?.full_name?.split(" ")?.[0] || "Partner";

  return (
    <div className="min-h-screen bg-[#d8d7d1] p-3 font-sans text-slate-900 md:p-5">
      <div className="mx-auto w-full max-w-[1360px] rounded-[28px] border border-[#cbc8be] bg-[#f4f3ee] shadow-[0_30px_60px_-36px_rgba(15,23,42,0.45)]">
        <div className="grid min-h-[88vh] grid-cols-1 xl:grid-cols-[88px_minmax(0,1fr)_320px]">
          <aside className="hidden border-r border-[#dfddd3] bg-[#f8f7f2] px-3 py-5 xl:flex xl:flex-col xl:items-center xl:justify-between">
            <div className="space-y-6">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#ff6b2d] to-[#ff8e3d] text-sm font-bold text-white">
                KA
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <NavLink key={item.to} to={item.to} className="group block" end={item.to === "/"}>
                    {({ isActive }) => (
                      <span
                        className={`grid h-11 w-11 place-items-center rounded-xl border text-[11px] font-bold transition ${
                          isActive
                            ? "border-transparent bg-[#273c97] text-white"
                            : "border-[#ddd9cf] bg-white text-slate-500 group-hover:border-[#c7c3b8]"
                        }`}
                        title={item.label}
                      >
                        {item.icon}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="space-y-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-[#ddd9cf] bg-white text-[10px] font-semibold text-slate-500">
                CFG
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-200 to-cyan-200 text-xs font-bold text-slate-700">
                {firstName.slice(0, 2).toUpperCase()}
              </div>
            </div>
          </aside>

          <section className="p-4 md:p-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900 md:text-3xl">
                  Good Morning, {firstName}
                </h1>
                <p className="text-sm text-slate-600">
                  Weekly income protection with zero-touch parametric payouts.
                </p>
              </div>

              <div className="rounded-full border border-[#e0ddd3] bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-[0_10px_18px_-16px_rgba(15,23,42,0.6)]">
                Ask AI
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-xl border border-[#e0ddd4] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                Weekly Pricing
              </span>
              <span className="rounded-xl border border-[#e0ddd4] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                {meta.zones.length} Zones
              </span>
              <span className="rounded-xl border border-[#e0ddd4] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                {scenarios.length} Trigger Presets
              </span>
              <span className="rounded-xl border border-[#e0ddd4] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                Income Loss Only
              </span>
            </div>

            <div className="mb-4 rounded-2xl border border-[#e0ddd4] bg-white px-3 py-2 text-xs text-slate-600">
              <p className="inline-flex items-center gap-2 font-semibold text-slate-700">
                <span className={`h-2.5 w-2.5 rounded-full ${statusDotClass(apiStatus)}`} />
                API: {apiStatus}
              </p>
              <p className="truncate">{apiDisplayLabel}</p>
            </div>

            <div className="mb-4 xl:hidden">
              <nav className="flex flex-wrap gap-1 rounded-2xl border border-[#ddd9cf] bg-[#f8f7f3] p-1">
                {navItems.map((item) => (
                  <NavLink key={item.to} to={item.to} className={navClass} end={item.to === "/"}>
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <StatusBanner loading={loading} error={error} notice={notice} />
            <div className="mt-4">{children}</div>
          </section>

          <aside className="hidden border-l border-[#dfddd3] bg-[#f8f7f2] p-4 xl:block">
            <RightInsightsPanel />
          </aside>

          <aside className="border-t border-[#dfddd3] bg-[#f8f7f2] p-4 xl:hidden">
            <RightInsightsPanel />
          </aside>
        </div>
      </div>
    </div>
  );
}
