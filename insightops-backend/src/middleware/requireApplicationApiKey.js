const { prisma } = require("../config/prisma");
const { hashApiKey } = require("../utils/apiKeys");

async function requireApplicationApiKey(req, res, next) {
  try {
    const apiKey = req.get("x-api-key");

    if (!apiKey) {
      return res.status(401).json({
        error: { message: "Missing x-api-key header" },
      });
    }

    const application = await prisma.application.findUnique({
      where: { apiKeyHash: hashApiKey(apiKey) },
    });

    if (!application) {
      return res.status(401).json({
        error: { message: "Invalid API key" },
      });
    }

    req.application = application;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { requireApplicationApiKey };
