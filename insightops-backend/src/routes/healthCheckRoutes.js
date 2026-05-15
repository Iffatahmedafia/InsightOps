const express = require("express");

const { prisma } = require("../config/prisma");
const { requireUserAuth } = require("../middleware/requireUserAuth");
const { openServiceDownIncident } = require("../services/incidentDetector");
const { sendIncidentOpenedAlert } = require("../services/emailAlertService");

const router = express.Router();
router.use(requireUserAuth);
const REQUEST_TIMEOUT_MS = 5000;

async function runHealthCheck(application) {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(application.healthUrl, {
      method: "GET",
      signal: controller.signal,
    });
    const responseTimeMs = Date.now() - startedAt;

    return {
      applicationId: application.id,
      status: response.ok ? "UP" : "DOWN",
      statusCode: response.status,
      responseTimeMs,
      checkedAt: new Date(),
      errorMessage: response.ok ? null : `Health endpoint returned ${response.status}`,
    };
  } catch (error) {
    return {
      applicationId: application.id,
      status: "DOWN",
      statusCode: null,
      responseTimeMs: Date.now() - startedAt,
      checkedAt: new Date(),
      errorMessage: error.name === "AbortError" ? "Health check timed out" : error.message,
    };
  } finally {
    clearTimeout(timeout);
  }
}

router.post("/run", async (req, res, next) => {
  try {
    const applications = await prisma.application.findMany({
      where: {
        ownerUserId: req.user.id,
        healthUrl: { not: null },
      },
      orderBy: [{ environment: "asc" }, { name: "asc" }],
    });

    const checks = [];
    const incidents = [];

    for (const application of applications) {
      const result = await runHealthCheck(application);
      const healthCheck = await prisma.healthCheck.create({
        data: result,
        include: { application: true },
      });

      checks.push(healthCheck);
      req.app.get("io").emit("health-check:created", { healthCheck });

      if (healthCheck.status === "DOWN") {
        const incident = await openServiceDownIncident({
          applicationId: application.id,
          statusCode: healthCheck.statusCode,
          responseTimeMs: healthCheck.responseTimeMs,
          errorMessage: healthCheck.errorMessage,
        });

        if (incident) {
          incidents.push(incident);
          req.app.get("io").emit("incident:opened", { incident });
          sendIncidentOpenedAlert(incident).catch((error) => {
            console.error("Unable to send service down alert", error);
          });
        }
      }
    }

    res.status(201).json({ checks, incidents });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const healthChecks = await prisma.healthCheck.findMany({
      where: {
        application: { ownerUserId: req.user.id },
      },
      include: {
        application: {
          select: { id: true, name: true, environment: true, healthUrl: true },
        },
      },
      orderBy: { checkedAt: "desc" },
      take: 100,
    });

    res.json({ healthChecks });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
