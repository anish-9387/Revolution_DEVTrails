import { useNavigate } from "react-router-dom";
import { useKubera, toTitleCase } from "../context/KuberaContext";
import ActionButton from "../components/ui/ActionButton";
import SectionCard from "../components/ui/SectionCard";

function metricCard(label, value, help, tone) {
  const tones = {
    blue: "border-cyan-200/90 bg-gradient-to-br from-cyan-50 to-blue-50",
    amber: "border-amber-200/90 bg-gradient-to-br from-amber-50 to-orange-50",
    emerald: "border-emerald-200/90 bg-gradient-to-br from-emerald-50 to-lime-50",
    violet: "border-indigo-200/90 bg-gradient-to-br from-indigo-50 to-violet-50",
  };

  return (
    <article
      key={label}
      className={`rounded-2xl border p-4 shadow-[0_10px_22px_-16px_rgba(15,23,42,0.45)] ${tones[tone] || tones.blue}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-600">{help}</p>
    </article>
  );
}

export default function OverviewPage() {
  const navigate = useNavigate();
  const {
    meta,
    scenarios,
    worker,
    subscription,
    claimResult,
    applyScenario,
    loadFirstScenario,
  } = useKubera();

  const latestStatus = claimResult?.decision?.status || "No claim yet";

  return (
    <div className="grid gap-4">
      <SectionCard
        title="Simplified Multi-Page Workflow"
        subtitle="Navigate each step cleanly: register worker, simulate disruption, then process claim."
        className="overflow-hidden border-transparent bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-[0_20px_40px_-24px_rgba(37,99,235,0.85)]"
      >
        <div className="mb-4 max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
            Parametric Insurance Journey
          </p>
          <h2 className="font-display text-2xl font-bold leading-tight text-white md:text-3xl">
            Design faster operations for worker trust, premium pricing, and claim clarity.
          </h2>
          <p className="text-sm text-blue-100 md:text-base">
            Every route is now focused. Worker setup, disruption reporting, and claims are split
            into clean pages while sharing the same backend session state.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={() => navigate("/worker")} className="bg-white text-blue-700 hover:bg-blue-50">
            Start worker setup
          </ActionButton>
          <ActionButton variant="ghost" onClick={loadFirstScenario} className="border-white/40 bg-white/20 text-white hover:bg-white/30">
            Load first demo scenario
          </ActionButton>
          <ActionButton variant="secondary" onClick={() => navigate("/claims")} className="bg-slate-900/80 text-white hover:bg-slate-900">
            Open claims page
          </ActionButton>
        </div>
      </SectionCard>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCard("Coverage zones", meta.zones.length, "Risk mapped zones", "blue")}
        {metricCard("Scenario presets", scenarios.length, "One-click disruption states", "amber")}
        {metricCard("Worker registered", worker ? "Yes" : "No", "Profile required before quote", "emerald")}
        {metricCard("Latest claim status", latestStatus, "Realtime decision from backend", "violet")}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Scenario Quick Actions"
          subtitle="Apply any scenario, then switch to Disruption or Claims pages."
          className="bg-gradient-to-br from-white to-blue-50"
        >
          <div className="space-y-2">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="rounded-2xl border border-slate-200/90 bg-white/90 p-3 shadow-[0_8px_18px_-14px_rgba(15,23,42,0.55)]"
              >
                <p className="font-semibold text-slate-900">{scenario.name}</p>
                <p className="text-sm text-slate-600">{scenario.description}</p>
                <div className="mt-2">
                  <ActionButton variant="ghost" onClick={() => applyScenario(scenario)}>
                    Apply scenario
                  </ActionButton>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Current Session Snapshot"
          subtitle="Shared state stays synced across all pages."
          className="bg-gradient-to-br from-white to-emerald-50"
        >
          <dl className="space-y-2 text-sm">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <dt className="font-semibold text-slate-700">Worker</dt>
              <dd className="text-slate-600">
                {worker
                  ? `${worker.full_name} (${worker.platform})`
                  : "No worker registered"}
              </dd>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <dt className="font-semibold text-slate-700">Primary Zone</dt>
              <dd className="text-slate-600">
                {worker?.primary_zone ? toTitleCase(worker.primary_zone) : "Not available"}
              </dd>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <dt className="font-semibold text-slate-700">Subscription</dt>
              <dd className="text-slate-600">
                {subscription?.active ? `Active #${subscription.id}` : "Not active"}
              </dd>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <dt className="font-semibold text-slate-700">Suggested Next Step</dt>
              <dd className="text-slate-600">
                {worker ? "Go to Disruption page" : "Start from Worker & Premium page"}
              </dd>
            </div>
          </dl>
        </SectionCard>
      </div>
    </div>
  );
}
