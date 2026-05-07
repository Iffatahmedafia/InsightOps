-- Add first-class route and method fields to log entries.
ALTER TABLE "LogEntry" ADD COLUMN "route" TEXT;
ALTER TABLE "LogEntry" ADD COLUMN "method" TEXT;

CREATE INDEX "LogEntry_route_idx" ON "LogEntry"("route");
