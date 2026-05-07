"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Clock, Server, ShieldCheck } from "lucide-react";

import { AppShell } from "../components/AppShell";
import { AddApplicationModal } from "../components/AddApplicationModal";
import { ApplicationsPanel } from "../components/ApplicationsPanel";
import { HealthChecksPanel } from "../components/HealthChecksPanel";
import { IncidentsPanel } from "../components/IncidentsPanel";
import { RecentLogsPanel } from "../components/RecentLogsPanel";
import { RealtimeFeed } from "../components/RealtimeFeed";
import { StatCard } from "../components/StatCard";
import {
  createApplication,
  getApplications,
  getHealthChecks,
  getIncidents,
  getLogs,
  getMetricsSummary,
  runHealthChecks,
} from "../lib/api";
import { socket } from "../lib/socket";

export default function DashboardPage() {
  const [applications, setApplications] = useState([]);
  const [summary, setSummary] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [healthChecks, setHealthChecks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningChecks, setRunningChecks] = useState(false);
  const [showAddApplication, setShowAddApplication] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboard() {
    const [apps, metrics, incidentData, checks, logsData] = await Promise.all([
      getApplications(),
      getMetricsSummary(),
      getIncidents(),
      getHealthChecks(),
      getLogs(),
    ]);

    setApplications(apps.applications || []);
    setSummary(metrics.summary || []);
    setIncidents(incidentData.incidents || []);
    setHealthChecks(checks.healthChecks || []);
    setLogs(logsData.logs || []);
    setError("");
  }

  useEffect(() => {
    loadDashboard()
      .catch((requestError) => {
        console.error(requestError);
        setError("Unable to reach the InsightOps backend on localhost:4000.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function pushFeed(type, payload) {
      setFeed((items) => [
        {
          id: crypto.randomUUID(),
          type,
          payload,
          receivedAt: new Date().toISOString(),
        },
        ...items,
      ].slice(0, 40));
    }

    socket.on("metric:created", (payload) => {
      pushFeed("metric", payload);
      loadDashboard().catch(console.error);
    });

    socket.on("log:created", (payload) => {
      pushFeed("log", payload);
      setLogs((items) => [payload.log, ...items].filter(Boolean).slice(0, 100));
    });

    socket.on("health-check:created", (payload) => {
      pushFeed("health", payload);
      loadDashboard().catch(console.error);
    });

    socket.on("incident:opened", (payload) => {
      pushFeed("incident", payload);
      loadDashboard().catch(console.error);
    });

    return () => {
      socket.off("metric:created");
      socket.off("log:created");
      socket.off("health-check:created");
      socket.off("incident:opened");
    };
  }, []);

  const totals = useMemo(() => {
    const requests = summary.reduce((total, item) => total + item.requests, 0);
    const errors = summary.reduce((total, item) => total + item.errors, 0);
    const openIncidents = incidents.filter((incident) => incident.status === "open").length;
    const avgLatency =
      summary.length === 0
        ? 0
        : Math.round(summary.reduce((total, item) => total + item.avgLatencyMs, 0) / summary.length);

    return { requests, errors, openIncidents, avgLatency };
  }, [summary, incidents]);

  async function handleRunChecks() {
    setRunningChecks(true);
    try {
      await runHealthChecks();
      await loadDashboard();
    } catch (requestError) {
      console.error(requestError);
      setError("Health checks could not be started. Confirm the backend is running.");
    } finally {
      setRunningChecks(false);
    }
  }

  async function handleCreateApplication(payload) {
    try {
      const result = await createApplication(payload);
      await loadDashboard();
      return result;
    } catch (requestError) {
      console.error(requestError);
      setError("Application could not be created. Check the form values and backend connection.");
      throw requestError;
    }
  }

  return (
    <AppShell
      loading={loading}
      error={error}
      runningChecks={runningChecks}
      onAddApplication={() => setShowAddApplication(true)}
      onRunChecks={handleRunChecks}
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Server} label="Applications" value={applications.length} tone="blue" />
        <StatCard icon={AlertTriangle} label="Open Incidents" value={totals.openIncidents} tone="red" />
        <StatCard icon={Activity} label="Recent Requests" value={totals.requests} tone="emerald" />
        <StatCard icon={Clock} label="Avg Latency" value={`${totals.avgLatency}ms`} tone="amber" />
        <StatCard icon={ShieldCheck} label="Errors" value={totals.errors} tone="red" />
      </section>

      <section className="grid gap-5 xl:grid-cols-12">
        <div className="xl:col-span-5" id="applications">
          <ApplicationsPanel applications={applications} summary={summary} />
        </div>

        <div className="xl:col-span-7" id="incidents">
          <IncidentsPanel incidents={incidents} onResolved={loadDashboard} />
        </div>

        <div className="xl:col-span-7">
          <RecentLogsPanel logs={logs} />
        </div>

        <div className="xl:col-span-5">
          <RealtimeFeed feed={feed} />
        </div>

        <div className="xl:col-span-12">
          <HealthChecksPanel healthChecks={healthChecks} />
        </div>
      </section>

      {showAddApplication && (
        <AddApplicationModal onClose={() => setShowAddApplication(false)} onSubmit={handleCreateApplication} />
      )}
    </AppShell>
  );
}
