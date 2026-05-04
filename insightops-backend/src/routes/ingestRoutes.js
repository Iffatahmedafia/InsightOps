const express = require("express");
const { z } = require("zod");

const { validate } = require("../middleware/validate");
const { prisma } = require("../config/prisma");
const { evaluateIncidentSignals } = require("../services/incidentDetector");

const router = express.Router();

const applicationSchema = z.object({
  applicationName: z.string().min(1),
  environment: z.string().min(1).default("production"),
});

const logSchema = applicationSchema.extend({
  level: z.enum(["debug", "info", "warn", "error", "fatal"]),
  message: z.string().min(1),
  service: z.string().optional(),
  traceId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  timestamp: z.coerce.date().default(() => new Date()),
});

const metricSchema = applicationSchema.extend({
  route: z.string().min(1),
  method: z.string().min(1),
  statusCode: z.number().int().min(100).max(599),
  latencyMs: z.number().nonnegative(),
  traceId: z.string().optional(),
  timestamp: z.coerce.date().default(() => new Date()),
});

async function findOrCreateApplication({ applicationName, environment }) {
  return prisma.application.upsert({
    where: {
      name_environment: {
        name: applicationName,
        environment,
      },
    },
    update: {},
    create: {
      name: applicationName,
      environment,
    },
  });
}

router.post("/logs", validate(logSchema), async (req, res, next) => {
  try {
    const application = await findOrCreateApplication(req.body);
    const log = await prisma.logEntry.create({
      data: {
        applicationId: application.id,
        level: req.body.level,
        message: req.body.message,
        service: req.body.service,
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

router.post("/metrics", validate(metricSchema), async (req, res, next) => {
  try {
    const application = await findOrCreateApplication(req.body);
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
