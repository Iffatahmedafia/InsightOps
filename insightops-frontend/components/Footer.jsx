export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="rounded-lg border border-slate-200 bg-white/78 px-5 py-5 text-sm text-slate-500 shadow-soft backdrop-blur dark:border-white/10 dark:bg-neutral-900/78 dark:text-slate-400">
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr_auto] lg:items-center">
        <div>
          <strong className="block text-sm font-semibold text-slate-950 dark:text-white">InsightOps</strong>
          <p className="mt-1 max-w-xl leading-6">
            Reliability monitoring for teams that need live incidents, health checks, API metrics, and logs in one focused workspace.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
          <a className="transition hover:text-blue-600 dark:hover:text-blue-300" href="/dashboard">
            Dashboard
          </a>
          <a className="transition hover:text-blue-600 dark:hover:text-blue-300" href="/dashboard#applications">
            Applications
          </a>
          <a className="transition hover:text-blue-600 dark:hover:text-blue-300" href="/dashboard#incidents">
            Incidents
          </a>
          <a className="transition hover:text-blue-600 dark:hover:text-blue-300" href="mailto:support@insightops.local">
            Support
          </a>
        </nav>

        <div className="flex flex-col gap-2 lg:items-end">
          <span className="inline-flex w-fit items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            Platform operational
          </span>
          <span className="text-xs">© {year} InsightOps. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
