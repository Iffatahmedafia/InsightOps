import Link from "next/link";
import {
  Activity,
  ArrowRight,
  AlertTriangle,
  BarChart3,
  BellRing,
  CheckCircle2,
  ClipboardCopy,
  FileText,
  KeyRound,
  Radio,
  Server,
  ShieldCheck,
  UploadCloud,
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
    visual: "feed",
  },
  {
    icon: AlertTriangle,
    title: "Incident detection",
    text: "Surface error-rate, latency, and service-down signals before they become mystery outages.",
    visual: "incidents",
  },
  {
    icon: FileText,
    title: "Log ingestion",
    text: "Send structured logs with levels, routes, methods, trace IDs, and metadata.",
    visual: "logs",
  },
  {
    icon: BarChart3,
    title: "API metrics",
    text: "Track status codes and response times by endpoint for fast route-level diagnosis.",
    visual: "metrics",
  },
  {
    icon: Server,
    title: "Health checks",
    text: "Run checks against registered health URLs and turn downtime into actionable incidents.",
    visual: "health",
  },
  {
    icon: KeyRound,
    title: "Secure app keys",
    text: "Use generated application keys for ingest traffic while user actions stay behind Supabase Auth.",
    visual: "keys",
  },
];

const workflow = [
  {
    icon: Server,
    title: "Create app",
    text: "Register the service you want to monitor.",
  },
  {
    icon: ClipboardCopy,
    title: "Generate key",
    text: "Use one scoped key for ingest traffic.",
  },
  {
    icon: UploadCloud,
    title: "Send telemetry",
    text: "Stream logs, metrics, and route signals.",
  },
  {
    icon: BellRing,
    title: "Detect incident",
    text: "Spot failures as thresholds are crossed.",
  },
  {
    icon: CheckCircle2,
    title: "Resolve",
    text: "Close the loop from the dashboard.",
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="grid items-center gap-6 rounded-lg border border-slate-200 bg-white/88 px-4 py-8 shadow-soft backdrop-blur dark:border-white/10 dark:bg-neutral-900/82 sm:px-5 sm:py-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8 lg:px-8">
        <div>
          <div className="mb-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300">
            Real-time reliability monitoring
          </div>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-normal text-slate-950 dark:text-white sm:text-5xl">
            InsightOps helps teams spot incidents before users do.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
            Register applications, ingest logs and API metrics, monitor health checks, and investigate route-level incidents from one focused dashboard.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/register" className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-700 sm:w-auto">
              Start monitoring
            </Link>
            <Link href="/login" className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-neutral-950 dark:text-slate-200 dark:hover:bg-white/10 sm:w-auto">
              Sign in
            </Link>
          </div>
        </div>

        <div className="aspect-[16/11] overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-soft dark:border-white/10 dark:bg-neutral-950 sm:aspect-[16/9] lg:aspect-auto">
          <img
            src="/insightops-hero-dashboard.svg"
            alt="InsightOps dashboard showing metrics, incidents, logs, and service health"
            className="h-full w-full object-contain lg:object-cover"
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

        <div className="mt-6 grid gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article className="grid min-w-0 gap-5 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-neutral-950 sm:p-5 lg:grid-cols-[0.72fr_1fr] lg:items-center" key={feature.title}>
                <div className="min-w-0">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                    <Icon size={19} />
                  </div>
                  <h3 className="text-base font-semibold text-slate-950 dark:text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{feature.text}</p>
                </div>
                <FeaturePreview type={feature.visual} />
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
          <Link href="/register" className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-fit">
            Start monitoring
          </Link>
        </div>

        <div className="mt-7 rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-neutral-950">
          <div className="grid gap-4 lg:grid-cols-5 lg:items-start">
            {workflow.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === workflow.length - 1;

              return (
                <div className="relative flex gap-4 lg:block" key={step.title}>
                  <div className="absolute left-[17px] top-11 h-[calc(100%-28px)] w-px bg-blue-200 dark:bg-blue-500/25 lg:left-[calc(50%+22px)] lg:top-5 lg:h-px lg:w-[calc(100%-44px)]" hidden={isLast} />
                  <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-glow lg:mx-auto">
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0 lg:mt-4 lg:text-center">
                    <div className="flex items-center gap-2 lg:justify-center">
                      <span className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">Step {index + 1}</span>
                      {!isLast && <ArrowRight size={14} className="hidden text-slate-400 lg:block" />}
                    </div>
                    <h3 className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{step.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

function FeaturePreview({ type }) {
  if (type === "feed") {
    return (
      <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Live feed</span>
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">Streaming</span>
        </div>
        <div className="mt-4 grid gap-2">
          {["metric:created", "log:created", "incident:opened"].map((event) => (
            <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-neutral-950" key={event}>
              <span className="min-w-0 break-all font-semibold text-slate-700 dark:text-slate-200">{event}</span>
              <span className="text-slate-500 dark:text-slate-400">now</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "incidents") {
    return (
      <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-neutral-900">
        <div className="grid gap-2">
          {[
            ["critical", "POST /api/orders", "Error rate above threshold"],
            ["warning", "GET /api/users", "Latency spike detected"],
          ].map(([severity, route, text]) => (
            <div className="rounded-lg bg-slate-50 px-3 py-3 dark:bg-neutral-950" key={route}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <strong className="min-w-0 break-all text-sm text-slate-950 dark:text-white">{route}</strong>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${severity === "critical" ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"}`}>
                  {severity}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "logs") {
    return (
      <div className="min-w-0 rounded-lg border border-slate-200 bg-neutral-950 p-4 text-xs text-slate-300 dark:border-white/10">
        <div className="break-words font-mono leading-6">
          <p><span className="text-red-300">error</span> checkout timeout trace_8fb21</p>
          <p><span className="text-amber-300">warn</span> retries exhausted /api/orders</p>
          <p><span className="text-blue-300">info</span> request completed 204ms</p>
        </div>
      </div>
    );
  }

  if (type === "metrics") {
    return (
      <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-neutral-900">
        <div className="grid gap-3">
          {[
            ["GET /api/users", "72%"],
            ["POST /api/orders", "48%"],
            ["GET /health", "91%"],
          ].map(([route, width]) => (
            <div key={route}>
              <div className="mb-1 flex justify-between gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="min-w-0 break-all">{route}</span>
                <span>{width}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-950">
                <div className="h-full rounded-full bg-blue-600" style={{ width }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "health") {
    return (
      <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-neutral-900">
        <div className="grid gap-2">
          {[
            ["checkout-api", "UP"],
            ["billing-worker", "UP"],
            ["email-service", "DOWN"],
          ].map(([service, status]) => (
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-neutral-950" key={service}>
              <span className="min-w-0 break-all font-semibold text-slate-700 dark:text-slate-200">{service}</span>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${status === "UP" ? "status-up" : "status-down"}`}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-neutral-900">
      <div className="break-all rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-600 dark:bg-neutral-950 dark:text-slate-300">
        <span className="text-blue-700 dark:text-blue-300">x-api-key:</span> iops_live_************************
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">hashed storage</span>
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">per app</span>
      </div>
    </div>
  );
}
