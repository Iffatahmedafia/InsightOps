const express = require("express");
const { prisma } = require("../config/prisma");
const { requireUserAuth } = require("../middleware/requireUserAuth");

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

    return res.json({ incident });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
