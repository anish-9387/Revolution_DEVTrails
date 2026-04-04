import { useNavigate } from "react-router-dom";
import { useKubera } from "../context/KuberaContext";
import ActionButton from "../components/ui/ActionButton";
import FormField from "../components/ui/FormField";
import SectionCard from "../components/ui/SectionCard";

const inputClass =
  "w-full rounded-xl border border-[#e6e1d6] bg-white px-3 py-2 text-sm text-slate-900 shadow-[0_6px_12px_-10px_rgba(15,23,42,0.45)] focus:border-[#2d4db4] focus:outline-none focus:ring-2 focus:ring-[#e8efff]";

export default function WorkerPage() {
  const navigate = useNavigate();
  const {
    workerForm,
    setWorkerForm,
    quoteForm,
    setQuoteForm,
    platformOptions,
    zoneOptions,
    worker,
    quote,
    subscription,
    loading,
    registerWorker,
    quotePremium,
    subscribe,
    toTitleCase,
  } = useKubera();

  const setWorkerValue = (key) => (event) => {
    setWorkerForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const setQuoteValue = (key) => (event) => {
    setQuoteForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SectionCard
        index="01"
        title="Worker Registration"
        subtitle="Optimized onboarding for gig workers and delivery personas."
        className="bg-[#fffdf8]"
      >
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            registerWorker();
          }}
        >
          <FormField label="Full Name">
            <input
              className={inputClass}
              value={workerForm.full_name}
              onChange={setWorkerValue("full_name")}
              required
            />
          </FormField>

          <FormField label="Phone">
            <input
              className={inputClass}
              value={workerForm.phone}
              onChange={setWorkerValue("phone")}
              required
            />
          </FormField>

          <FormField label="Platform">
            <select
              className={inputClass}
              value={workerForm.platform}
              onChange={setWorkerValue("platform")}
            >
              {platformOptions.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Home City">
            <input
              className={inputClass}
              value={workerForm.home_city}
              onChange={setWorkerValue("home_city")}
              required
            />
          </FormField>

          <FormField label="Primary Zone">
            <select
              className={inputClass}
              value={workerForm.primary_zone}
              onChange={setWorkerValue("primary_zone")}
            >
              {zoneOptions.map((zone) => (
                <option key={zone.name} value={zone.name}>
                  {toTitleCase(zone.name)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Weekly Income (INR)">
            <input
              className={inputClass}
              type="number"
              min="1000"
              value={workerForm.weekly_income}
              onChange={setWorkerValue("weekly_income")}
            />
          </FormField>

          <FormField label="Clean Months History">
            <input
              className={inputClass}
              type="number"
              min="0"
              value={workerForm.clean_months}
              onChange={setWorkerValue("clean_months")}
            />
          </FormField>

          <FormField label="Device Fingerprint">
            <input
              className={inputClass}
              value={workerForm.device_fingerprint}
              onChange={setWorkerValue("device_fingerprint")}
            />
          </FormField>

          <FormField label="Shift Start Hour">
            <input
              className={inputClass}
              type="number"
              min="0"
              max="23"
              value={workerForm.active_start_hour}
              onChange={setWorkerValue("active_start_hour")}
            />
          </FormField>

          <FormField label="Shift End Hour">
            <input
              className={inputClass}
              type="number"
              min="0"
              max="23"
              value={workerForm.active_end_hour}
              onChange={setWorkerValue("active_end_hour")}
            />
          </FormField>

          <ActionButton type="submit" disabled={loading} className="md:col-span-2">
            Register Worker
          </ActionButton>
        </form>
      </SectionCard>

      <SectionCard
        index="02"
        title="Premium & Subscription"
        subtitle="Dynamic weekly premium using AI risk factors and activity cadence."
        className="bg-[#fffdf8]"
      >
        <div className="grid gap-3">
          <FormField label="Hours Active Per Week">
            <input
              className={inputClass}
              type="number"
              min="1"
              value={quoteForm.hours_active_per_week}
              onChange={setQuoteValue("hours_active_per_week")}
            />
          </FormField>

          <FormField label="Historical Disruption Factor">
            <input
              className={inputClass}
              type="number"
              min="0.6"
              max="1.6"
              step="0.1"
              value={quoteForm.historical_disruption_factor}
              onChange={setQuoteValue("historical_disruption_factor")}
            />
          </FormField>

          <div className="flex flex-wrap gap-2">
            <ActionButton type="button" variant="secondary" onClick={quotePremium} disabled={loading}>
              Generate Quote
            </ActionButton>
            <ActionButton type="button" onClick={subscribe} disabled={loading}>
              Activate Subscription
            </ActionButton>
            <ActionButton type="button" variant="ghost" onClick={() => navigate("/policy")}>Policy Ops</ActionButton>
          </div>

          <div className="rounded-2xl border border-[#e8e4da] bg-white p-3 text-sm text-slate-700 shadow-[0_10px_20px_-16px_rgba(15,23,42,0.45)]">
            <h3 className="mb-2 font-display text-base font-semibold text-slate-900">Worker Snapshot</h3>
            {!worker ? <p>No worker registered yet.</p> : null}
            {worker ? (
              <>
                <p>
                  <span className="font-semibold">{worker.full_name}</span> on {worker.platform}
                </p>
                <p>
                  {toTitleCase(worker.primary_zone)} zone | Weekly income INR {worker.weekly_income}
                </p>
              </>
            ) : null}

            {quote ? (
              <div className="mt-2 space-y-1 rounded-lg border border-[#ece8de] bg-[#faf8f2] p-2">
                <p>
                  Weekly premium: <span className="font-semibold">INR {quote.weekly_premium}</span>
                </p>
                <p className="text-xs text-slate-600">
                  Zone risk: {quote.breakdown?.zone_risk_score} | Hours factor: {quote.breakdown?.hours_factor}
                </p>
              </div>
            ) : null}

            {subscription?.active ? (
              <p className="mt-2 font-semibold text-emerald-700">
                Subscription active: #{subscription.id}
              </p>
            ) : null}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
