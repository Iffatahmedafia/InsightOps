import { CheckCircle2 } from "lucide-react";

import { resolveIncident } from "../lib/api";

const severityClasses = {
  critical: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
};

export function IncidentsPanel({ incidents, onResolved }) {
  async function handleResolve(id) {
    await resolveIncident(id);
    await onResolved();
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-title">Incidents</p>
          <h2 className="mt-1 text-lg font-semibold">Recent reliability signals</h2>
        </div>
      </div>

      <div className="scroll-panel divide-y divide-slate-100 dark:divide-white/10">
        {incidents.map((incident) => (
          <article className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto]" key={incident.id}>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${severityClasses[incident.severity] || severityClasses.warning}`}>
                  {incident.severity}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  {incident.status}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{incident.type}</span>
              </div>
              <strong className="block text-sm font-semibold text-slate-950 dark:text-white">{incident.title}</strong>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {incident.application?.name || "Unknown app"} · {incident.rootCauseHint || "No hint available"}
              </p>
            </div>

            {incident.status === "open" && (
              <button
                type="button"
                onClick={() => handleResolve(incident.id)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
              >
                <CheckCircle2 size={15} />
                Resolve
              </button>
            )}
          </article>
        ))}

        {incidents.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No incidents detected.
          </div>
        )}
      </div>
    </section>
  );
}
