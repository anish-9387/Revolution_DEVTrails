import { useKubera } from "../context/KuberaContext";
import ActionButton from "../components/ui/ActionButton";
import FormField from "../components/ui/FormField";
import SectionCard from "../components/ui/SectionCard";
import ToggleField from "../components/ui/ToggleField";

const inputClass =
  "w-full rounded-xl border border-slate-300/90 bg-white/95 px-3 py-2 text-sm text-slate-900 shadow-[0_6px_14px_-10px_rgba(15,23,42,0.45)] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

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
        className="bg-gradient-to-br from-white to-indigo-50"
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
                    ? "border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-900"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
        subtitle="Send manual weather and zone conditions to the backend."
        className="bg-gradient-to-br from-white to-emerald-50"
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

          <ToggleField
            label="Curfew Active"
            checked={disruptionForm.curfew}
            onChange={(event) =>
              setDisruptionForm((prev) => ({ ...prev, curfew: event.target.checked }))
            }
          />

          <ActionButton type="submit" disabled={loading}>
            Report Disruption
          </ActionButton>
        </form>
      </SectionCard>
    </div>
  );
}
