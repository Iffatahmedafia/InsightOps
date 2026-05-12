const express = require("express");
const { prisma } = require("../config/prisma");
const { requireUserAuth } = require("../middleware/requireUserAuth");

const router = express.Router();
router.use(requireUserAuth);

router.get("/", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const where = {
      application: { ownerUserId: req.user.id },
    };

    if (req.query.applicationId) where.applicationId = req.query.applicationId;
    if (req.query.level) where.level = req.query.level;
    if (req.query.route) where.route = req.query.route;
    if (req.query.method) where.method = req.query.method.toUpperCase();
    if (req.query.traceId) where.traceId = req.query.traceId;
    if (req.query.service) where.service = req.query.service;

    const logs = await prisma.logEntry.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: limit,
      include: {
        application: {
          select: {
            id: true,
            name: true,
            environment: true,
          },
        },
      },
    });

    res.json({ logs });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
