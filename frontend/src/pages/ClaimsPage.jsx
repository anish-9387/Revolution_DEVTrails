import { useKubera } from "../context/KuberaContext";
import ActionButton from "../components/ui/ActionButton";
import FormField from "../components/ui/FormField";
import SectionCard from "../components/ui/SectionCard";
import ToggleField from "../components/ui/ToggleField";

const inputClass =
  "w-full rounded-xl border border-slate-300/90 bg-white/95 px-3 py-2 text-sm text-slate-900 shadow-[0_6px_14px_-10px_rgba(15,23,42,0.45)] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

function decisionColor(decisionClass) {
  if (decisionClass === "good") {
    return "bg-emerald-600";
  }
  if (decisionClass === "danger") {
    return "bg-rose-600";
  }
  return "bg-amber-500";
}

export default function ClaimsPage() {
  const {
    worker,
    subscription,
    claimForm,
    setClaimForm,
    zoneOptions,
    toTitleCase,
    submitClaim,
    loading,
    claimResult,
    decisionClass,
    riskPercent,
    revalidationForm,
    setRevalidationForm,
    revalidateClaim,
    claims,
  } = useKubera();

  const setClaimValue = (key) => (event) => {
    setClaimForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          index="04"
          title="Claim Submission"
          subtitle="Send motion, device, network, and activity evidence bundle."
          className="bg-gradient-to-br from-white to-orange-50"
        >
          {!worker ? (
            <p className="mb-3 rounded-lg border border-amber-300 bg-amber-50 p-2 text-sm text-amber-800">
              Register a worker first from the Worker & Premium page.
            </p>
          ) : null}

          {worker && !subscription?.active ? (
            <p className="mb-3 rounded-lg border border-amber-300 bg-amber-50 p-2 text-sm text-amber-800">
              Activate a subscription before submitting claims.
            </p>
          ) : null}

          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              submitClaim();
            }}
          >
            <FormField label="Claim Zone">
              <select
                className={inputClass}
                value={claimForm.zone}
                onChange={setClaimValue("zone")}
              >
                {zoneOptions.map((zone) => (
                  <option key={zone.name} value={zone.name}>
                    {toTitleCase(zone.name)}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Movement Profile">
              <select
                className={inputClass}
                value={claimForm.movement_profile}
                onChange={setClaimValue("movement_profile")}
              >
                <option value="normal">Normal</option>
                <option value="static">Static</option>
                <option value="teleport">Teleport</option>
              </select>
            </FormField>

            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Orders Accepted">
                <input
                  className={inputClass}
                  type="number"
                  value={claimForm.orders_accepted}
                  onChange={setClaimValue("orders_accepted")}
                />
              </FormField>

              <FormField label="Orders Completed">
                <input
                  className={inputClass}
                  type="number"
                  value={claimForm.orders_completed}
                  onChange={setClaimValue("orders_completed")}
                />
              </FormField>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Accelerometer Variance">
                <input
                  className={inputClass}
                  type="number"
                  step="0.1"
                  value={claimForm.accel_variance}
                  onChange={setClaimValue("accel_variance")}
                />
              </FormField>

              <FormField label="Gyroscope Variance">
                <input
                  className={inputClass}
                  type="number"
                  step="0.1"
                  value={claimForm.gyro_variance}
                  onChange={setClaimValue("gyro_variance")}
                />
              </FormField>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <ToggleField
                label="WiFi Match"
                checked={claimForm.wifi_match}
                onChange={(event) =>
                  setClaimForm((prev) => ({ ...prev, wifi_match: event.target.checked }))
                }
              />
              <ToggleField
                label="Cell Match"
                checked={claimForm.cell_match}
                onChange={(event) =>
                  setClaimForm((prev) => ({ ...prev, cell_match: event.target.checked }))
                }
              />
              <ToggleField
                label="IP Geo Match"
                checked={claimForm.ip_geo_match}
                onChange={(event) =>
                  setClaimForm((prev) => ({ ...prev, ip_geo_match: event.target.checked }))
                }
              />
              <ToggleField
                label="Rooted Device"
                checked={claimForm.rooted}
                onChange={(event) =>
                  setClaimForm((prev) => ({ ...prev, rooted: event.target.checked }))
                }
              />
              <ToggleField
                label="Emulator"
                checked={claimForm.emulator}
                onChange={(event) =>
                  setClaimForm((prev) => ({ ...prev, emulator: event.target.checked }))
                }
              />
              <ToggleField
                label="Environmental Alignment"
                checked={claimForm.environmental_alignment}
                onChange={(event) =>
                  setClaimForm((prev) => ({
                    ...prev,
                    environmental_alignment: event.target.checked,
                  }))
                }
              />
            </div>

            <ActionButton type="submit" variant="danger" disabled={loading}>
              Submit Claim
            </ActionButton>
          </form>
        </SectionCard>

        <SectionCard
          index="05"
          title="Decision & Revalidation"
          subtitle="Shows trust tier, risk score, payouts, and OTP revalidation flow."
          className="bg-gradient-to-br from-white to-violet-50"
        >
          {!claimResult ? <p className="text-sm text-slate-600">No claim submitted yet.</p> : null}

          {claimResult ? (
            <div className="grid gap-3">
              <span
                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold text-white ${decisionColor(
                  decisionClass
                )}`}
              >
                {claimResult.decision.tier} | {claimResult.decision.status}
              </span>

              <p className="text-sm text-slate-700">
                Risk score: <span className="font-semibold">{claimResult.decision.risk_score}</span>
              </p>

              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"
                  style={{ width: `${riskPercent}%` }}
                />
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-3 text-sm text-slate-700 shadow-[0_10px_20px_-14px_rgba(15,23,42,0.55)]">
                <p>
                  Base payout: <span className="font-semibold">INR {claimResult.claim.base_payout}</span>
                </p>
                <p>
                  Final payout: <span className="font-semibold">INR {claimResult.claim.final_payout}</span>
                </p>
                <p>
                  Bridge loan: <span className="font-semibold">INR {claimResult.claim.bridge_loan}</span>
                </p>
                {claimResult.claim.hold_reason ? <p>{claimResult.claim.hold_reason}</p> : null}
                {claimResult.debug_otp ? (
                  <p>
                    Debug OTP (local): <span className="font-semibold">{claimResult.debug_otp}</span>
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {claimResult?.decision?.otp_required ? (
            <form
              className="mt-4 grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                revalidateClaim();
              }}
            >
              <FormField label="OTP Code">
                <input
                  className={inputClass}
                  value={revalidationForm.otp_code}
                  onChange={(event) =>
                    setRevalidationForm((prev) => ({
                      ...prev,
                      otp_code: event.target.value,
                    }))
                  }
                  required
                />
              </FormField>

              <ToggleField
                label="In-app check-in completed"
                checked={revalidationForm.in_app_check_in}
                onChange={(event) =>
                  setRevalidationForm((prev) => ({
                    ...prev,
                    in_app_check_in: event.target.checked,
                  }))
                }
              />
              <ToggleField
                label="Device attestation confirmed"
                checked={revalidationForm.device_confirmed}
                onChange={(event) =>
                  setRevalidationForm((prev) => ({
                    ...prev,
                    device_confirmed: event.target.checked,
                  }))
                }
              />

              <ActionButton type="submit" disabled={loading}>
                Submit Revalidation
              </ActionButton>
            </form>
          ) : null}
        </SectionCard>
      </div>

      <SectionCard
        index="06"
        title="Recent Claims"
        subtitle="Latest claim records for the active worker session."
        className="bg-gradient-to-br from-white to-cyan-50"
      >
        {!claims.length ? <p className="text-sm text-slate-600">No claims yet.</p> : null}

        {claims.length ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-[0_10px_20px_-16px_rgba(15,23,42,0.55)]">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-700">
                <tr>
                  <th className="px-3 py-2 font-semibold">Claim ID</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Tier</th>
                  <th className="px-3 py-2 font-semibold">Risk</th>
                  <th className="px-3 py-2 font-semibold">Base</th>
                  <th className="px-3 py-2 font-semibold">Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {claims.map((claim) => (
                  <tr key={claim.id}>
                    <td className="px-3 py-2 font-mono text-xs">{claim.id.slice(0, 8)}</td>
                    <td className="px-3 py-2">{claim.status}</td>
                    <td className="px-3 py-2">{claim.tier}</td>
                    <td className="px-3 py-2">{claim.risk_score}</td>
                    <td className="px-3 py-2">{claim.base_payout}</td>
                    <td className="px-3 py-2">{claim.final_payout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
}
