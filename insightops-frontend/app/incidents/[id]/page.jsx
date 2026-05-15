"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, ArrowLeft, BrainCircuit, CheckCircle2, Clock, FileText, Route, Server, ShieldCheck, Sparkles } from "lucide-react";

import { generateIncidentAiSummary, getIncident, resolveIncident } from "../../../lib/api";
import { useAuth } from "../../../lib/useAuth";

const severityClasses = {
  critical: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
};

export default function IncidentDetailPage() {
  const { loading: authLoading, user } = useAuth();
  const params = useParams();
  const incidentId = params.id;
  const [incident, setIncident] = useState(null);
  const [relatedLogs, setRelatedLogs] = useState([]);
  const [relatedMetrics, setRelatedMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [aiError, setAiError] = useState("");
  const [error, setError] = useState("");

  async function loadIncident() {
    const data = await getIncident(incidentId);
    setIncident(data.incident);
    setRelatedLogs(data.relatedLogs || []);
    setRelatedMetrics(data.relatedMetrics || []);
    setError("");
  }

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    loadIncident()
      .catch((requestError) => {
        console.error(requestError);
        setError("Unable to load incident details from the backend.");
      })
      .finally(() => setLoading(false));
  }, [authLoading, user, incidentId]);

  const endpoint = useMemo(
    () => [incident?.method, incident?.route].filter(Boolean).join(" ") || "No route captured",
    [incident]
  );

  const evidenceItems = useMemo(() => formatEvidenceItems(incident?.evidence), [incident]);
  const recommendation = useMemo(
    () => getRecommendedAction(incident, relatedLogs, relatedMetrics),
    [incident, relatedLogs, relatedMetrics]
  );

  async function handleResolve() {
    setResolving(true);
    setError("");

    try {
      const result = await resolveIncident(incidentId);
      setIncident(result.incident);
    } catch (requestError) {
      console.error(requestError);
      setError("Incident could not be resolved. Confirm the backend is running.");
    } finally {
      setResolving(false);
    }
  }

  async function handleGenerateAiSummary() {
    setGeneratingAi(true);
    setAiError("");

    try {
      const result = await generateIncidentAiSummary(incidentId);
      setIncident(result.incident);
      setRelatedLogs(result.relatedLogs || []);
      setRelatedMetrics(result.relatedMetrics || []);
    } catch (requestError) {
      console.error(requestError);
      setAiError(requestError.message || "AI summary could not be generated.");
    } finally {
      setGeneratingAi(false);
    }
  }

  if (loading || authLoading) {
    return (
      <section className="panel flex min-h-[360px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading incident details</p>
        </div>
      </section>
    );
  }

  if (error || !incident) {
    return (
      <section className="panel px-5 py-8">
        <Link href="/incidents" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-300">
          <ArrowLeft size={16} />
          Back to incidents
        </Link>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Incident unavailable</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {error || "This incident could not be found."}
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="rounded-lg border border-slate-200 bg-white/88 px-5 py-5 shadow-soft backdrop-blur dark:border-white/10 dark:bg-neutral-900/82">
        <Link href="/incidents" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-300">
          <ArrowLeft size={16} />
          Back to incidents
        </Link>

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${severityClasses[incident.severity] || severityClasses.warning}`}>
                {incident.severity}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600 dark:bg-white/10 dark:text-slate-300">
                {incident.status}
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                {incident.type}
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
              {incident.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Opened {new Date(incident.openedAt).toLocaleString()}
              {incident.resolvedAt ? ` - Resolved ${new Date(incident.resolvedAt).toLocaleString()}` : ""}
            </p>
          </div>

          {incident.status === "open" ? (
            <button
              type="button"
              onClick={handleResolve}
              disabled={resolving}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <CheckCircle2 size={16} />
              {resolving ? "Resolving" : "Resolve incident"}
            </button>
          ) : (
            <span className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300">
              Resolved
            </span>
          )}
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={AlertTriangle} label="What happened" value={incident.rootCauseHint || incident.title} />
        <SummaryCard icon={Server} label="Affected app" value={`${incident.application?.name || "Unknown app"} (${incident.application?.environment || "unknown"})`} />
        <SummaryCard icon={Route} label="Affected route" value={endpoint} />
        <SummaryCard icon={Clock} label="Opened" value={new Date(incident.openedAt).toLocaleString()} />
      </section>

      <section className="grid gap-5 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="panel-title">Evidence</p>
                <h2 className="mt-1 text-lg font-semibold">Signal details</h2>
              </div>
            </div>
            <div className="grid gap-3 p-5">
              {evidenceItems.map((item) => (
                <div className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-4 py-3 text-sm dark:bg-neutral-950" key={item.label}>
                  <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
                  <strong className="text-right text-slate-950 dark:text-white">{item.value}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="xl:col-span-7">
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="panel-title">Recommended action</p>
                <h2 className="mt-1 text-lg font-semibold">Next step</h2>
              </div>
              <ShieldCheck size={18} className="text-blue-600 dark:text-blue-300" />
            </div>
            <div className="p-5">
              <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{recommendation}</p>
            </div>
          </section>
        </div>

        <div className="xl:col-span-12">
          <AiAnalysisPanel
            error={aiError}
            generating={generatingAi}
            incident={incident}
            onGenerate={handleGenerateAiSummary}
          />
        </div>

        <div className="xl:col-span-6">
          <RelatedLogsPanel logs={relatedLogs} />
        </div>

        <div className="xl:col-span-6">
          <RelatedMetricsPanel metrics={relatedMetrics} />
        </div>
      </section>
    </>
  );
}

function AiAnalysisPanel({ error, generating, incident, onGenerate }) {
  const actions = Array.isArray(incident.aiRecommendedActions) ? incident.aiRecommendedActions : [];
  const hasAiSummary = Boolean(incident.aiSummary || incident.aiRootCause || actions.length > 0);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-title">AI analysis</p>
          <h2 className="mt-1 text-lg font-semibold">Summary and recommendations</h2>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <Sparkles size={16} />
          {generating ? "Generating" : hasAiSummary ? "Regenerate" : "Generate AI summary"}
        </button>
      </div>

      <div className="p-5">
        {error && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
            {error}
          </div>
        )}

        {hasAiSummary ? (
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-neutral-950">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                <BrainCircuit size={18} />
              </div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Summary</p>
              <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{incident.aiSummary}</p>

              <p className="mt-5 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Likely root cause</p>
              <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{incident.aiRootCause}</p>

              <div className="mt-5 flex flex-wrap gap-2 text-xs">
                {incident.aiConfidence && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    Confidence: {incident.aiConfidence}
                  </span>
                )}
                {incident.aiModel && (
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                    {incident.aiModel}
                  </span>
                )}
                {incident.aiGeneratedAt && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {new Date(incident.aiGeneratedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-neutral-950">
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Recommended actions</p>
              <div className="mt-3 grid gap-3">
                {actions.map((action, index) => (
                  <div className="flex gap-3 rounded-lg bg-white px-3 py-3 text-sm text-slate-700 dark:bg-neutral-900 dark:text-slate-300" key={`${action}-${index}`}>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                      {index + 1}
                    </span>
                    <span className="leading-6">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center dark:border-white/15 dark:bg-neutral-950">
            <BrainCircuit className="mx-auto mb-3 text-blue-600 dark:text-blue-300" size={28} />
            <p className="text-sm font-semibold text-slate-950 dark:text-white">No AI analysis yet</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Generate a concise incident summary, likely root cause, and next steps from the related logs and metrics.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <article className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-neutral-900">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
        <Icon size={18} />
      </div>
      <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{label}</p>
      <strong className="mt-1 block break-words text-sm font-semibold text-slate-950 dark:text-white">{value}</strong>
    </article>
  );
}

function RelatedLogsPanel({ logs }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-title">Related logs</p>
          <h2 className="mt-1 text-lg font-semibold">Nearby events</h2>
        </div>
        <FileText size={18} className="text-blue-600 dark:text-blue-300" />
      </div>
      <div className="scroll-panel divide-y divide-slate-100 dark:divide-white/10">
        {logs.map((log) => (
          <article className="px-5 py-4" key={log.id}>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">{log.level}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
            </div>
            <strong className="block break-words text-sm font-semibold text-slate-950 dark:text-white">{log.message}</strong>
            <p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">
              {[log.method, log.route, log.service, log.traceId].filter(Boolean).join(" - ") || "No route metadata"}
            </p>
          </article>
        ))}

        {logs.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No related logs found around this incident.
          </div>
        )}
      </div>
    </section>
  );
}

function RelatedMetricsPanel({ metrics }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-title">Related metrics</p>
          <h2 className="mt-1 text-lg font-semibold">Route samples</h2>
        </div>
        <Activity size={18} className="text-blue-600 dark:text-blue-300" />
      </div>
      <div className="scroll-panel divide-y divide-slate-100 dark:divide-white/10">
        {metrics.map((metric) => (
          <article className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto]" key={metric.id}>
            <div className="min-w-0">
              <strong className="block break-words text-sm font-semibold text-slate-950 dark:text-white">
                {[metric.method, metric.route].filter(Boolean).join(" ")}
              </strong>
              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                {new Date(metric.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${metric.statusCode >= 500 ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"}`}>
                HTTP {metric.statusCode}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                {Math.round(metric.latencyMs)}ms
              </span>
            </div>
          </article>
        ))}

        {metrics.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No related metrics found around this incident.
          </div>
        )}
      </div>
    </section>
  );
}

