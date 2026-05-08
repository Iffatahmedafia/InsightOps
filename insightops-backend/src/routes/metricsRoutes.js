const express = require("express");
const { prisma } = require("../config/prisma");
const { requireUserAuth } = require("../middleware/requireUserAuth");

const router = express.Router();
router.use(requireUserAuth);

router.get("/summary", async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 15 * 60 * 1000);
    const applications = await prisma.application.findMany({
      where: { ownerUserId: req.user.id },
      include: {
        metrics: {
          where: { timestamp: { gte: since } },
          select: { statusCode: true, latencyMs: true },
        },
      },
    });

    const summary = applications
      .map((application) => {
        const requests = application.metrics.length;
        const errors = application.metrics.filter((metric) => metric.statusCode >= 500).length;
        const totalLatency = application.metrics.reduce((total, metric) => total + metric.latencyMs, 0);

        return {
          application: {
            id: application.id,
            name: application.name,
            environment: application.environment,
            healthUrl: application.healthUrl,
          },
          requests,
          errors,
          avgLatencyMs: requests > 0 ? totalLatency / requests : 0,
          maxLatencyMs: requests > 0 ? Math.max(...application.metrics.map((metric) => metric.latencyMs)) : 0,
        };
      })
      .filter((item) => item.requests > 0);

    res.json({ summary });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
