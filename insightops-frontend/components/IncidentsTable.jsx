import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { resolveIncident } from "../lib/api";

const severityClasses = {
  critical: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
};

export function IncidentsTable({ incidents, onResolved }) {
  async function handleResolve(id) {
    await resolveIncident(id);
    await onResolved();
  }

  return (
    <section className="panel overflow-hidden">
      <div className="panel-header">
        <div>
          <p className="panel-title">Incidents</p>
          <h2 className="mt-1 text-lg font-semibold">Triage reliability issues</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
          {incidents.length} shown
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-white/10 dark:bg-neutral-950 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Incident</th>
              <th className="px-4 py-3">Application</th>
              <th className="px-4 py-3">Endpoint</th>
              <th className="px-4 py-3">Opened</th>
              <th className="px-4 py-3">Evidence</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/10">
            {incidents.map((incident) => {
              const endpoint = [incident.method, incident.route].filter(Boolean).join(" ") || "-";
              const evidence = formatEvidence(incident.evidence);

              return (
                <tr className="align-top hover:bg-slate-50 dark:hover:bg-white/5" key={incident.id}>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${severityClasses[incident.severity] || severityClasses.warning}`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {incident.status}
                    </span>
                  </td>
                  <td className="max-w-sm px-4 py-3">
                    <Link className="block font-semibold text-slate-950 hover:text-blue-600 dark:text-white dark:hover:text-blue-300" href={`/incidents/${incident.id}`}>
                      {incident.title}
                    </Link>
                    <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{incident.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    {incident.application?.id ? (
                      <Link className="font-medium text-blue-600 hover:underline dark:text-blue-300" href={`/applications/${incident.application.id}`}>
                        {incident.application.name}
                      </Link>
                    ) : (
                      "Unknown app"
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{endpoint}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                    {new Date(incident.openedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{evidence}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/incidents/${incident.id}`}
                        className="inline-flex h-8 items-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                      >
                        Investigate
                      </Link>
                      {incident.status === "open" ? (
                        <button
                          type="button"
                          onClick={() => handleResolve(incident.id)}
                          className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                        >
                          <CheckCircle2 size={14} />
                          Resolve
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 dark:text-slate-400">Resolved</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {incidents.length === 0 && (
        <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
          No incidents match these filters.
        </div>
      )}
    </section>
  );
}

function formatEvidence(evidence) {
  if (!evidence) return "-";

  const parts = [];

  if (typeof evidence.errorRate === "number") {
    parts.push(`${Math.round(evidence.errorRate * 100)}% errors`);
  }

  if (typeof evidence.p95LatencyMs === "number") {
    parts.push(`${Math.round(evidence.p95LatencyMs)}ms response`);
  }

  if (typeof evidence.sampleSize === "number") {
    parts.push(`${evidence.sampleSize} samples`);
  }

  if (typeof evidence.statusCode === "number") {
    parts.push(`HTTP ${evidence.statusCode}`);
  }

  return parts.join(" · ") || "-";
}
