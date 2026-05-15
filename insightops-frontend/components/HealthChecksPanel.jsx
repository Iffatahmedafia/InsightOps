export function HealthChecksPanel({ healthChecks }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-title">Health status</p>
          <h2 className="mt-1 text-lg font-semibold">Latest checks</h2>
        </div>
      </div>

      <div className="scroll-panel divide-y divide-slate-100 dark:divide-white/10">
        {healthChecks.slice(0, 16).map((check) => (
          <article className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto]" key={check.id}>
            <div className="min-w-0">
              <strong className="block truncate text-sm font-semibold text-slate-950 dark:text-white">
                {check.application?.name || "Unknown app"}
              </strong>
              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                {new Date(check.checkedAt).toLocaleString()}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${check.status === "UP" ? "status-up" : "status-down"}`}>
                {check.status}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                {check.statusCode || "none"}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{check.responseTimeMs}ms</span>
            </div>
          </article>
        ))}

        {healthChecks.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No health check history yet.
          </div>
        )}
      </div>
    </section>
  );
}
