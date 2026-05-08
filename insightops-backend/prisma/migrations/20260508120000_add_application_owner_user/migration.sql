-- Scope applications to Supabase Auth users.
ALTER TABLE "Application" ADD COLUMN "ownerUserId" TEXT;

DROP INDEX IF EXISTS "Application_name_environment_key";

CREATE UNIQUE INDEX "Application_ownerUserId_name_environment_key"
  ON "Application"("ownerUserId", "name", "environment");

CREATE INDEX "Application_ownerUserId_idx" ON "Application"("ownerUserId");
