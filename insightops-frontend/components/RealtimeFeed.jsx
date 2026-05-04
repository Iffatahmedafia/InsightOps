import { Radio } from "lucide-react";

const typeClasses = {
  health: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  incident: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  log: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300",
  metric: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
};

export function RealtimeFeed({ feed }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-title">Realtime feed</p>
          <h2 className="mt-1 text-lg font-semibold">Incoming events</h2>
        </div>
        <Radio size={18} className="text-blue-600 dark:text-blue-300" />
      </div>

      <div className="scroll-panel divide-y divide-slate-100 dark:divide-white/10">
        {feed.map((item) => (
          <article className="flex items-center justify-between gap-3 px-5 py-4" key={item.id}>
            <div className="min-w-0">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${typeClasses[item.type] || typeClasses.log}`}>
                {item.type}
              </span>
              <p className="mt-2 truncate text-sm text-slate-600 dark:text-slate-400">
                {describeEvent(item)}
              </p>
            </div>
            <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
              {new Date(item.receivedAt).toLocaleTimeString()}
            </span>
          </article>
        ))}

        {feed.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            Waiting for live metrics, logs, health checks, and incidents.
          </div>
        )}
      </div>
    </section>
  );
}

function describeEvent(item) {
  if (item.type === "incident") {
    return item.payload?.incident?.title || "New incident opened";
  }

  if (item.type === "health") {
    const check = item.payload?.healthCheck;
    return `${check?.application?.name || "Application"} health is ${check?.status || "unknown"}`;
  }

  if (item.type === "metric") {
    const metric = item.payload?.metric;
    return `${metric?.method || "API"} ${metric?.route || "metric"} · ${metric?.latencyMs || 0}ms`;
  }

  if (item.type === "log") {
    return item.payload?.log?.message || "New log entry received";
  }

  return "New realtime event";
}
