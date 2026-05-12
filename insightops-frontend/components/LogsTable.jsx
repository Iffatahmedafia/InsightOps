const levelClasses = {
  debug: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  warn: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  error: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  fatal: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

export function LogsTable({ logs }) {
  return (
    <section className="panel overflow-hidden">
      <div className="panel-header">
        <div>
          <p className="panel-title">Logs</p>
          <h2 className="mt-1 text-lg font-semibold">Searchable application events</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
          {logs.length} shown
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-white/10 dark:bg-neutral-950 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Application</th>
              <th className="px-4 py-3">Endpoint</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Trace</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/10">
            {logs.map((log) => {
              const endpoint = [log.method, log.route || log.metadata?.route].filter(Boolean).join(" ") || "No route";

              return (
                <tr className="align-top hover:bg-slate-50 dark:hover:bg-white/5" key={log.id}>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${levelClasses[log.level] || levelClasses.info}`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {log.application?.name || "Unknown app"}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{endpoint}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{log.service || "-"}</td>
                  <td className="max-w-md px-4 py-3 text-slate-700 dark:text-slate-300">{log.message}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{log.traceId || "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {logs.length === 0 && (
        <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
          No logs match these filters.
        </div>
      )}
    </section>
  );
}
