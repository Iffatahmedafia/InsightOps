const express = require("express");
const { z } = require("zod");

const { prisma } = require("../config/prisma");
const { validate } = require("../middleware/validate");
const { generateApiKey, hashApiKey } = require("../utils/apiKeys");

const router = express.Router();

const applicationSchema = z.object({
  name: z.string().min(1),
  environment: z.string().min(1).default("production"),
  owner: z.string().optional(),
  healthUrl: z.string().url().optional(),
});

router.post("/", validate(applicationSchema), async (req, res, next) => {
  try {
    const existingApplication = await prisma.application.findUnique({
      where: {
        name_environment: {
          name: req.body.name,
          environment: req.body.environment,
        },
      },
    });

    if (existingApplication) {
      const application = await prisma.application.update({
        where: { id: existingApplication.id },
        data: {
          owner: req.body.owner,
          healthUrl: req.body.healthUrl,
        },
      });

      return res.status(200).json({ application: sanitizeApplication(application) });
    }

    const apiKey = generateApiKey();
    const application = await prisma.application.create({
      data: {
        ...req.body,
        apiKeyHash: hashApiKey(apiKey),
      },
    });

    res.status(201).json({
      application: sanitizeApplication(application),
      apiKey,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const applications = await prisma.application.findMany({
      orderBy: [{ environment: "asc" }, { name: "asc" }],
    });

    res.json({ applications: applications.map(sanitizeApplication) });
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

    return res.json({ application: sanitizeApplication(application) });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/api-key", async (req, res, next) => {
  try {
    const apiKey = generateApiKey();
    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: { apiKeyHash: hashApiKey(apiKey) },
    });

    res.json({ application: sanitizeApplication(application), apiKey });
  } catch (error) {
    next(error);
  }
});

function sanitizeApplication(application) {
  if (!application) {
    return application;
  }

  const { apiKeyHash, ...safeApplication } = application;
  return {
    ...safeApplication,
    hasApiKey: Boolean(apiKeyHash),
  };
}

module.exports = router;
