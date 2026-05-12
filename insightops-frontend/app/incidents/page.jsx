"use client";

import { useEffect, useState } from "react";

import { IncidentFilters } from "../../components/IncidentFilters";
import { IncidentsTable } from "../../components/IncidentsTable";
import { getApplications, getIncidents } from "../../lib/api";
import { useAuth } from "../../lib/useAuth";

const initialFilters = {
  applicationId: "",
  status: "open",
  severity: "",
  type: "",
  route: "",
  method: "",
  limit: "100",
};

export default function IncidentsPage() {
  const { loading: authLoading, user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadIncidents(nextFilters = filters) {
    const [appsData, incidentsData] = await Promise.all([
      getApplications(),
      getIncidents(nextFilters),
    ]);

    setApplications(appsData.applications || []);
    setIncidents(incidentsData.incidents || []);
    setError("");
  }

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    loadIncidents()
      .catch((requestError) => {
        console.error(requestError);
        setError("Unable to load incidents from the backend.");
      })
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    loadIncidents(filters)
      .catch((requestError) => {
        console.error(requestError);
        setError("Unable to apply incident filters.");
      })
      .finally(() => setLoading(false));
  }

  function handleReset() {
    setFilters(initialFilters);
    setLoading(true);
    loadIncidents(initialFilters)
      .catch((requestError) => {
        console.error(requestError);
        setError("Unable to reset incident filters.");
      })
      .finally(() => setLoading(false));
  }

  return (
    <>
      <section className="rounded-lg border border-slate-200 bg-white/88 px-5 py-5 shadow-soft backdrop-blur dark:border-white/10 dark:bg-neutral-900/82">
        <div className="max-w-3xl">
          <div className="mb-2 inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300">
            Incident triage
          </div>
          <h1 className="text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
            Manage incidents
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Filter, inspect, and resolve reliability issues across applications, routes, and health checks.
          </p>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      <IncidentFilters
        applications={applications}
        filters={filters}
        onChange={setFilters}
        onReset={handleReset}
        onSubmit={handleSubmit}
      />

      {loading || authLoading ? (
        <section className="panel flex min-h-[300px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading incidents</p>
          </div>
        </section>
      ) : (
        <IncidentsTable incidents={incidents} onResolved={() => loadIncidents(filters)} />
      )}
    </>
  );
}
