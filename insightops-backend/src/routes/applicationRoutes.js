const express = require("express");
const { z } = require("zod");

const { prisma } = require("../config/prisma");
const { validate } = require("../middleware/validate");
const { requireUserAuth } = require("../middleware/requireUserAuth");
const { generateApiKey, hashApiKey } = require("../utils/apiKeys");

const router = express.Router();
router.use(requireUserAuth);

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
        ownerUserId_name_environment: {
          ownerUserId: req.user.id,
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
        ownerUserId: req.user.id,
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
      where: { ownerUserId: req.user.id },
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

    if (!application || application.ownerUserId !== req.user.id) {
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
    const application = await prisma.application.findFirst({
      where: { id: req.params.id, ownerUserId: req.user.id },
    });

    if (!application) {
      return res.status(404).json({ error: { message: "Application not found" } });
    }

    const updatedApplication = await prisma.application.update({
      where: { id: application.id },
      data: { apiKeyHash: hashApiKey(apiKey) },
    });

    return res.json({ application: sanitizeApplication(updatedApplication), apiKey });
  } catch (error) {
    return next(error);
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
