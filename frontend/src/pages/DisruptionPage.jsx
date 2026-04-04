import { useKubera } from "../context/KuberaContext";
import ActionButton from "../components/ui/ActionButton";
import FormField from "../components/ui/FormField";
import SectionCard from "../components/ui/SectionCard";
import ToggleField from "../components/ui/ToggleField";

const inputClass =
  "w-full rounded-xl border border-[#e6e1d6] bg-white px-3 py-2 text-sm text-slate-900 shadow-[0_6px_12px_-10px_rgba(15,23,42,0.45)] focus:border-[#2d4db4] focus:outline-none focus:ring-2 focus:ring-[#e8efff]";

export default function DisruptionPage() {
  const {
    scenarios,
    activeScenario,
    applyScenario,
    disruptionForm,
    setDisruptionForm,
    zoneOptions,
    toTitleCase,
    reportDisruption,
    runAutomationMonitor,
    lastDisruptionEvent,
    lastAutoClaims,
    loading,
  } = useKubera();

  const setValue = (key) => (event) => {
    setDisruptionForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <SectionCard
        title="Scenario Presets"
        subtitle="Apply one of the backend-driven disruption presets instantly."
        className="bg-[#fffdf8]"
      >
        <div className="grid gap-2">
          {scenarios.map((scenario) => {
            const active = scenario.id === activeScenario;
            return (
              <button
                key={scenario.id}
                type="button"
                className={`rounded-2xl border px-3 py-2 text-left text-sm shadow-[0_8px_18px_-14px_rgba(15,23,42,0.55)] transition ${
                  active
                    ? "border-[#bfcaef] bg-[#edf2ff] text-[#223987]"
                    : "border-[#e6e2d8] bg-white text-slate-700 hover:bg-[#faf8f2]"
                }`}
                onClick={() => applyScenario(scenario)}
              >
                <p className="font-semibold">{scenario.name}</p>
                <p className="text-xs text-slate-600">{scenario.description}</p>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        index="03"
        title="Disruption Reporter"
        subtitle="Real-time trigger monitoring with automatic claim initiation."
        className="bg-[#fffdf8]"
      >
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            reportDisruption();
          }}
        >
          <FormField label="Zone">
            <select
              className={inputClass}
              value={disruptionForm.zone}
              onChange={setValue("zone")}
            >
              {zoneOptions.map((zone) => (
                <option key={zone.name} value={zone.name}>
                  {toTitleCase(zone.name)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Rainfall mm/hr">
            <input
              className={inputClass}
              type="number"
              value={disruptionForm.rainfall_mm_hr}
              onChange={setValue("rainfall_mm_hr")}
            />
          </FormField>

          <FormField label="Heat Index C">
            <input
              className={inputClass}
              type="number"
              value={disruptionForm.heat_index_c}
              onChange={setValue("heat_index_c")}
            />
          </FormField>

          <FormField label="AQI">
            <input
              className={inputClass}
              type="number"
              value={disruptionForm.aqi}
              onChange={setValue("aqi")}
            />
          </FormField>

          <FormField label="Sustained Hours">
            <input
              className={inputClass}
              type="number"
              value={disruptionForm.sustained_hours}
              onChange={setValue("sustained_hours")}
            />
          </FormField>

          <FormField label="Traffic Slowdown Index (0-1)">
            <input
              className={inputClass}
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={disruptionForm.traffic_slowdown_index}
              onChange={setValue("traffic_slowdown_index")}
            />
          </FormField>

          <FormField label="Official Reports">
            <input
              className={inputClass}
              type="number"
              min="0"
              value={disruptionForm.official_reports}
              onChange={setValue("official_reports")}
            />
          </FormField>

          <ToggleField
            label="Curfew Active"
            checked={disruptionForm.curfew}
            onChange={(event) =>
              setDisruptionForm((prev) => ({ ...prev, curfew: event.target.checked }))
            }
          />

          <ToggleField
            label="Platform Outage"
            checked={disruptionForm.platform_outage}
            onChange={(event) =>
              setDisruptionForm((prev) => ({ ...prev, platform_outage: event.target.checked }))
            }
          />

          <ToggleField
            label="Use Mock Oracle Feeds"
            checked={disruptionForm.use_mock_oracle}
            onChange={(event) =>
              setDisruptionForm((prev) => ({ ...prev, use_mock_oracle: event.target.checked }))
            }
          />

          <ToggleField
            label="Auto-initiate claims"
            checked={disruptionForm.auto_initiate_claims}
            onChange={(event) =>
              setDisruptionForm((prev) => ({ ...prev, auto_initiate_claims: event.target.checked }))
            }
          />

          <div className="flex flex-wrap gap-2">
            <ActionButton type="submit" disabled={loading}>
              Report Disruption
            </ActionButton>
            <ActionButton
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => runAutomationMonitor([disruptionForm.zone])}
            >
              Run Zone Monitor Scan
            </ActionButton>
          </div>

          <div className="rounded-xl border border-[#e8e4da] bg-white p-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-800">Latest event</p>
            <p>
              Event: {lastDisruptionEvent?.id ? `#${lastDisruptionEvent.id}` : "No event yet"}
            </p>
            <p>
              Trigger active: {lastDisruptionEvent?.is_active ? "Yes" : "No"}
            </p>
            <p>
              Auto claims created: {lastAutoClaims?.created || 0}
            </p>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
