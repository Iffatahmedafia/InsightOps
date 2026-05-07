const { prisma } = require("../config/prisma");

const WINDOW_MINUTES = 5;
const MIN_ROUTE_SAMPLES = 10;

function percentile(values, rank) {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((rank / 100) * sorted.length) - 1;
  return sorted[Math.max(index, 0)];
}

async function evaluateIncidentSignals(applicationId) {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);
  const samples = await prisma.metricSample.findMany({
    where: {
      applicationId,
      timestamp: { gte: since },
    },
  });

  if (samples.length < 10) {
    return null;
  }

  const errorRateThreshold = Number(process.env.ERROR_RATE_THRESHOLD || 0.1);
  const latencyThreshold = Number(process.env.P95_LATENCY_THRESHOLD_MS || 1000);
  const routeGroups = groupSamplesByRoute(samples);

  for (const group of routeGroups) {
    if (group.samples.length < MIN_ROUTE_SAMPLES) {
      continue;
    }

    const errorCount = group.samples.filter((sample) => sample.statusCode >= 500).length;
    const errorRate = errorCount / group.samples.length;
    const p95LatencyMs = percentile(
      group.samples.map((sample) => sample.latencyMs),
      95
    );

    if (errorRate >= errorRateThreshold) {
      const incident = await openIncidentOnce({
        applicationId,
        route: group.route,
        method: group.method,
        type: "error_rate",
        severity: errorRate >= errorRateThreshold * 2 ? "critical" : "warning",
        title: `Elevated error rate on ${group.method} ${group.route}`,
        rootCauseHint: `Recent 5xx responses are above the configured threshold for ${group.method} ${group.route}.`,
        evidence: {
          route: group.route,
          method: group.method,
          errorRate,
          errorCount,
          p95LatencyMs,
          windowMinutes: WINDOW_MINUTES,
          sampleSize: group.samples.length,
        },
      });

      if (incident) {
        return incident;
      }
    }

    if (p95LatencyMs >= latencyThreshold) {
      const incident = await openIncidentOnce({
        applicationId,
        route: group.route,
        method: group.method,
        type: "latency",
        severity: p95LatencyMs >= latencyThreshold * 2 ? "critical" : "warning",
        title: `Elevated p95 latency on ${group.method} ${group.route}`,
        rootCauseHint: `Recent latency distribution exceeds the configured p95 threshold for ${group.method} ${group.route}.`,
        evidence: {
          route: group.route,
          method: group.method,
          errorRate,
          errorCount,
          p95LatencyMs,
          windowMinutes: WINDOW_MINUTES,
          sampleSize: group.samples.length,
        },
      });

      if (incident) {
        return incident;
      }
    }
  }

  return null;
}

function groupSamplesByRoute(samples) {
  const groups = new Map();

  for (const sample of samples) {
    const method = sample.method.toUpperCase();
    const key = `${method} ${sample.route}`;

    if (!groups.has(key)) {
      groups.set(key, {
        route: sample.route,
        method,
        samples: [],
      });
    }

    groups.get(key).samples.push(sample);
  }

  return [...groups.values()].sort((a, b) => b.samples.length - a.samples.length);
}

async function openIncidentOnce({
  applicationId,
  route,
  method,
  type,
  severity,
  title,
  rootCauseHint,
  evidence,
}) {
  const existing = await prisma.incident.findFirst({
    where: {
      applicationId,
      route: route || null,
      method: method || null,
      type,
      status: "open",
    },
  });

  if (existing) {
    return null;
  }

  return prisma.incident.create({
    data: {
      applicationId,
      route,
      method,
      type,
      severity,
      title,
      rootCauseHint,
      evidence,
    },
    include: { application: true },
  });
}

async function openServiceDownIncident({ applicationId, statusCode, responseTimeMs, errorMessage }) {
  return openIncidentOnce({
    applicationId,
    type: "service_down",
    severity: "critical",
    title: "Service health check failed",
    rootCauseHint: errorMessage || "The configured health endpoint did not return a healthy response.",
    evidence: {
      statusCode,
      responseTimeMs,
      checkedAt: new Date().toISOString(),
    },
  });
}

module.exports = { evaluateIncidentSignals, openServiceDownIncident };
