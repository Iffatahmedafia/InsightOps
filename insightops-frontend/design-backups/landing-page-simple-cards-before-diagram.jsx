import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  FileText,
  KeyRound,
  Radio,
  Server,
  ShieldCheck,
} from "lucide-react";

const snapshotCards = [
  {
    icon: Activity,
    title: "Live telemetry",
    text: "Stream logs, metrics, health checks, and incidents.",
  },
  {
    icon: AlertTriangle,
    title: "Route-aware incidents",
    text: "Detect failures on specific endpoints like POST /api/orders.",
  },
  {
    icon: ShieldCheck,
    title: "Application API keys",
    text: "Secure ingestion with per-application keys.",
  },
  {
    icon: BarChart3,
    title: "Focused app pages",
    text: "Keep the dashboard minimal and details inside each app.",
  },
];

const features = [
  {
    icon: Radio,
    title: "Realtime monitoring",
    text: "Socket-powered updates keep the dashboard current as new telemetry arrives.",
  },
  {
    icon: AlertTriangle,
    title: "Incident detection",
    text: "Surface error-rate, latency, and service-down signals before they become mystery outages.",
  },
  {
    icon: FileText,
    title: "Log ingestion",
    text: "Send structured logs with levels, routes, methods, trace IDs, and metadata.",
  },
  {
    icon: BarChart3,
    title: "API metrics",
    text: "Track status codes and response times by endpoint for fast route-level diagnosis.",
  },
  {
    icon: Server,
    title: "Health checks",
    text: "Run checks against registered health URLs and turn downtime into actionable incidents.",
  },
  {
    icon: KeyRound,
    title: "Secure app keys",
    text: "Use generated application keys for ingest traffic while user actions stay behind Supabase Auth.",
  },
];

const workflow = [
  "Create an application",
  "Copy the generated API key",
  "Send logs and metrics",
  "Resolve incidents from the dashboard",
];

export default function LandingPage() {
  return (
    <>
      <section className="grid items-center gap-8 rounded-lg border border-slate-200 bg-white/88 px-5 py-10 shadow-soft backdrop-blur dark:border-white/10 dark:bg-neutral-900/82 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
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
              Start monitoring
            </Link>
            <Link href="/login" className="inline-flex h-11 items-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-neutral-950 dark:text-slate-200 dark:hover:bg-white/10">
              Sign in
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-soft dark:border-white/10 dark:bg-neutral-950">
          <img
            src="/insightops-hero-dashboard.svg"
            alt="InsightOps dashboard showing metrics, incidents, logs, and service health"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section id="product" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {snapshotCards.map((item) => {
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
      </section>

      <section id="features" className="rounded-lg border border-slate-200 bg-white/88 px-5 py-7 shadow-soft backdrop-blur dark:border-white/10 dark:bg-neutral-900/82 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">Features</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Everything your team needs to see what broke and why.</h2>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-neutral-950" key={feature.title}>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                  <Icon size={19} />
                </div>
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{feature.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="workflow" className="rounded-lg border border-slate-200 bg-white/88 px-5 py-7 shadow-soft backdrop-blur dark:border-white/10 dark:bg-neutral-900/82 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">Workflow</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Start monitoring in four steps.</h2>
          </div>
          <Link href="/register" className="inline-flex h-10 w-fit items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700">
            Start monitoring
          </Link>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {workflow.map((step, index) => (
            <article className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-neutral-950" key={step}>
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-glow">
                {index + 1}
              </div>
              <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{step}</h3>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-300" />
                Ready for the next signal
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
