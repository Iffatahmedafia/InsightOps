"use client";

import { Plus, RefreshCw } from "lucide-react";

export function AppShell({ children, error, loading, onAddApplication, onRunChecks, runningChecks }) {
  return (
    <>
        <header className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white/88 px-4 py-5 shadow-soft backdrop-blur dark:border-white/10 dark:bg-neutral-900/82 sm:px-5 md:flex-row md:items-center">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300">
              Live operations
            </div>
            <h1 className="text-2xl font-semibold tracking-normal text-slate-950 dark:text-white sm:text-4xl">
              InsightOps Reliability
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Monitor application health, latency, errors, and incidents from one responsive control surface.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={onAddApplication}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-neutral-950 dark:text-slate-200 dark:hover:bg-white/10 sm:w-auto"
            >
              <Plus size={16} />
              Add Application
            </button>

            <button
              type="button"
              onClick={onRunChecks}
              disabled={runningChecks}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <RefreshCw size={16} className={runningChecks ? "animate-spin" : ""} />
              {runningChecks ? "Running" : "Run Checks"}
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <section className="panel flex min-h-[360px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading dashboard data</p>
            </div>
          </section>
        ) : (
          children
        )}
    </>
  );
}
