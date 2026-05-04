const express = require("express");
const { prisma } = require("../config/prisma");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const incidents = await prisma.incident.findMany({
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
    const incident = await prisma.incident.update({
      where: { id: req.params.id },
      data: { status: "resolved", resolvedAt: new Date() },
      include: { application: true },
    });

    res.json({ incident });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
