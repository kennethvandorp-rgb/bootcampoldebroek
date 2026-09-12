-- AlterTable
ALTER TABLE "Client" ADD COLUMN "ptSessionMinutes" INTEGER;
ALTER TABLE "Client" ADD COLUMN "ptSessionsPerWeek" INTEGER;

-- CreateTable
CREATE TABLE "AutomationRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overdueCount" INTEGER NOT NULL,
    "dueSoonCount" INTEGER NOT NULL,
    "neverCount" INTEGER NOT NULL,
    "notifiedByEmail" BOOLEAN NOT NULL DEFAULT false
);