function formatEvidenceItems(evidence) {
  if (!evidence) {
    return [{ label: "Evidence", value: "No structured evidence captured" }];
  }

  const items = [];

  if (typeof evidence.errorRate === "number") {
    items.push({ label: "Error rate", value: `${Math.round(evidence.errorRate * 100)}%` });
  }

  if (typeof evidence.p95LatencyMs === "number") {
    items.push({ label: "P95 latency", value: `${Math.round(evidence.p95LatencyMs)}ms` });
  }

  if (typeof evidence.sampleSize === "number") {
    items.push({ label: "Sample size", value: `${evidence.sampleSize}` });
  }

  if (typeof evidence.statusCode === "number") {
    items.push({ label: "Health status code", value: `HTTP ${evidence.statusCode}` });
  }

  if (typeof evidence.responseTimeMs === "number") {
    items.push({ label: "Health response time", value: `${evidence.responseTimeMs}ms` });
  }

  if (typeof evidence.errorMessage === "string") {
    items.push({ label: "Health error", value: evidence.errorMessage });
  }

  return items.length > 0 ? items : [{ label: "Evidence", value: JSON.stringify(evidence) }];
}

function getRecommendedAction(incident, logs, metrics) {
  if (!incident) {
    return "Open the related logs and metrics to identify the failing request path.";
  }

  if (incident.type === "service_down") {
    return "Check the application's health endpoint and deployment status first. Confirm the service is reachable, then rerun health checks after the service recovers.";
  }

  if (incident.type === "latency") {
    return "Inspect slow route samples, recent deploys, database calls, and upstream dependencies for this endpoint. Start with the highest latency metric samples shown below.";
  }

  if (incident.type === "error_rate") {
    const hasErrorLogs = logs.some((log) => ["error", "fatal"].includes(log.level));
    const hasServerErrors = metrics.some((metric) => metric.statusCode >= 500);

    if (hasErrorLogs || hasServerErrors) {
      return "Review the error logs and 5xx metric samples for the affected route. Match trace IDs across logs and metrics, then check the most recent code or dependency change for this service.";
    }
  }

  return incident.rootCauseHint || "Review the related logs and metrics around the incident window, then resolve the incident after the underlying service behavior is confirmed healthy.";
}
