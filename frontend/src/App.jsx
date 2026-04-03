import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const INITIAL_WORKER_FORM = {
  full_name: "",
  phone: "",
  platform: "Zomato",
  home_city: "Mumbai",
  primary_zone: "mumbai-central",
  weekly_income: 5500,
  clean_months: 6,
  active_start_hour: 8,
  active_end_hour: 22,
  device_fingerprint: "device-kubera-001",
};

const INITIAL_QUOTE_FORM = {
  hours_active_per_week: 45,
  historical_disruption_factor: 1,
};

const INITIAL_DISRUPTION_FORM = {
  zone: "mumbai-central",
  rainfall_mm_hr: 0,
  heat_index_c: 0,
  aqi: 0,
  curfew: false,
  sustained_hours: 1,
  official_reports: 2,
  source: "manual-simulator",
};

const INITIAL_CLAIM_FORM = {
  zone: "mumbai-central",
  movement_profile: "normal",
  orders_accepted: 8,
  orders_completed: 7,
  accel_variance: 1.2,
  gyro_variance: 0.8,
  wifi_match: true,
  cell_match: true,
  ip_geo_match: true,
  rooted: false,
  emulator: false,
  environmental_alignment: true,
};

const INITIAL_REVALIDATION_FORM = {
  otp_code: "",
  in_app_check_in: true,
  device_confirmed: true,
};

function numericValue(value, fallback = 0) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return parsed;
}

function toTitleCase(text) {
  return text
    .replaceAll("-", " ")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildGpsTrace(profile, zone, zoneMap) {
  const anchor = zoneMap[zone] || { lat: 19.076, lon: 72.8777 };
  const now = Date.now();

  if (profile === "teleport") {
    return [
      {
        lat: anchor.lat - 0.4,
        lon: anchor.lon - 0.35,
        timestamp: new Date(now - 30 * 1000).toISOString(),
      },
      {
        lat: anchor.lat,
        lon: anchor.lon,
        timestamp: new Date(now).toISOString(),
      },
    ];
  }

  if (profile === "static") {
    return [
      {
        lat: anchor.lat,
        lon: anchor.lon,
        timestamp: new Date(now - 8 * 60 * 1000).toISOString(),
      },
      {
        lat: anchor.lat + 0.0002,
        lon: anchor.lon + 0.0002,
        timestamp: new Date(now).toISOString(),
      },
    ];
  }

  return [
    {
      lat: anchor.lat - 0.01,
      lon: anchor.lon - 0.01,
      timestamp: new Date(now - 8 * 60 * 1000).toISOString(),
    },
    {
      lat: anchor.lat - 0.004,
      lon: anchor.lon - 0.003,
      timestamp: new Date(now - 4 * 60 * 1000).toISOString(),
    },
    {
      lat: anchor.lat,
      lon: anchor.lon,
      timestamp: new Date(now).toISOString(),
    },
  ];
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const message = payload.error || payload.message || "Request failed";
    throw new Error(message);
  }

  return payload;
}

