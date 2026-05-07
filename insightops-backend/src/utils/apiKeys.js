const crypto = require("crypto");

function generateApiKey() {
  return `iops_${crypto.randomBytes(32).toString("hex")}`;
}

function hashApiKey(apiKey) {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

module.exports = { generateApiKey, hashApiKey };
