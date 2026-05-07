const express = require("express");
const { z } = require("zod");

const { validate } = require("../middleware/validate");
const { prisma } = require("../config/prisma");
const { requireApplicationApiKey } = require("../middleware/requireApplicationApiKey");
const { evaluateIncidentSignals } = require("../services/incidentDetector");

const router = express.Router();

const logSchema = z.object({
  level: z.enum(["debug", "info", "warn", "error", "fatal"]),
  message: z.string().min(1),
  service: z.string().optional(),
  route: z.string().optional(),
  method: z.string().optional(),
  traceId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  timestamp: z.coerce.date().default(() => new Date()),
});

const metricSchema = z.object({
  route: z.string().min(1),
  method: z.string().min(1),
  statusCode: z.number().int().min(100).max(599),
  latencyMs: z.number().nonnegative(),
  traceId: z.string().optional(),
  timestamp: z.coerce.date().default(() => new Date()),
});

router.post("/logs", requireApplicationApiKey, validate(logSchema), async (req, res, next) => {
  try {
    const application = req.application;
    const log = await prisma.logEntry.create({
      data: {
        applicationId: application.id,
        level: req.body.level,
        message: req.body.message,
        service: req.body.service,
        route: req.body.route,
        method: req.body.method?.toUpperCase(),
        traceId: req.body.traceId,
        metadata: req.body.metadata,
        timestamp: req.body.timestamp,
      },
      include: { application: true },
    });

    req.app.get("io").emit("log:created", { log, application });
    res.status(201).json({ log });
  } catch (error) {
    next(error);
  }
});

router.post("/metrics", requireApplicationApiKey, validate(metricSchema), async (req, res, next) => {
  try {
    const application = req.application;
    const metric = await prisma.metricSample.create({
      data: {
        applicationId: application.id,
        route: req.body.route,
        method: req.body.method.toUpperCase(),
        statusCode: req.body.statusCode,
        latencyMs: req.body.latencyMs,
        traceId: req.body.traceId,
        timestamp: req.body.timestamp,
      },
      include: { application: true },
    });

    req.app.get("io").emit("metric:created", { metric, application });

    const incident = await evaluateIncidentSignals(application.id);
    if (incident) {
      req.app.get("io").emit("incident:opened", { incident });
    }

    res.status(201).json({ metric, incident });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