export default function App() {
  const [meta, setMeta] = useState({ zones: [], platforms: [] });
  const [scenarios, setScenarios] = useState([]);
  const [workerForm, setWorkerForm] = useState(INITIAL_WORKER_FORM);
  const [quoteForm, setQuoteForm] = useState(INITIAL_QUOTE_FORM);
  const [disruptionForm, setDisruptionForm] = useState(INITIAL_DISRUPTION_FORM);
  const [claimForm, setClaimForm] = useState(INITIAL_CLAIM_FORM);
  const [revalidationForm, setRevalidationForm] = useState(INITIAL_REVALIDATION_FORM);

  const [worker, setWorker] = useState(null);
  const [quote, setQuote] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [claimResult, setClaimResult] = useState(null);
  const [claims, setClaims] = useState([]);

  const [activeScenario, setActiveScenario] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const zoneMap = useMemo(() => {
    return Object.fromEntries(meta.zones.map((zone) => [zone.name, zone]));
  }, [meta.zones]);

  useEffect(() => {
    async function bootstrap() {
      setLoading(true);
      setError("");

      try {
        const [metaResponse, scenarioResponse] = await Promise.all([
          api("/api/meta"),
          api("/api/scenarios"),
        ]);

        setMeta(metaResponse);
        setScenarios(scenarioResponse.scenarios || []);

        if (metaResponse.platforms?.length) {
          setWorkerForm((prev) => ({ ...prev, platform: metaResponse.platforms[0] }));
        }

        if (metaResponse.zones?.length) {
          const firstZone = metaResponse.zones[0].name;
          setWorkerForm((prev) => ({ ...prev, primary_zone: firstZone }));
          setDisruptionForm((prev) => ({ ...prev, zone: firstZone }));
          setClaimForm((prev) => ({ ...prev, zone: firstZone }));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, []);

  useEffect(() => {
    if (!worker?.id) {
      return;
    }

    fetchClaims(worker.id);
  }, [worker?.id]);

  function resetMessages() {
    setError("");
    setNotice("");
  }

  async function fetchClaims(workerId) {
    try {
      const data = await api(`/api/claims?worker_id=${workerId}`);
      setClaims(data.claims || []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function onRegisterWorker(event) {
    event.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const response = await api("/api/workers/register", {
        method: "POST",
        body: JSON.stringify({
          ...workerForm,
          weekly_income: numericValue(workerForm.weekly_income, 5000),
          clean_months: numericValue(workerForm.clean_months, 0),
          active_start_hour: numericValue(workerForm.active_start_hour, 8),
          active_end_hour: numericValue(workerForm.active_end_hour, 22),
        }),
      });

      setWorker(response.worker);
      setSubscription(null);
      setQuote(null);
      setClaimResult(null);
      setClaims([]);
      setNotice("Worker registered successfully.");

      setClaimForm((prev) => ({
        ...prev,
        zone: response.worker.primary_zone,
      }));

      setDisruptionForm((prev) => ({
        ...prev,
        zone: response.worker.primary_zone,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function onQuotePremium() {
    if (!worker?.id) {
      setError("Register a worker first.");
      return;
    }

    resetMessages();
    setLoading(true);

    try {
      const response = await api(`/api/workers/${worker.id}/quote`, {
        method: "POST",
        body: JSON.stringify({
          ...quoteForm,
          weekly_income: numericValue(worker.weekly_income, 5000),
          zones: worker.usual_zones,
        }),
      });

      setQuote(response);
      setNotice("Premium quote generated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function onSubscribe() {
    if (!worker?.id) {
      setError("Register a worker first.");
      return;
    }

    resetMessages();
    setLoading(true);

    try {
      const response = await api(`/api/workers/${worker.id}/subscribe`, {
        method: "POST",
        body: JSON.stringify({
          ...quoteForm,
          weekly_income: numericValue(worker.weekly_income, 5000),
          zones: worker.usual_zones,
        }),
      });

      setSubscription(response.subscription);
      setNotice("Subscription activated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function onReportDisruption(event) {
    event.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      await api("/api/disruptions/report", {
        method: "POST",
        body: JSON.stringify({
          ...disruptionForm,
          rainfall_mm_hr: numericValue(disruptionForm.rainfall_mm_hr),
          heat_index_c: numericValue(disruptionForm.heat_index_c),
          aqi: numericValue(disruptionForm.aqi),
          sustained_hours: numericValue(disruptionForm.sustained_hours, 1),
          official_reports: numericValue(disruptionForm.official_reports, 0),
        }),
      });
      setNotice("Disruption event reported.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function applyScenario(scenario) {
    setActiveScenario(scenario.id);

    const workingZone = worker?.primary_zone || disruptionForm.zone || claimForm.zone;

    setDisruptionForm((prev) => ({
      ...prev,
      zone: workingZone,
      ...scenario.disruption,
    }));

    const overrides = scenario.claim_overrides || {};
    setClaimForm((prev) => ({
      ...prev,
      zone: workingZone,
      movement_profile: overrides.movement_profile || prev.movement_profile,
      orders_accepted:
        overrides.platform_activity?.orders_accepted ?? prev.orders_accepted,
      orders_completed:
        overrides.platform_activity?.orders_completed ?? prev.orders_completed,
      accel_variance: overrides.motion?.accel_variance ?? prev.accel_variance,
      gyro_variance: overrides.motion?.gyro_variance ?? prev.gyro_variance,
      wifi_match: overrides.network?.wifi_match ?? prev.wifi_match,
      cell_match: overrides.network?.cell_match ?? prev.cell_match,
      ip_geo_match: overrides.network?.ip_geo_match ?? prev.ip_geo_match,
      rooted: overrides.device?.rooted ?? prev.rooted,
      emulator: overrides.device?.emulator ?? prev.emulator,
      environmental_alignment:
        overrides.environmental_alignment ?? prev.environmental_alignment,
    }));

    setNotice(`Scenario loaded: ${scenario.name}`);
    setError("");
  }

  async function onSubmitClaim(event) {
    event.preventDefault();

    if (!worker?.id) {
      setError("Register a worker first.");
      return;
    }

    if (!subscription?.active) {
      setError("Activate a subscription before submitting claims.");
      return;
    }

    resetMessages();
    setLoading(true);

    const payload = {
      worker_id: worker.id,
      zone: claimForm.zone,
      movement_profile: claimForm.movement_profile,
      claim_timestamp: new Date().toISOString(),
      gps_history: buildGpsTrace(claimForm.movement_profile, claimForm.zone, zoneMap),
      environmental_alignment: claimForm.environmental_alignment,
      platform_activity: {
        orders_accepted: numericValue(claimForm.orders_accepted),
        orders_completed: numericValue(claimForm.orders_completed),
      },
      motion: {
        accel_variance: numericValue(claimForm.accel_variance, 1.2),
        gyro_variance: numericValue(claimForm.gyro_variance, 0.8),
      },
      network: {
        wifi_match: claimForm.wifi_match,
        cell_match: claimForm.cell_match,
        ip_geo_match: claimForm.ip_geo_match,
      },
      device: {
        rooted: claimForm.rooted,
        emulator: claimForm.emulator,
        session_device_id: worker.device_fingerprint || "session-device-default",
      },
    };

    try {
      const response = await api("/api/claims/submit", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setClaimResult(response);
      setRevalidationForm(INITIAL_REVALIDATION_FORM);
      setNotice(`Claim submitted with status: ${response.decision.status}`);
      fetchClaims(worker.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function onRevalidate(event) {
    event.preventDefault();
    if (!claimResult?.claim?.id) {
      return;
    }

    resetMessages();
    setLoading(true);

    try {
      const response = await api(`/api/claims/${claimResult.claim.id}/revalidate`, {
        method: "POST",
        body: JSON.stringify(revalidationForm),
      });

      setClaimResult((prev) => ({
        ...prev,
        claim: response.claim,
        decision: {
          status: response.claim.status,
          tier: response.claim.tier,
          risk_score: response.claim.risk_score,
          timeline_minutes: 0,
          otp_required: response.claim.otp_required,
        },
        ledger_entries: response.ledger_entries || prev.ledger_entries,
      }));

      setNotice(`Revalidation result: ${response.result}`);
      fetchClaims(worker.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const decisionClass =
    claimResult?.decision?.status === "approved"
      ? "good"
      : claimResult?.decision?.status === "manual_review"
      ? "danger"
      : "warn";

  return (
    <div className="shell">
      <header className="hero panel">
        <div>
          <p className="eyebrow">KuberaAI Demo Console</p>
          <h1>Trustless Parametric Insurance for Gig Workers</h1>
          <p>
            Register worker, quote premium, simulate disruption, submit claim, and
            run revalidation for all fairness tiers.
          </p>
        </div>
        <div className="hero-meta">
          <div>
            <span>API</span>
            <strong>{API_BASE}</strong>
          </div>
          <div>
            <span>Zones</span>
            <strong>{meta.zones.length}</strong>
          </div>
          <div>
            <span>Scenarios</span>
            <strong>{scenarios.length}</strong>
          </div>
        </div>
      </header>

      {(error || notice || loading) && (
        <section className="panel status-strip">
          {loading && <p className="loading">Processing...</p>}
          {error && <p className="error">{error}</p>}
          {notice && <p className="notice">{notice}</p>}
        </section>
      )}

      <section className="grid two-cols">
        <article className="panel">
          <h2>1. Worker Registration</h2>
          <form className="form" onSubmit={onRegisterWorker}>
            <label>
              Full Name
              <input
                value={workerForm.full_name}
                onChange={(event) =>
                  setWorkerForm((prev) => ({ ...prev, full_name: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Phone
              <input
                value={workerForm.phone}
                onChange={(event) =>
                  setWorkerForm((prev) => ({ ...prev, phone: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Platform
              <select
                value={workerForm.platform}
                onChange={(event) =>
                  setWorkerForm((prev) => ({ ...prev, platform: event.target.value }))
                }
              >
                {meta.platforms.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Home City
              <input
                value={workerForm.home_city}
                onChange={(event) =>
                  setWorkerForm((prev) => ({ ...prev, home_city: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Primary Zone
              <select
                value={workerForm.primary_zone}
                onChange={(event) =>
                  setWorkerForm((prev) => ({ ...prev, primary_zone: event.target.value }))
                }
              >
                {meta.zones.map((zone) => (
                  <option key={zone.name} value={zone.name}>
                    {toTitleCase(zone.name)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Weekly Income (INR)
              <input
                type="number"
                min="1000"
                value={workerForm.weekly_income}
                onChange={(event) =>
                  setWorkerForm((prev) => ({ ...prev, weekly_income: event.target.value }))
                }
              />
            </label>
            <label>
              Clean Months History
              <input
                type="number"
                min="0"
                value={workerForm.clean_months}
                onChange={(event) =>
                  setWorkerForm((prev) => ({ ...prev, clean_months: event.target.value }))
                }
              />
            </label>
            <label>
              Device Fingerprint
              <input
                value={workerForm.device_fingerprint}
                onChange={(event) =>
                  setWorkerForm((prev) => ({ ...prev, device_fingerprint: event.target.value }))
                }
              />
            </label>
            <button type="submit">Register Worker</button>
          </form>
        </article>

        <article className="panel">
          <h2>2. Premium & Subscription</h2>
          <div className="form">
            <label>
              Hours Active / Week
              <input
                type="number"
                min="1"
                value={quoteForm.hours_active_per_week}
                onChange={(event) =>
                  setQuoteForm((prev) => ({
                    ...prev,
                    hours_active_per_week: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Historical Disruption Factor
              <input
                type="number"
                min="0.6"
                max="1.6"
                step="0.1"
                value={quoteForm.historical_disruption_factor}
                onChange={(event) =>
                  setQuoteForm((prev) => ({
                    ...prev,
                    historical_disruption_factor: event.target.value,
                  }))
                }
              />
            </label>
            <div className="button-row">
              <button type="button" onClick={onQuotePremium}>
                Generate Quote
              </button>
              <button type="button" className="accent" onClick={onSubscribe}>
                Activate Subscription
              </button>
            </div>
          </div>

          <div className="result-card">
            <h3>Current Worker</h3>
            {!worker && <p>No worker registered yet.</p>}
            {worker && (
              <div>
                <p>
                  <strong>{worker.full_name}</strong> on {worker.platform}
                </p>
                <p>
                  Zone: {toTitleCase(worker.primary_zone)} | Weekly income: INR {worker.weekly_income}
                </p>
              </div>
            )}
            {quote && (
              <p>
                Quoted weekly premium: <strong>INR {quote.weekly_premium}</strong>
              </p>
            )}
            {subscription?.active && (
              <p className="good">Active subscription #{subscription.id}</p>
            )}
          </div>
        </article>
      </section>

      <section className="grid two-cols">
        <article className="panel">
          <h2>3. Disruption Simulator</h2>
          <div className="scenario-grid">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                className={scenario.id === activeScenario ? "active" : ""}
                onClick={() => applyScenario(scenario)}
              >
                {scenario.name}
              </button>
            ))}
          </div>

          <form className="form" onSubmit={onReportDisruption}>
            <label>
              Zone
              <select
                value={disruptionForm.zone}
                onChange={(event) =>
                  setDisruptionForm((prev) => ({ ...prev, zone: event.target.value }))
                }
              >
                {meta.zones.map((zone) => (
                  <option key={zone.name} value={zone.name}>
                    {toTitleCase(zone.name)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Rainfall mm/hr
              <input
                type="number"
                value={disruptionForm.rainfall_mm_hr}
                onChange={(event) =>
                  setDisruptionForm((prev) => ({
                    ...prev,
                    rainfall_mm_hr: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Heat Index C
              <input
                type="number"
                value={disruptionForm.heat_index_c}
                onChange={(event) =>
                  setDisruptionForm((prev) => ({
                    ...prev,
                    heat_index_c: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              AQI
              <input
                type="number"
                value={disruptionForm.aqi}
                onChange={(event) =>
                  setDisruptionForm((prev) => ({ ...prev, aqi: event.target.value }))
                }
              />
            </label>
            <label>
              Sustained Hours
              <input
                type="number"
                value={disruptionForm.sustained_hours}
                onChange={(event) =>
                  setDisruptionForm((prev) => ({
                    ...prev,
                    sustained_hours: event.target.value,
                  }))
                }
              />
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={disruptionForm.curfew}
                onChange={(event) =>
                  setDisruptionForm((prev) => ({ ...prev, curfew: event.target.checked }))
                }
              />
              Curfew Active
            </label>
            <button type="submit" className="accent">
              Report Disruption
            </button>
          </form>
        </article>

        <article className="panel">
          <h2>4. Claim Submission</h2>
          <form className="form" onSubmit={onSubmitClaim}>
            <label>
              Claim Zone
              <select
                value={claimForm.zone}
                onChange={(event) =>
                  setClaimForm((prev) => ({ ...prev, zone: event.target.value }))
                }
              >
                {meta.zones.map((zone) => (
                  <option key={zone.name} value={zone.name}>
                    {toTitleCase(zone.name)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Movement Profile
              <select
                value={claimForm.movement_profile}
                onChange={(event) =>
                  setClaimForm((prev) => ({ ...prev, movement_profile: event.target.value }))
                }
              >
                <option value="normal">Normal</option>
                <option value="static">Static</option>
                <option value="teleport">Teleport</option>
              </select>
            </label>
            <label>
              Orders Accepted
              <input
                type="number"
                value={claimForm.orders_accepted}
                onChange={(event) =>
                  setClaimForm((prev) => ({ ...prev, orders_accepted: event.target.value }))
                }
              />
            </label>
            <label>
              Orders Completed
              <input
                type="number"
                value={claimForm.orders_completed}
                onChange={(event) =>
                  setClaimForm((prev) => ({ ...prev, orders_completed: event.target.value }))
                }
              />
            </label>
            <label>
              Accelerometer Variance
              <input
                type="number"
                step="0.1"
                value={claimForm.accel_variance}
                onChange={(event) =>
                  setClaimForm((prev) => ({ ...prev, accel_variance: event.target.value }))
                }
              />
            </label>
            <label>
              Gyroscope Variance
              <input
                type="number"
                step="0.1"
                value={claimForm.gyro_variance}
                onChange={(event) =>
                  setClaimForm((prev) => ({ ...prev, gyro_variance: event.target.value }))
                }
              />
            </label>

            <div className="toggle-row">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={claimForm.wifi_match}
                  onChange={(event) =>
                    setClaimForm((prev) => ({ ...prev, wifi_match: event.target.checked }))
                  }
                />
                WiFi Match
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={claimForm.cell_match}
                  onChange={(event) =>
                    setClaimForm((prev) => ({ ...prev, cell_match: event.target.checked }))
                  }
                />
                Cell Match
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={claimForm.ip_geo_match}
                  onChange={(event) =>
                    setClaimForm((prev) => ({ ...prev, ip_geo_match: event.target.checked }))
                  }
                />
                IP Geo Match
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={claimForm.rooted}
                  onChange={(event) =>
                    setClaimForm((prev) => ({ ...prev, rooted: event.target.checked }))
                  }
                />
                Rooted Device
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={claimForm.emulator}
                  onChange={(event) =>
                    setClaimForm((prev) => ({ ...prev, emulator: event.target.checked }))
                  }
                />
                Emulator
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={claimForm.environmental_alignment}
                  onChange={(event) =>
                    setClaimForm((prev) => ({
                      ...prev,
                      environmental_alignment: event.target.checked,
                    }))
                  }
                />
                Environmental Alignment
              </label>
            </div>

            <button type="submit" className="danger">
              Submit Claim
            </button>
          </form>
        </article>
      </section>

      <section className="grid two-cols">
        <article className="panel">
          <h2>5. Decision & Fairness Transparency</h2>
          {!claimResult && <p>No claim submitted yet.</p>}
          {claimResult && (
            <div className="result-card">
              <p className={`badge ${decisionClass}`}>
                {claimResult.decision.tier} | {claimResult.decision.status}
              </p>
              <p>
                Risk score: <strong>{claimResult.decision.risk_score}</strong>
              </p>
              <p>
                Base payout: INR <strong>{claimResult.claim.base_payout}</strong>
              </p>
              <p>
                Final payout: INR <strong>{claimResult.claim.final_payout}</strong>
              </p>
              <p>
                Bridge loan: INR <strong>{claimResult.claim.bridge_loan}</strong>
              </p>
              {claimResult.claim.hold_reason && <p>{claimResult.claim.hold_reason}</p>}
              {claimResult.debug_otp && (
                <p>
                  Debug OTP for local demo: <strong>{claimResult.debug_otp}</strong>
                </p>
              )}
            </div>
          )}

          {claimResult?.decision?.otp_required && (
            <form className="form" onSubmit={onRevalidate}>
              <h3>Revalidation</h3>
              <label>
                OTP Code
                <input
                  value={revalidationForm.otp_code}
                  onChange={(event) =>
                    setRevalidationForm((prev) => ({
                      ...prev,
                      otp_code: event.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={revalidationForm.in_app_check_in}
                  onChange={(event) =>
                    setRevalidationForm((prev) => ({
                      ...prev,
                      in_app_check_in: event.target.checked,
                    }))
                  }
                />
                In-app check-in completed
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={revalidationForm.device_confirmed}
                  onChange={(event) =>
                    setRevalidationForm((prev) => ({
                      ...prev,
                      device_confirmed: event.target.checked,
                    }))
                  }
                />
                Device attestation confirmed
              </label>
              <button type="submit" className="accent">
                Submit Revalidation
              </button>
            </form>
          )}
        </article>

        <article className="panel">
          <h2>6. Recent Claims</h2>
          {!claims.length && <p>No claims yet.</p>}
          {!!claims.length && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Claim ID</th>
                    <th>Status</th>
                    <th>Tier</th>
                    <th>Risk</th>
                    <th>Base</th>
                    <th>Final</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim.id}>
                      <td>{claim.id.slice(0, 8)}</td>
                      <td>{claim.status}</td>
                      <td>{claim.tier}</td>
                      <td>{claim.risk_score}</td>
                      <td>{claim.base_payout}</td>
                      <td>{claim.final_payout}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
