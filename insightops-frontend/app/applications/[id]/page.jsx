"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, ArrowLeft, Clock, ExternalLink, ShieldCheck } from "lucide-react";

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
} from "../../../lib/api";

export default function ApplicationDetailPage() {
  const params = useParams();
  const applicationId = params.id;
  const [application, setApplication] = useState(null);
  const [summary, setSummary] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [healthChecks, setHealthChecks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadApplicationDetail() {
    const [applicationData, metricsData, incidentsData, checksData, logsData] = await Promise.all([
      getApplication(applicationId),
      getMetricsSummary(),
      getIncidents(),
      getHealthChecks(),
      getLogs(),
    ]);

    setApplication(applicationData.application);
    setSummary(metricsData.summary || []);
    setIncidents(incidentsData.incidents || []);
    setHealthChecks(checksData.healthChecks || []);
    setLogs(logsData.logs || []);
    setError("");
  }

  useEffect(() => {
    loadApplicationDetail()
      .catch((requestError) => {
        console.error(requestError);
        setError("Unable to load application detail from the backend.");
      })
      .finally(() => setLoading(false));
  }, [applicationId]);

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

  const appLogs = useMemo(
    () => logs.filter((log) => log.applicationId === applicationId || log.application?.id === applicationId),
    [applicationId, logs]
  );

  const totals = useMemo(() => {
    const requests = appSummary?.requests || 0;
    const errors = appSummary?.errors || 0;
    const avgLatency = Math.round(appSummary?.avgLatencyMs || 0);
    const openIncidents = appIncidents.filter((incident) => incident.status === "open").length;
    const latestHealth = appHealthChecks[0]?.status || "unknown";

    return { requests, errors, avgLatency, openIncidents, latestHealth };
  }, [appSummary, appHealthChecks, appIncidents]);

  if (loading) {
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
        <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-300">
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
        <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-300">
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

      <section className="grid gap-5 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <IncidentsPanel incidents={appIncidents} onResolved={loadApplicationDetail} />
        </div>

        <div className="xl:col-span-5">
          <HealthChecksPanel healthChecks={appHealthChecks} />
        </div>

        <div className="xl:col-span-12">
          <RecentLogsPanel logs={appLogs} />
        </div>
      </section>
    </>
  );
}
