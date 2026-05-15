const { prisma } = require("../config/prisma");
const { generateAiJson } = require("./aiProvider");

async function generateIncidentAiSummary({ incidentId, userId }) {
  const incident = await prisma.incident.findFirst({
    where: {
      id: incidentId,
      application: { ownerUserId: userId },
    },
    include: {
      application: {
        select: { id: true, name: true, environment: true, healthUrl: true },
      },
    },
  });

  if (!incident) {
    return null;
  }

  const { relatedLogs, relatedMetrics } = await getRelatedTelemetry(incident);
  const { json, model } = await generateAiJson({
    messages: buildIncidentMessages({ incident, relatedLogs, relatedMetrics }),
  });
  const normalized = normalizeAiSummary(json);

  const updatedIncident = await prisma.incident.update({
    where: { id: incident.id },
    data: {
      aiSummary: normalized.summary,
      aiRootCause: normalized.likelyRootCause,
      aiRecommendedActions: normalized.recommendedActions,
      aiConfidence: normalized.confidence,
      aiModel: model,
      aiGeneratedAt: new Date(),
    },
    include: {
      application: {
        select: { id: true, name: true, environment: true, healthUrl: true },
      },
    },
  });

  return {
    incident: updatedIncident,
    relatedLogs,
    relatedMetrics,
  };
}

async function getRelatedTelemetry(incident) {
  const since = new Date(incident.openedAt.getTime() - 30 * 60 * 1000);
  const until = incident.resolvedAt
    ? new Date(incident.resolvedAt.getTime() + 30 * 60 * 1000)
    : new Date(Date.now() + 5 * 60 * 1000);
  const routeMethodFilter = {};

  if (incident.route) routeMethodFilter.route = incident.route;
  if (incident.method) routeMethodFilter.method = incident.method;

  const [relatedLogs, relatedMetrics] = await Promise.all([
    prisma.logEntry.findMany({
      where: {
        applicationId: incident.applicationId,
        timestamp: { gte: since, lte: until },
        ...routeMethodFilter,
      },
      orderBy: { timestamp: "desc" },
      take: 25,
    }),
    prisma.metricSample.findMany({
      where: {
        applicationId: incident.applicationId,
        timestamp: { gte: since, lte: until },
        ...routeMethodFilter,
      },
      orderBy: { timestamp: "desc" },
      take: 25,
    }),
  ]);

  return { relatedLogs, relatedMetrics };
}

function buildIncidentMessages({ incident, relatedLogs, relatedMetrics }) {
  const payload = {
    incident: {
      title: incident.title,
      type: incident.type,
      severity: incident.severity,
      status: incident.status,
      route: incident.route,
      method: incident.method,
      rootCauseHint: incident.rootCauseHint,
      evidence: incident.evidence,
      openedAt: incident.openedAt,
      resolvedAt: incident.resolvedAt,
      application: incident.application,
    },
    relatedLogs: relatedLogs.map((log) => ({
      level: log.level,
      message: log.message,
      service: log.service,
      route: log.route,
      method: log.method,
      traceId: log.traceId,
      timestamp: log.timestamp,
    })),
    relatedMetrics: relatedMetrics.map((metric) => ({
      route: metric.route,
      method: metric.method,
      statusCode: metric.statusCode,
      latencyMs: metric.latencyMs,
      traceId: metric.traceId,
      timestamp: metric.timestamp,
    })),
  };

  return [
    {
      role: "system",
      content:
        "You are an SRE assistant for InsightOps. Analyze incidents using only the provided telemetry. Be concise, practical, and avoid inventing facts. Return valid JSON only.",
    },
    {
      role: "user",
      content: `Create an incident analysis JSON object with this exact shape:
{
  "summary": "1-2 sentence plain English summary",
  "likelyRootCause": "best explanation, or say if evidence is insufficient",
  "recommendedActions": ["specific action 1", "specific action 2", "specific action 3"],
  "confidence": "low|medium|high"
}

Telemetry:
${JSON.stringify(payload, null, 2)}`,
    },
  ];
}

function normalizeAiSummary(json) {
  const actions = Array.isArray(json.recommendedActions)
    ? json.recommendedActions.filter(Boolean).slice(0, 5)
    : [];

  return {
    summary: String(json.summary || "No summary returned."),
    likelyRootCause: String(json.likelyRootCause || "The available telemetry is not enough to identify a likely root cause."),
    recommendedActions: actions.length > 0 ? actions.map(String) : ["Review related logs and metrics for the affected route."],
    confidence: ["low", "medium", "high"].includes(json.confidence) ? json.confidence : "low",
  };
}

module.exports = { generateIncidentAiSummary };
