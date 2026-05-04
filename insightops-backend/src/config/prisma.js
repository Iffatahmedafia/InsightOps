const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

async function connectDatabase() {
  await prisma.$connect();
  console.log("PostgreSQL connected through Prisma");
}

module.exports = { connectDatabase, prisma };
