ALTER TABLE "Incident"
ADD COLUMN "aiSummary" TEXT,
ADD COLUMN "aiRootCause" TEXT,
ADD COLUMN "aiRecommendedActions" JSONB,
ADD COLUMN "aiConfidence" TEXT,
ADD COLUMN "aiModel" TEXT,
ADD COLUMN "aiGeneratedAt" TIMESTAMP(3);
