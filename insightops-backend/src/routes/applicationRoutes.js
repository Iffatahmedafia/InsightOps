const express = require("express");
const { z } = require("zod");

const { prisma } = require("../config/prisma");
const { validate } = require("../middleware/validate");

const router = express.Router();

const applicationSchema = z.object({
  name: z.string().min(1),
  environment: z.string().min(1).default("production"),
  owner: z.string().optional(),
  healthUrl: z.string().url().optional(),
});

router.post("/", validate(applicationSchema), async (req, res, next) => {
  try {
    const application = await prisma.application.upsert({
      where: {
        name_environment: {
          name: req.body.name,
          environment: req.body.environment,
        },
      },
      update: {
        owner: req.body.owner,
        healthUrl: req.body.healthUrl,
      },
      create: req.body,
    });

    res.status(201).json({ application });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const applications = await prisma.application.findMany({
      orderBy: [{ environment: "asc" }, { name: "asc" }],
    });

    res.json({ applications });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        healthChecks: {
          orderBy: { checkedAt: "desc" },
          take: 10,
        },
        incidents: {
          orderBy: { openedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!application) {
      return res.status(404).json({ error: { message: "Application not found" } });
    }

    return res.json({ application });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
