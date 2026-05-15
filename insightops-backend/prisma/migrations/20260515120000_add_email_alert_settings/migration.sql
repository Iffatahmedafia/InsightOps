ALTER TABLE "Application"
ADD COLUMN "alertEmail" TEXT,
ADD COLUMN "alertsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "incidentOpenedAlertsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "serviceDownAlertsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "incidentResolvedAlertsEnabled" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Incident"
ADD COLUMN "openedAlertSentAt" TIMESTAMP(3),
ADD COLUMN "resolvedAlertSentAt" TIMESTAMP(3);
