const express = require("express");
const { prisma } = require("../config/prisma");
const { requireUserAuth } = require("../middleware/requireUserAuth");

const router = express.Router();
router.use(requireUserAuth);

router.get("/", async (req, res, next) => {
  try {
    const incidents = await prisma.incident.findMany({
      where: {
        application: { ownerUserId: req.user.id },
      },
      include: {
        application: {
          select: { id: true, name: true, environment: true, healthUrl: true },
        },
      },
      orderBy: { openedAt: "desc" },
      take: 100,
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
