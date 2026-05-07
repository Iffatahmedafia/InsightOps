-- Add route and method to incidents so metric incidents can be tracked per endpoint.
ALTER TABLE "Incident" ADD COLUMN "route" TEXT;
ALTER TABLE "Incident" ADD COLUMN "method" TEXT;

CREATE INDEX "Incident_applicationId_route_method_idx" ON "Incident"("applicationId", "route", "method");
