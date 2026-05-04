import { Globe2 } from "lucide-react";

export function ApplicationsPanel({ applications, summary }) {
  function getSummary(applicationId) {
    return summary.find((item) => item.application.id === applicationId);
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-title">Applications</p>
          <h2 className="mt-1 text-lg font-semibold">Monitored services</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
          {applications.length} total
        </span>
      </div>

      <div className="scroll-panel divide-y divide-slate-100 dark:divide-white/10">
        {applications.map((app) => {
          const appSummary = getSummary(app.id);

          return (
            <article className="flex items-center justify-between gap-4 px-5 py-4" key={app.id}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <strong className="truncate text-sm font-semibold text-slate-950 dark:text-white">{app.name}</strong>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {app.environment}
                  </span>
                </div>
                <div className="mt-2 flex min-w-0 items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Globe2 size={13} />
                  <span className="truncate">{app.healthUrl || "No health URL"}</span>
                </div>
              </div>

              <div className="grid min-w-[116px] grid-cols-2 gap-2 text-right text-xs">
                <div>
                  <span className="block font-semibold text-slate-950 dark:text-white">{appSummary?.requests || 0}</span>
                  <span className="text-slate-500 dark:text-slate-400">req</span>
                </div>
                <div>
                  <span className="block font-semibold text-red-600 dark:text-red-300">{appSummary?.errors || 0}</span>
                  <span className="text-slate-500 dark:text-slate-400">errors</span>
                </div>
              </div>
            </article>
          );
        })}

        {applications.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No applications found yet.
          </div>
        )}
      </div>
    </section>
  );
}
