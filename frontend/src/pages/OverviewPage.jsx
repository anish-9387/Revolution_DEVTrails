import { useNavigate } from "react-router-dom";
import { useKubera, toTitleCase } from "../context/KuberaContext";
import ActionButton from "../components/ui/ActionButton";
import SectionCard from "../components/ui/SectionCard";

function summaryTile(label, value, hint) {
  return (
    <article
      key={label}
      className="rounded-xl border border-[#e6e2d8] bg-white p-3 shadow-[0_10px_18px_-16px_rgba(15,23,42,0.45)]"
    >
      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-600">{hint}</p>
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
    claims,
    applyScenario,
    loadFirstScenario,
  } = useKubera();

  const latestStatus = claimResult?.decision?.status || "No claim yet";
  const previewScenarios = scenarios.slice(0, 3);
  const recentClaims = claims.slice(0, 4);

  return (
    <div className="grid gap-4">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summaryTile("Coverage zones", meta.zones.length, "Hyper-local risk map")}
        {summaryTile("Trigger presets", scenarios.length, "Manual + automated")}
        {summaryTile("Worker onboarded", worker ? "Yes" : "No", "Registration flow")}
        {summaryTile("Latest claim", latestStatus, "Decision engine output")}
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <SectionCard
          title="Your Upcoming Trigger Watchlist"
          subtitle="Simulate disruption patterns and launch zero-touch claim processing."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {previewScenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="rounded-xl border border-[#e7e3d9] bg-white p-3"
              >
                <p className="font-semibold text-slate-900">{scenario.name}</p>
                <p className="mt-1 text-xs text-slate-600">{scenario.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-[#f2f0e8] px-2 py-1 text-[11px] font-semibold text-slate-600">
                    Weekly parametric
                  </span>
                  <ActionButton variant="ghost" onClick={() => applyScenario(scenario)}>
                    Load
                  </ActionButton>
                </div>
              </div>
            ))}

            {!previewScenarios.length ? (
              <p className="rounded-xl border border-dashed border-[#dfdbd0] px-3 py-2 text-sm text-slate-600">
                Trigger presets will appear when API metadata loads.
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <ActionButton type="button" onClick={() => navigate("/worker")}>Register Worker</ActionButton>
            <ActionButton type="button" variant="secondary" onClick={loadFirstScenario}>
              Quick Load Scenario
            </ActionButton>
            <ActionButton type="button" variant="ghost" onClick={() => navigate("/policy")}>
              Open Policy Ops
            </ActionButton>
          </div>
        </SectionCard>

        <SectionCard
          title="Current Session"
          subtitle="Operational status for onboarding, pricing, and claim flow."
        >
          <dl className="space-y-2 text-sm">
            <div className="rounded-lg border border-[#ece8de] bg-white p-3">
              <dt className="font-semibold text-slate-700">Worker</dt>
              <dd className="text-slate-600">
                {worker
                  ? `${worker.full_name} (${worker.platform})`
                  : "No worker registered"}
              </dd>
            </div>
            <div className="rounded-lg border border-[#ece8de] bg-white p-3">
              <dt className="font-semibold text-slate-700">Primary Zone</dt>
              <dd className="text-slate-600">
                {worker?.primary_zone ? toTitleCase(worker.primary_zone) : "Not available"}
              </dd>
            </div>
            <div className="rounded-lg border border-[#ece8de] bg-white p-3">
              <dt className="font-semibold text-slate-700">Subscription</dt>
              <dd className="text-slate-600">
                {subscription?.active ? `Active #${subscription.id}` : "Not active"}
              </dd>
            </div>
            <div className="rounded-lg border border-[#ece8de] bg-white p-3">
              <dt className="font-semibold text-slate-700">Suggested Next Step</dt>
              <dd className="text-slate-600">
                {worker ? "Run trigger scan or submit claim" : "Start from Worker page"}
              </dd>
            </div>
          </dl>
        </SectionCard>
      </div>

      <SectionCard
        title="In-Progress Learning Content"
        subtitle="Operational feed of coverage actions, pricing runs, and claim decisions."
      >
        <div className="space-y-2">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-2 rounded-lg border border-[#e9e4d9] bg-[#f9f7f1] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>Module</span>
            <span>Status</span>
            <span>Count</span>
            <span>Cadence</span>
            <span />
          </div>

          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] items-center gap-2 rounded-lg border border-[#ece8de] bg-white px-3 py-2 text-sm text-slate-700">
            <span>Worker onboarding</span>
            <span>{worker ? "Complete" : "Pending"}</span>
            <span>{worker ? 1 : 0}</span>
            <span>Weekly</span>
            <ActionButton variant="ghost" onClick={() => navigate("/worker")}>Open</ActionButton>
          </div>

          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] items-center gap-2 rounded-lg border border-[#ece8de] bg-white px-3 py-2 text-sm text-slate-700">
            <span>Policy lifecycle</span>
            <span>{subscription?.active ? "Active" : "Pending"}</span>
            <span>{subscription?.id ? 1 : 0}</span>
            <span>Weekly premium</span>
            <ActionButton variant="ghost" onClick={() => navigate("/policy")}>Open</ActionButton>
          </div>

          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] items-center gap-2 rounded-lg border border-[#ece8de] bg-white px-3 py-2 text-sm text-slate-700">
            <span>Claims processed</span>
            <span>{latestStatus}</span>
            <span>{claims.length}</span>
            <span>Real-time</span>
            <ActionButton variant="ghost" onClick={() => navigate("/claims")}>Open</ActionButton>
          </div>

          {recentClaims.map((claim) => (
            <div
              key={claim.id}
              className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] items-center gap-2 rounded-lg border border-[#ece8de] bg-white px-3 py-2 text-sm text-slate-700"
            >
              <span>Claim #{claim.id.slice(0, 8)}</span>
              <span>{claim.status}</span>
              <span>{claim.tier}</span>
              <span>INR {claim.final_payout}</span>
              <ActionButton variant="ghost" onClick={() => navigate("/claims")}>View</ActionButton>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
