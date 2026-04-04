import { useKubera, toTitleCase } from "../context/KuberaContext";

function claimDistribution(claims) {
  if (!claims.length) {
    return {
      approved: 0,
      held: 0,
      review: 0,
      approvedPct: 34,
      heldPct: 33,
      reviewPct: 33,
    };
  }

  const approved = claims.filter((item) => item.status === "approved").length;
  const held = claims.filter((item) => ["held_revalidation", "queued"].includes(item.status)).length;
  const review = claims.length - approved - held;

  const approvedPct = Math.round((approved / claims.length) * 100);
  const heldPct = Math.round((held / claims.length) * 100);
  const reviewPct = Math.max(0, 100 - approvedPct - heldPct);

  return {
    approved,
    held,
    review,
    approvedPct,
    heldPct,
    reviewPct,
  };
}

function initials(value) {
  if (!value) {
    return "GW";
  }

  const parts = value
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!parts.length) {
    return "GW";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function metric(label, value) {
  return (
    <div className="rounded-xl border border-[#e8e5dd] bg-white px-3 py-2 text-center">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

export default function RightInsightsPanel() {
  const { worker, policies, claims, approvedClaimsCount } = useKubera();

  const dist = claimDistribution(claims);
  const activePolicyCount = policies.filter((item) => item.active).length;

  const activeHours = worker
    ? Math.max(
        0,
        Number(worker.active_window?.end_hour || 0) - Number(worker.active_window?.start_hour || 0)
      )
    : 0;

  const ringStyle = {
    background: `conic-gradient(#7bcf4f 0 ${dist.approvedPct}%, #f8b44e ${dist.approvedPct}% ${dist.approvedPct + dist.heldPct}%, #89aef6 ${dist.approvedPct + dist.heldPct}% 100%)`,
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#e3e0d7] bg-[#fcfbf8] p-4 shadow-[0_12px_26px_-20px_rgba(15,23,42,0.45)]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-blue-100 text-lg font-bold text-slate-700">
          {initials(worker?.full_name)}
        </div>
        <h2 className="mt-3 text-center font-display text-lg font-semibold text-slate-900">
          {worker?.full_name || "Delivery Partner"}
        </h2>
        <p className="text-center text-sm text-slate-600">
          {worker?.primary_zone ? toTitleCase(worker.primary_zone) : "Register worker to personalize"}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {metric("Claims", claims.length)}
          {metric("Active Policy", activePolicyCount)}
          {metric("Approved", approvedClaimsCount)}
        </div>
      </section>

      <section className="rounded-2xl border border-[#e3e0d7] bg-[#fcfbf8] p-4 shadow-[0_12px_26px_-20px_rgba(15,23,42,0.45)]">
        <div className="flex items-center justify-between text-sm">
          <p className="font-semibold text-slate-700">Activity</p>
          <p className="rounded-full bg-[#f1efe8] px-2 py-1 text-xs font-semibold text-slate-600">
            {activeHours}h shift
          </p>
        </div>

        <div className="relative mx-auto mt-4 h-36 w-36 rounded-full" style={ringStyle}>
          <div className="absolute inset-[18px] grid place-items-center rounded-full bg-[#fcfbf8] text-center">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Claims</p>
            <p className="text-2xl font-bold text-slate-900">{claims.length}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-xs text-slate-600">
          <p className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#7bcf4f]" /> Approved
            </span>
            <span>{dist.approved}</span>
          </p>
          <p className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f8b44e]" /> Revalidation / Queue
            </span>
            <span>{dist.held}</span>
          </p>
          <p className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#89aef6]" /> Manual review
            </span>
            <span>{dist.review}</span>
          </p>
        </div>
      </section>
    </div>
  );
}
