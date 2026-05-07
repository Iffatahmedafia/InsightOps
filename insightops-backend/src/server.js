const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const { Server } = require("socket.io");

const { connectDatabase } = require("./config/prisma");
const { errorHandler } = require("./middleware/errorHandler");
const applicationRoutes = require("./routes/applicationRoutes");
const healthCheckRoutes = require("./routes/healthCheckRoutes");
const healthRoutes = require("./routes/healthRoutes");
const ingestRoutes = require("./routes/ingestRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const metricsRoutes = require("./routes/metricsRoutes");
const logRoutes = require("./routes/logRoutes");

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000;
const allowedOrigins = getAllowedOrigins();

function getAllowedOrigins() {
  const configuredOrigins = process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || "http://localhost:3000";

  return configuredOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function corsOrigin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  return callback(new Error(`Origin ${origin} is not allowed by CORS`));
}

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

app.set("io", io);
app.use(helmet());
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use("/health", healthRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/health-checks", healthCheckRoutes);
app.use("/api/ingest", ingestRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/logs", logRoutes);
app.use(errorHandler);

io.on("connection", (socket) => {
  socket.emit("connected", { message: "Connected to InsightOps realtime feed" });
});

async function start() {
  await connectDatabase();

  server.listen(port, () => {
    console.log(`InsightOps backend listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start InsightOps backend", error);
  process.exit(1);
});
