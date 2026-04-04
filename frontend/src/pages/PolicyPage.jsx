import { useState } from "react";
import { useKubera } from "../context/KuberaContext";
import ActionButton from "../components/ui/ActionButton";
import SectionCard from "../components/ui/SectionCard";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

export default function PolicyPage() {
  const {
    worker,
    subscription,
    policies,
    policyCoverage,
    zoneOptions,
    loading,
    cancelPolicy,
    runAutomationMonitor,
    monitorSummary,
  } = useKubera();

  const [selectedZones, setSelectedZones] = useState([]);

  const toggleZone = (zoneName) => {
    setSelectedZones((prev) => {
      if (prev.includes(zoneName)) {
        return prev.filter((item) => item !== zoneName);
      }
      return [...prev, zoneName];
    });
  };

  const monitorRuns = monitorSummary?.runs || [];

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <SectionCard
          index="P1"
          title="Insurance Policy Management"
          subtitle="Manage weekly policy lifecycle and enforce income-loss-only coverage."
          className="bg-[#fffdf8]"
        >
          {!worker ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Register a worker first to create and manage policies.
            </p>
          ) : null}

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-[#e8e4da] bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Active policy</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {subscription?.active ? `#${subscription.id}` : "No active policy"}
              </p>
              <p className="text-sm text-slate-600">
                Weekly premium: INR {subscription?.weekly_premium || 0}
              </p>
              <p className="text-sm text-slate-600">Started: {formatDate(subscription?.started_at)}</p>

              {subscription?.active ? (
                <ActionButton
                  type="button"
                  variant="danger"
                  className="mt-3"
                  disabled={loading}
                  onClick={() => cancelPolicy(subscription.id)}
                >
                  Cancel Active Policy
                </ActionButton>
              ) : null}
            </div>

            <div className="rounded-xl border border-[#e8e4da] bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Coverage scope</p>
              <p className="mt-1 text-sm font-semibold text-emerald-700">Income Loss Only</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">Excluded</p>
              <ul className="mt-1 space-y-1 text-sm text-slate-600">
                {(policyCoverage?.excluded || ["health", "life", "accidents", "vehicle_repairs"]).map(
                  (item) => (
                    <li key={item}>- {item}</li>
                  )
                )}
              </ul>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-[#e8e4da]">
            <table className="min-w-full divide-y divide-[#ebe7dd] text-sm">
              <thead className="bg-[#f8f5ed] text-left text-slate-700">
                <tr>
                  <th className="px-3 py-2 font-semibold">Policy ID</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Weekly Premium</th>
                  <th className="px-3 py-2 font-semibold">Started</th>
                  <th className="px-3 py-2 font-semibold">Ended</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1eee5] bg-white text-slate-700">
                {policies.map((policy) => (
                  <tr key={policy.id}>
                    <td className="px-3 py-2">#{policy.id}</td>
                    <td className="px-3 py-2">{policy.active ? "Active" : "Inactive"}</td>
                    <td className="px-3 py-2">INR {policy.weekly_premium}</td>
                    <td className="px-3 py-2">{formatDate(policy.started_at)}</td>
                    <td className="px-3 py-2">{formatDate(policy.ended_at)}</td>
                  </tr>
                ))}
                {!policies.length ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                      No policies found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          index="P2"
          title="Automated Trigger Monitor"
          subtitle="Run 3-5 parametric trigger checks with mock integrations and auto-initiate claims."
          className="bg-[#fffdf8]"
        >
          <div className="rounded-xl border border-[#e8e4da] bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Select zones</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {zoneOptions.map((zone) => (
                <label
                  key={zone.name}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#ece8df] px-2 py-1.5 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedZones.includes(zone.name)}
                    onChange={() => toggleZone(zone.name)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  {zone.name}
                </label>
              ))}
            </div>

            <ActionButton
              type="button"
              className="mt-3"
              disabled={loading}
              onClick={() => runAutomationMonitor(selectedZones)}
            >
              Run Monitor And Auto-Trigger Claims
            </ActionButton>
          </div>

          <div className="mt-4 rounded-xl border border-[#e8e4da] bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Latest monitor result</p>
            <p className="text-sm text-slate-700">
              Zones processed: {monitorSummary?.zones_processed || 0}
            </p>
            <p className="text-sm text-slate-700">
              Auto claims created: {monitorSummary?.auto_claims_created || 0}
            </p>
          </div>

          <div className="mt-3 space-y-2">
            {monitorRuns.slice(0, 6).map((run) => (
              <div key={`${run.zone}-${run.event?.id}`} className="rounded-xl border border-[#ebe7dd] bg-white p-3 text-sm">
                <p className="font-semibold text-slate-800">{run.zone}</p>
                <p className="text-slate-600">
                  Trigger active: {run.event?.is_active ? "Yes" : "No"} | Auto claims: {run.auto_claims?.created || 0}
                </p>
              </div>
            ))}

            {!monitorRuns.length ? (
              <p className="rounded-xl border border-dashed border-[#dedad0] px-3 py-2 text-sm text-slate-500">
                No monitor runs yet.
              </p>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
