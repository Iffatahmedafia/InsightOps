"use client";

import { Moon, Plus, RefreshCw, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

export function AppShell({ children, error, loading, onAddApplication, onRunChecks, runningChecks }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("insightops-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = savedTheme ? savedTheme === "dark" : prefersDark;

    setDark(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  function toggleTheme() {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
    window.localStorage.setItem("insightops-theme", nextDark ? "dark" : "light");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-5 text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_32%),linear-gradient(180deg,#020617_0%,#0a0a0a_100%)] dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white/88 px-5 py-5 shadow-soft backdrop-blur dark:border-white/10 dark:bg-neutral-900/82 md:flex-row md:items-center">
          <div>
            <div className="mb-2 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300">
              Live operations
            </div>
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950 dark:text-white sm:text-4xl">
              InsightOps Reliability
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Monitor application health, latency, errors, and incidents from one responsive control surface.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-neutral-950 dark:text-slate-200 dark:hover:bg-white/10"
              aria-label="Toggle theme"
            >
              {dark ? <SunMedium size={18} /> : <Moon size={18} />}
            </button>

            <button
              type="button"
              onClick={onAddApplication}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-neutral-950 dark:text-slate-200 dark:hover:bg-white/10"
            >
              <Plus size={16} />
              Add Application
            </button>

            <button
              type="button"
              onClick={onRunChecks}
              disabled={runningChecks}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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
      </div>
    </main>
  );
}
