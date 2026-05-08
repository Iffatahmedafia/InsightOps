const express = require("express");
const { prisma } = require("../config/prisma");
const { requireUserAuth } = require("../middleware/requireUserAuth");

const router = express.Router();
router.use(requireUserAuth);

router.get("/", async (req, res, next) => {
  try {
    const logs = await prisma.logEntry.findMany({
      where: {
        application: { ownerUserId: req.user.id },
      },
      orderBy: { timestamp: "desc" },
      take: 50,
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
