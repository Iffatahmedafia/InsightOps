import Link from "next/link";
import { Activity, AlertTriangle, BarChart3, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <>
      <section className="grid items-center gap-8 rounded-lg border border-slate-200 bg-white/88 px-5 py-10 shadow-soft backdrop-blur dark:border-white/10 dark:bg-neutral-900/82 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <div className="mb-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300">
            Real-time reliability monitoring
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-slate-950 dark:text-white sm:text-5xl">
            InsightOps helps teams spot incidents before users do.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
            Register applications, ingest logs and API metrics, monitor health checks, and investigate route-level incidents from one focused dashboard.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/register" className="inline-flex h-11 items-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-700">
              Create account
            </Link>
            <Link href="/login" className="inline-flex h-11 items-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-neutral-950 dark:text-slate-200 dark:hover:bg-white/10">
              Sign in
            </Link>
          </div>
        </div>

        <div className="grid gap-3">
          {[
            { icon: Activity, title: "Live telemetry", text: "Stream logs, metrics, health checks, and incidents." },
            { icon: AlertTriangle, title: "Route-aware incidents", text: "Detect failures on specific endpoints like POST /api/orders." },
            { icon: ShieldCheck, title: "Application API keys", text: "Secure ingestion with per-application keys." },
            { icon: BarChart3, title: "Focused app pages", text: "Keep the dashboard minimal and details inside each app." },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-neutral-950" key={item.title}>
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                  <Icon size={18} />
                </div>
                <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
