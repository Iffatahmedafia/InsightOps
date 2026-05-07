export function Footer() {
  return (
    <footer className="rounded-lg border border-slate-200 bg-white/70 px-4 py-4 text-sm text-slate-500 backdrop-blur dark:border-white/10 dark:bg-neutral-900/70 dark:text-slate-400">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span>InsightOps - Real-time reliability monitoring</span>
        <span>API http://localhost:4000</span>
      </div>
    </footer>
  );
}
