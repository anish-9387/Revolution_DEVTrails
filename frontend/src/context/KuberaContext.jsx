import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const KuberaContext = createContext(null);

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
const API_DISPLAY_LABEL = API_BASE || "same-origin (/api)";

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

export function toTitleCase(text) {
  if (!text) {
    return "";
  }

  return text
    .replaceAll("-", " ")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isConnectivityError(message = "") {
  const normalized = String(message).toLowerCase();
  return (
    normalized.includes("unable to reach backend") ||
    normalized.includes("failed to fetch") ||
    normalized.includes("network")
  );
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
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : "network error";
    throw new Error(`Unable to reach backend. ${reason}`);
  }

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

export function KuberaProvider({ children }) {
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
  const [apiStatus, setApiStatus] = useState("checking");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const zoneMap = useMemo(() => {
    return Object.fromEntries(meta.zones.map((zone) => [zone.name, zone]));
  }, [meta.zones]);

  const zoneOptions = meta.zones.length
    ? meta.zones
    : [{ name: workerForm.primary_zone || "mumbai-central" }];

  const platformOptions = meta.platforms.length
    ? meta.platforms
    : [workerForm.platform || "Zomato"];

  const decisionClass =
    claimResult?.decision?.status === "approved"
      ? "good"
      : claimResult?.decision?.status === "manual_review"
      ? "danger"
      : "warn";

  const riskPercent = claimResult
    ? Math.round(numericValue(claimResult.decision?.risk_score, 0) * 100)
    : 0;

  const firstScenario = scenarios[0] || null;

  const resetMessages = useCallback(() => {
    setError("");
    setNotice("");
  }, []);

  const handleError = useCallback((err) => {
    const message = err instanceof Error ? err.message : String(err);
    setError(message);
    if (isConnectivityError(message)) {
      setApiStatus("offline");
    }
  }, []);

  const fetchClaims = useCallback(
    async (workerId) => {
      try {
        const data = await api(`/api/claims?worker_id=${workerId}`);
        setClaims(data.claims || []);
        setApiStatus("online");
      } catch (err) {
        handleError(err);
      }
    },
    [handleError]
  );

  useEffect(() => {
    async function bootstrap() {
      setLoading(true);
      setError("");

      try {
        const [, metaResponse, scenarioResponse] = await Promise.all([
          api("/api/health"),
          api("/api/meta"),
          api("/api/scenarios"),
        ]);

        setApiStatus("online");
        setMeta(metaResponse);
        setScenarios(scenarioResponse.scenarios || []);

        if (metaResponse.platforms?.length) {
          setWorkerForm((prev) => ({ ...prev, platform: metaResponse.platforms[0] }));
        }

        if (metaResponse.zones?.length) {
          const initialZone = metaResponse.zones[0].name;
          setWorkerForm((prev) => ({ ...prev, primary_zone: initialZone }));
          setDisruptionForm((prev) => ({ ...prev, zone: initialZone }));
          setClaimForm((prev) => ({ ...prev, zone: initialZone }));
        }
      } catch (err) {
        setApiStatus("offline");
        handleError(err);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [handleError]);

  useEffect(() => {
    if (!worker?.id) {
      return;
    }

    fetchClaims(worker.id);
  }, [worker?.id, fetchClaims]);

  const registerWorker = useCallback(async () => {
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
      setApiStatus("online");

      setClaimForm((prev) => ({
        ...prev,
        zone: response.worker.primary_zone,
      }));

      setDisruptionForm((prev) => ({
        ...prev,
        zone: response.worker.primary_zone,
      }));
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError, resetMessages, workerForm]);

  const quotePremium = useCallback(async () => {
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
      setApiStatus("online");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError, quoteForm, resetMessages, worker]);

  const subscribe = useCallback(async () => {
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
      setApiStatus("online");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError, quoteForm, resetMessages, worker]);

  const reportDisruption = useCallback(async () => {
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
      setApiStatus("online");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [disruptionForm, handleError, resetMessages]);

  const applyScenario = useCallback(
    (scenario) => {
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
    },
    [claimForm.zone, disruptionForm.zone, worker?.primary_zone]
  );

  const loadFirstScenario = useCallback(() => {
    if (firstScenario) {
      applyScenario(firstScenario);
    }
  }, [applyScenario, firstScenario]);

  const submitClaim = useCallback(async () => {
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
      setApiStatus("online");
      fetchClaims(worker.id);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [
    claimForm,
    fetchClaims,
    handleError,
    resetMessages,
    subscription?.active,
    worker,
    zoneMap,
  ]);

  const revalidateClaim = useCallback(async () => {
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
      setApiStatus("online");
      fetchClaims(worker.id);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [
    claimResult?.claim?.id,
    fetchClaims,
    handleError,
    resetMessages,
    revalidationForm,
    worker?.id,
  ]);

  const value = {
    apiStatus,
    apiDisplayLabel: API_DISPLAY_LABEL,
    loading,
    error,
    notice,
    setError,
    setNotice,

    meta,
    scenarios,
    worker,
    quote,
    subscription,
    claimResult,
    claims,

    workerForm,
    setWorkerForm,
    quoteForm,
    setQuoteForm,
    disruptionForm,
    setDisruptionForm,
    claimForm,
    setClaimForm,
    revalidationForm,
    setRevalidationForm,

    activeScenario,
    decisionClass,
    riskPercent,
    zoneOptions,
    platformOptions,
    firstScenario,

    registerWorker,
    quotePremium,
    subscribe,
    reportDisruption,
    applyScenario,
    loadFirstScenario,
    submitClaim,
    revalidateClaim,
    fetchClaims,
    toTitleCase,
  };

  return <KuberaContext.Provider value={value}>{children}</KuberaContext.Provider>;
}

export function useKubera() {
  const context = useContext(KuberaContext);
  if (!context) {
    throw new Error("useKubera must be used within KuberaProvider");
  }
  return context;
}
