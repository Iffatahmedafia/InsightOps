const levelClasses = {
  debug: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  warn: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  error: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  fatal: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

export function RecentLogsPanel({ logs }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-title">Recent logs</p>
          <h2 className="mt-1 text-lg font-semibold">Latest application events</h2>
        </div>
      </div>

      <div className="scroll-panel divide-y divide-slate-100 dark:divide-white/10">
        {logs.slice(0, 20).map((log) => {
          const routeOrService = log.route || log.metadata?.route || log.service || "No route";
          const methodRoute = log.method ? `${log.method} ${routeOrService}` : routeOrService;

          return (
            <article className="grid gap-3 px-5 py-4 md:grid-cols-[auto_1fr_auto]" key={log.id}>
              <span
                className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                  levelClasses[log.level] || levelClasses.info
                }`}
              >
                {log.level}
              </span>

              <div className="min-w-0">
                <strong className="block truncate text-sm font-semibold text-slate-950 dark:text-white">
                  {log.message}
                </strong>

                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>{log.application?.name || "Unknown app"}</span>
                  <span>{methodRoute}</span>
                </div>
              </div>

              <time className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(log.timestamp).toLocaleString()}
              </time>
            </article>
          );
        })}

        {logs.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No logs received yet.
          </div>
        )}
      </div>
    </section>
  );
}
