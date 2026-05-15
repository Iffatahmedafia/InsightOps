const express = require("express");
const { prisma } = require("../config/prisma");
const { requireUserAuth } = require("../middleware/requireUserAuth");
const { generateIncidentAiSummary } = require("../services/aiSummaryService");
const { sendIncidentResolvedAlert } = require("../services/emailAlertService");

const router = express.Router();
router.use(requireUserAuth);

router.get("/", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 200);
    const where = {
      application: { ownerUserId: req.user.id },
    };

    if (req.query.applicationId) where.applicationId = req.query.applicationId;
    if (req.query.status) where.status = req.query.status;
    if (req.query.severity) where.severity = req.query.severity;
    if (req.query.type) where.type = req.query.type;
    if (req.query.route) where.route = req.query.route;
    if (req.query.method) where.method = req.query.method.toUpperCase();

    const incidents = await prisma.incident.findMany({
      where,
      include: {
        application: {
          select: { id: true, name: true, environment: true, healthUrl: true },
        },
      },
      orderBy: { openedAt: "desc" },
      take: limit,
    });

    res.json({ incidents });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const incident = await prisma.incident.findFirst({
      where: {
        id: req.params.id,
        application: { ownerUserId: req.user.id },
      },
      include: {
        application: {
          select: { id: true, name: true, environment: true, healthUrl: true },
        },
      },
    });

    if (!incident) {
      return res.status(404).json({ error: { message: "Incident not found" } });
    }

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

    return res.json({ incident, relatedLogs, relatedMetrics });
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id/resolve", async (req, res, next) => {
  try {
    const existingIncident = await prisma.incident.findFirst({
      where: {
        id: req.params.id,
        application: { ownerUserId: req.user.id },
      },
    });

    if (!existingIncident) {
      return res.status(404).json({ error: { message: "Incident not found" } });
    }

    const incident = await prisma.incident.update({
      where: { id: existingIncident.id },
      data: { status: "resolved", resolvedAt: new Date() },
      include: { application: true },
    });

    sendIncidentResolvedAlert(incident).catch((error) => {
      console.error("Unable to send incident resolved alert", error);
    });

    return res.json({ incident });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/ai-summary", async (req, res, next) => {
  try {
    const result = await generateIncidentAiSummary({
      incidentId: req.params.id,
      userId: req.user.id,
    });

    if (!result) {
      return res.status(404).json({ error: { message: "Incident not found" } });
    }

    return res.json(result);
  } catch (error) {
    if (error.message === "OPENROUTER_API_KEY is not configured.") {
      return res.status(503).json({
        error: {
          message: "AI summaries are not configured yet. Add OPENROUTER_API_KEY on the backend.",
        },
      });
    }

    return next(error);
  }
});

module.exports = router;
