-- Add application-level API key hashes for authenticated ingestion.
ALTER TABLE "Application" ADD COLUMN "apiKeyHash" TEXT;

CREATE UNIQUE INDEX "Application_apiKeyHash_key" ON "Application"("apiKeyHash");
