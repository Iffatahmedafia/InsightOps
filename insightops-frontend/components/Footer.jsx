export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="rounded-lg border border-slate-200 bg-white/78 px-5 py-6 text-sm text-slate-500 shadow-soft backdrop-blur dark:border-white/10 dark:bg-neutral-900/78 dark:text-slate-400">
      <div className="grid gap-7 md:grid-cols-4">
        <div className="md:col-span-2">
          <strong className="block text-sm font-semibold text-slate-950 dark:text-white">InsightOps</strong>
          <p className="mt-1 max-w-xl leading-6">
            Reliability monitoring for teams that need live incidents, health checks, API metrics, and logs in one focused workspace.
          </p>
          <span className="mt-4 inline-flex w-fit items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            Platform operational
          </span>
        </div>

        <nav aria-label="Company links">
          <h2 className="text-xs font-semibold uppercase tracking-normal text-slate-950 dark:text-white">Company</h2>
          <div className="mt-3 grid gap-2 font-medium">
            <a className="w-fit transition hover:text-blue-600 dark:hover:text-blue-300" href="/#product">
              About
            </a>
            <a className="w-fit transition hover:text-blue-600 dark:hover:text-blue-300" href="/#features">
              Services
            </a>
            <a className="w-fit transition hover:text-blue-600 dark:hover:text-blue-300" href="mailto:support@insightops.local">
              Contact us
            </a>
            <a className="w-fit transition hover:text-blue-600 dark:hover:text-blue-300" href="mailto:support@insightops.local">
              Support
            </a>
          </div>
        </nav>

        <nav aria-label="Legal links">
          <h2 className="text-xs font-semibold uppercase tracking-normal text-slate-950 dark:text-white">Legal</h2>
          <div className="mt-3 grid gap-2 font-medium">
            <a className="w-fit transition hover:text-blue-600 dark:hover:text-blue-300" href="/terms">
              Terms of use
            </a>
            <a className="w-fit transition hover:text-blue-600 dark:hover:text-blue-300" href="/privacy">
              Privacy policy
            </a>
            <a className="w-fit transition hover:text-blue-600 dark:hover:text-blue-300" href="/security">
              Security
            </a>
            <a className="w-fit transition hover:text-blue-600 dark:hover:text-blue-300" href="/status">
              Service status
            </a>
          </div>
        </nav>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-4 text-xs dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <span>Copyright {year} InsightOps. All rights reserved.</span>
        <nav aria-label="Footer quick links" className="flex flex-wrap gap-x-4 gap-y-2 font-medium">
          <a className="transition hover:text-blue-600 dark:hover:text-blue-300" href="/terms">
            Terms
          </a>
          <a className="transition hover:text-blue-600 dark:hover:text-blue-300" href="/privacy">
            Privacy
          </a>
          <a className="transition hover:text-blue-600 dark:hover:text-blue-300" href="mailto:support@insightops.local">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
