"use client";

const statuses = ["", "open", "resolved"];
const severities = ["", "warning", "critical"];
const types = ["", "error_rate", "latency", "service_down"];
const methods = ["", "GET", "POST", "PUT", "PATCH", "DELETE"];

export function IncidentFilters({ applications, filters, onChange, onReset, onSubmit }) {
  function updateFilter(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <form onSubmit={onSubmit} className="panel p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Application</span>
          <select
            value={filters.applicationId}
            onChange={(event) => updateFilter("applicationId", event.target.value)}
            className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-neutral-950 dark:text-white"
          >
            <option value="">All applications</option>
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name} ({app.environment})
              </option>
            ))}
          </select>
        </label>

        <SelectFilter label="Status" value={filters.status} options={statuses} fallback="All statuses" onChange={(value) => updateFilter("status", value)} />
        <SelectFilter label="Severity" value={filters.severity} options={severities} fallback="All severities" onChange={(value) => updateFilter("severity", value)} />
        <SelectFilter label="Type" value={filters.type} options={types} fallback="All types" onChange={(value) => updateFilter("type", value)} />
        <SelectFilter label="Method" value={filters.method} options={methods} fallback="All methods" onChange={(value) => updateFilter("method", value)} />

        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Route</span>
          <input
            value={filters.route}
            onChange={(event) => updateFilter("route", event.target.value)}
            className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-neutral-950 dark:text-white"
            placeholder="/api/products"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Limit</span>
          <select
            value={filters.limit}
            onChange={(event) => updateFilter("limit", event.target.value)}
            className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-neutral-950 dark:text-white"
          >
            {[50, 100, 200].map((limit) => (
              <option key={limit} value={limit}>
                {limit}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-2">
          <button type="submit" className="h-10 flex-1 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700">
            Apply
          </button>
          <button
            type="button"
            onClick={onReset}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
          >
            Reset
          </button>
        </div>
      </div>
    </form>
  );
}

function SelectFilter({ fallback, label, onChange, options, value }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-neutral-950 dark:text-white"
      >
        {options.map((option) => (
          <option key={option || "all"} value={option}>
            {option || fallback}
          </option>
        ))}
      </select>
    </label>
  );
}
