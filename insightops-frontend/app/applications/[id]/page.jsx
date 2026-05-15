"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, ArrowLeft, BellRing, Check, ClipboardCopy, Clock, ExternalLink, KeyRound, Radio, RotateCw, ShieldCheck, Terminal } from "lucide-react";

import { HealthChecksPanel } from "../../../components/HealthChecksPanel";
import { IncidentsPanel } from "../../../components/IncidentsPanel";
import { RecentLogsPanel } from "../../../components/RecentLogsPanel";
import { StatCard } from "../../../components/StatCard";
import {
  getApplication,
  getHealthChecks,
  getIncidents,
  getLogs,
  getMetricsSummary,
  API_BASE_URL,
  rotateApplicationApiKey,
  updateApplicationAlertSettings,
} from "../../../lib/api";
import { useAuth } from "../../../lib/useAuth";

export default function ApplicationDetailPage() {
  const { loading: authLoading, user } = useAuth();
  const params = useParams();
  const applicationId = params.id;
  const [application, setApplication] = useState(null);
  const [summary, setSummary] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [healthChecks, setHealthChecks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rotatingKey, setRotatingKey] = useState(false);
  const [savingAlerts, setSavingAlerts] = useState(false);
  const [createdApiKey, setCreatedApiKey] = useState("");
  const [copiedSnippet, setCopiedSnippet] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [error, setError] = useState("");

  async function loadApplicationDetail() {
    const [applicationData, metricsData, incidentsData, checksData, logsData] = await Promise.all([
      getApplication(applicationId),
      getMetricsSummary(),
      getIncidents(),
      getHealthChecks(),
      getLogs({ applicationId, limit: 100 }),
    ]);

    setApplication(applicationData.application);
    setSummary(metricsData.summary || []);
    setIncidents(incidentsData.incidents || []);
    setHealthChecks(checksData.healthChecks || []);
    setLogs(logsData.logs || []);
    setError("");
  }

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    loadApplicationDetail()
      .catch((requestError) => {
        console.error(requestError);
        setError("Unable to load application detail from the backend.");
      })
      .finally(() => setLoading(false));
  }, [applicationId, authLoading, user]);

  const appSummary = useMemo(
    () => summary.find((item) => item.application?.id === applicationId),
    [applicationId, summary]
  );

  const appIncidents = useMemo(
    () => incidents.filter((incident) => incident.applicationId === applicationId || incident.application?.id === applicationId),
    [applicationId, incidents]
  );

  const appHealthChecks = useMemo(
    () => healthChecks.filter((check) => check.applicationId === applicationId || check.application?.id === applicationId),
    [applicationId, healthChecks]
  );

  const totals = useMemo(() => {
    const requests = appSummary?.requests || 0;
    const errors = appSummary?.errors || 0;
    const avgLatency = Math.round(appSummary?.avgLatencyMs || 0);
    const openIncidents = appIncidents.filter((incident) => incident.status === "open").length;
    const latestHealth = appHealthChecks[0]?.status || "unknown";

    return { requests, errors, avgLatency, openIncidents, latestHealth };
  }, [appSummary, appHealthChecks, appIncidents]);

  const latestLog = useMemo(
    () => application?.logs?.[0] || logs[0],
    [application, logs]
  );

  const latestMetric = application?.metrics?.[0];

  async function handleRotateApiKey() {
    setRotatingKey(true);
    setError("");

    try {
      const result = await rotateApplicationApiKey(applicationId);
      setApplication((current) => ({ ...current, ...result.application }));
      setCreatedApiKey(result.apiKey || "");
    } catch (requestError) {
      console.error(requestError);
      setError("API key could not be rotated. Confirm the backend is running.");
    } finally {
      setRotatingKey(false);
    }
  }

  async function copySnippet(type, value) {
    await navigator.clipboard.writeText(value);
    setCopiedSnippet(type);
    window.setTimeout(() => setCopiedSnippet(""), 1600);
  }

  async function handleSaveAlertSettings(payload) {
    setSavingAlerts(true);
    setAlertMessage("");
    setError("");

    try {
      const result = await updateApplicationAlertSettings(applicationId, payload);
      setApplication((current) => ({ ...current, ...result.application }));
      setAlertMessage("Alert settings saved.");
    } catch (requestError) {
      console.error(requestError);
      setError("Alert settings could not be saved. Check the email and backend connection.");
      throw requestError;
    } finally {
      setSavingAlerts(false);
    }
  }

  if (loading || authLoading) {
    return (
      <section className="panel flex min-h-[360px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading application detail</p>
        </div>
      </section>
    );
  }

  if (error || !application) {
    return (
      <section className="panel px-5 py-8">
        <Link href="/dashboard" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-300">
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Application unavailable</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {error || "This application could not be found."}
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="rounded-lg border border-slate-200 bg-white/88 px-5 py-5 shadow-soft backdrop-blur dark:border-white/10 dark:bg-neutral-900/82">
        <Link href="/dashboard" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-300">
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                {application.environment}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${totals.latestHealth === "UP" ? "status-up" : totals.latestHealth === "DOWN" ? "status-down" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}>
                Health {totals.latestHealth}
              </span>
            </div>
            <h1 className="truncate text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
              {application.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Owner {application.owner || "unassigned"} - API key {application.hasApiKey ? "configured" : "missing"}
            </p>
          </div>

          {application.healthUrl && (
            <a
              href={application.healthUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-neutral-950 dark:text-slate-200 dark:hover:bg-white/10"
            >
              <ExternalLink size={16} />
              Health URL
            </a>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Activity} label="Recent Requests" value={totals.requests} tone="emerald" />
        <StatCard icon={AlertTriangle} label="Open Incidents" value={totals.openIncidents} tone="red" />
        <StatCard icon={ShieldCheck} label="Errors" value={totals.errors} tone="red" />
        <StatCard icon={Clock} label="Avg Latency" value={`${totals.avgLatency}ms`} tone="amber" />
        <StatCard icon={ShieldCheck} label="Latest Health" value={totals.latestHealth} tone={totals.latestHealth === "UP" ? "emerald" : "red"} />
      </section>

      <ApplicationSetupPanel
        application={application}
        apiBaseUrl={API_BASE_URL}
        copiedSnippet={copiedSnippet}
        createdApiKey={createdApiKey}
        latestHealth={totals.latestHealth}
        latestLog={latestLog}
        latestMetric={latestMetric}
        onCopySnippet={copySnippet}
        onRotateApiKey={handleRotateApiKey}
        rotatingKey={rotatingKey}
      />

      <AlertSettingsPanel
        alertMessage={alertMessage}
        application={application}
        onSave={handleSaveAlertSettings}
        saving={savingAlerts}
      />

      <section className="grid gap-5 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <IncidentsPanel incidents={appIncidents} onResolved={loadApplicationDetail} />
        </div>

        <div className="xl:col-span-5">
          <HealthChecksPanel healthChecks={appHealthChecks} />
        </div>

        <div className="xl:col-span-12">
          <RecentLogsPanel logs={logs} />
        </div>
      </section>
    </>
  );
}

function AlertSettingsPanel({ alertMessage, application, onSave, saving }) {
  const [form, setForm] = useState(() => ({
    alertEmail: application.alertEmail || "",
    alertsEnabled: Boolean(application.alertsEnabled),
    incidentOpenedAlertsEnabled: application.incidentOpenedAlertsEnabled ?? true,
    serviceDownAlertsEnabled: application.serviceDownAlertsEnabled ?? true,
    incidentResolvedAlertsEnabled: application.incidentResolvedAlertsEnabled ?? true,
  }));
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setForm({
      alertEmail: application.alertEmail || "",
      alertsEnabled: Boolean(application.alertsEnabled),
      incidentOpenedAlertsEnabled: application.incidentOpenedAlertsEnabled ?? true,
      serviceDownAlertsEnabled: application.serviceDownAlertsEnabled ?? true,
      incidentResolvedAlertsEnabled: application.incidentResolvedAlertsEnabled ?? true,
    });
  }, [application]);

  function updateField(field, value) {
    setLocalError("");
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (form.alertsEnabled && !form.alertEmail.trim()) {
      setLocalError("Add an alert email before enabling alerts.");
      return;
    }

    try {
      await onSave({
        ...form,
        alertEmail: form.alertEmail.trim(),
      });
    } catch {
      // Parent page shows the request error.
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-title">Email alerts</p>
          <h2 className="mt-1 text-lg font-semibold">Notify your team when incidents change</h2>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${form.alertsEnabled ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}>
          <BellRing size={14} />
          {form.alertsEnabled ? "Enabled" : "Disabled"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 p-4 lg:grid-cols-[0.9fr_1.1fr] lg:p-5">
        <div className="grid gap-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Alert email</span>
            <input
              type="email"
              value={form.alertEmail}
              onChange={(event) => updateField("alertEmail", event.target.value)}
              className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-neutral-950 dark:text-white"
              placeholder="oncall@example.com"
            />
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-neutral-950">
            <input
              type="checkbox"
              checked={form.alertsEnabled}
              onChange={(event) => updateField("alertsEnabled", event.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span>
              <span className="block text-sm font-semibold text-slate-950 dark:text-white">Enable alerts for this application</span>
              <span className="mt-1 block text-sm leading-6 text-slate-500 dark:text-slate-400">
                InsightOps will email the configured address when selected events occur.
              </span>
            </span>
          </label>
        </div>

        <div className="grid gap-3">
          <AlertToggle
            checked={form.incidentOpenedAlertsEnabled}
            description="Send email when error-rate or latency incidents open."
            label="Incident opened"
            onChange={(value) => updateField("incidentOpenedAlertsEnabled", value)}
          />
          <AlertToggle
            checked={form.serviceDownAlertsEnabled}
            description="Send email when health checks create a service-down incident."
            label="Service down"
            onChange={(value) => updateField("serviceDownAlertsEnabled", value)}
          />
          <AlertToggle
            checked={form.incidentResolvedAlertsEnabled}
            description="Send email after an incident is resolved."
            label="Incident resolved"
            onChange={(value) => updateField("incidentResolvedAlertsEnabled", value)}
          />

          {(localError || alertMessage) && (
            <p className={`text-sm font-medium ${localError ? "text-red-600 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300"}`}>
              {localError || alertMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
          >
            {saving ? "Saving" : "Save alert settings"}
          </button>
        </div>
      </form>
    </section>
  );
}

function AlertToggle({ checked, description, label, onChange }) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-neutral-950">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4"
      />
      <span>
        <span className="block text-sm font-semibold text-slate-950 dark:text-white">{label}</span>
        <span className="mt-1 block text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</span>
      </span>
    </label>
  );
}

function ApplicationSetupPanel({
  apiBaseUrl,
  application,
  copiedSnippet,
  createdApiKey,
  latestHealth,
  latestLog,
  latestMetric,
  onCopySnippet,
  onRotateApiKey,
  rotatingKey,
}) {
  const apiKeyValue = createdApiKey || "YOUR_APPLICATION_API_KEY";
  const logSnippet = `curl -X POST ${apiBaseUrl}/api/ingest/logs \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKeyValue}" \\
  -d '{
    "level": "error",
    "message": "Checkout request failed",
    "service": "${application.name}",
    "route": "/api/checkout",
    "method": "POST",
    "traceId": "trace_123"
  }'`;

  const metricSnippet = `curl -X POST ${apiBaseUrl}/api/ingest/metrics \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKeyValue}" \\
  -d '{
    "route": "/api/checkout",
    "method": "POST",
    "statusCode": 500,
    "latencyMs": 842,
    "traceId": "trace_123"
  }'`;

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-title">Application setup</p>
          <h2 className="mt-1 text-lg font-semibold">Connect {application.name}</h2>
        </div>
        <button
          type="button"
          onClick={onRotateApiKey}
          disabled={rotatingKey}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10 sm:w-auto"
        >
          <RotateCw size={16} className={rotatingKey ? "animate-spin" : ""} />
          {rotatingKey ? "Rotating" : "Rotate key"}
        </button>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[0.9fr_1.1fr] lg:p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <SetupStatusCard icon={Radio} label="API URL" value={`${apiBaseUrl}/api/ingest`} />
          <SetupStatusCard icon={KeyRound} label="API key status" value={application.hasApiKey ? "Configured" : "Missing"} tone={application.hasApiKey ? "emerald" : "red"} />
          <SetupStatusCard icon={Clock} label="Last log received" value={latestLog ? new Date(latestLog.timestamp).toLocaleString() : "No logs yet"} />
          <SetupStatusCard icon={Activity} label="Last metric received" value={latestMetric ? new Date(latestMetric.timestamp).toLocaleString() : "No metrics yet"} />
          <SetupStatusCard icon={ShieldCheck} label="Health status" value={latestHealth} tone={latestHealth === "UP" ? "emerald" : latestHealth === "DOWN" ? "red" : "slate"} />
          <SetupStatusCard icon={ExternalLink} label="Health URL" value={application.healthUrl || "Not configured"} />
        </div>

        <div className="grid min-w-0 gap-4">
          {createdApiKey && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">New API key created</p>
              <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">Store it now. InsightOps only shows the raw key once.</p>
              <code className="mt-3 block break-all rounded-lg bg-white px-3 py-2 text-xs text-slate-800 dark:bg-neutral-950 dark:text-slate-100">
                {createdApiKey}
              </code>
            </div>
          )}

          <SnippetCard
            copied={copiedSnippet === "logs"}
            icon={Terminal}
            label="Send a log"
            snippet={logSnippet}
            onCopy={() => onCopySnippet("logs", logSnippet)}
          />
          <SnippetCard
            copied={copiedSnippet === "metrics"}
            icon={Activity}
            label="Send a metric"
            snippet={metricSnippet}
            onCopy={() => onCopySnippet("metrics", metricSnippet)}
          />
        </div>
      </div>
    </section>
  );
}

function SetupStatusCard({ icon: Icon, label, tone = "blue", value }) {
  const toneClasses = {
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    red: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    slate: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
  };

  return (
    <article className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-neutral-950">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
        <Icon size={17} />
      </div>
      <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{label}</p>
      <strong className="mt-1 block break-words text-sm font-semibold text-slate-950 dark:text-white">{value}</strong>
    </article>
  );
}

function SnippetCard({ copied, icon: Icon, label, onCopy, snippet }) {
  return (
    <article className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-neutral-950">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-blue-600 dark:text-blue-300" />
          <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{label}</h3>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-neutral-900 dark:text-slate-200 dark:hover:bg-white/10 sm:w-auto"
        >
          {copied ? <Check size={14} /> : <ClipboardCopy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-64 overflow-auto rounded-lg bg-neutral-950 p-4 text-xs leading-6 text-slate-200">
        <code>{snippet}</code>
      </pre>
    </article>
  );
}
