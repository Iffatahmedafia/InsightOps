const { prisma } = require("../config/prisma");

const WINDOW_MINUTES = 5;

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

  const errorCount = samples.filter((sample) => sample.statusCode >= 500).length;
  const errorRate = errorCount / samples.length;
  const p95LatencyMs = percentile(
    samples.map((sample) => sample.latencyMs),
    95
  );

  const errorRateThreshold = Number(process.env.ERROR_RATE_THRESHOLD || 0.1);
  const latencyThreshold = Number(process.env.P95_LATENCY_THRESHOLD_MS || 1000);

  if (errorRate >= errorRateThreshold) {
    return openIncidentOnce({
      applicationId,
      type: "error_rate",
      severity: errorRate >= errorRateThreshold * 2 ? "critical" : "warning",
      title: "Elevated API error rate",
      rootCauseHint: "Recent 5xx responses are above the configured threshold.",
      evidence: { errorRate, p95LatencyMs, windowMinutes: WINDOW_MINUTES, sampleSize: samples.length },
    });
  }

  if (p95LatencyMs >= latencyThreshold) {
    return openIncidentOnce({
      applicationId,
      type: "latency",
      severity: p95LatencyMs >= latencyThreshold * 2 ? "critical" : "warning",
      title: "Elevated p95 latency",
      rootCauseHint: "Recent latency distribution exceeds the configured p95 threshold.",
      evidence: { errorRate, p95LatencyMs, windowMinutes: WINDOW_MINUTES, sampleSize: samples.length },
    });
  }

  return null;
}

async function openIncidentOnce({ applicationId, type, severity, title, rootCauseHint, evidence }) {
  const existing = await prisma.incident.findFirst({
    where: {
      applicationId,
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
