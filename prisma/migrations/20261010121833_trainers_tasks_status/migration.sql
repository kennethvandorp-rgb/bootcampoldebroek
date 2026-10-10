/*
  Warnings:

  - You are about to drop the column `contactIntervalWeeks` on the `Client` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'TRAINER',
    "passwordHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClientTrainer" (
    "clientId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("clientId", "trainerId"),
    CONSTRAINT "ClientTrainer_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClientTrainer_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScheduledTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "note" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "contactMomentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScheduledTask_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScheduledTask_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScheduledTask_contactMomentId_fkey" FOREIGN KEY ("contactMomentId") REFERENCES "ContactMoment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "birthDate" DATETIME,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastContactDate" DATETIME,
    "ptSessionsPerWeek" INTEGER,
    "ptSessionMinutes" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Client" ("active", "birthDate", "createdAt", "email", "firstName", "id", "lastName", "notes", "phone", "ptSessionMinutes", "ptSessionsPerWeek", "startDate", "updatedAt") SELECT "active", "birthDate", "createdAt", "email", "firstName", "id", "lastName", "notes", "phone", "ptSessionMinutes", "ptSessionsPerWeek", "startDate", "updatedAt" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE TABLE "new_ContactMoment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "trainerId" TEXT,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContactMoment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContactMoment_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ContactMoment" ("clientId", "createdAt", "date", "id", "notes", "summary", "type") SELECT "clientId", "createdAt", "date", "id", "notes", "summary", "type" FROM "ContactMoment";
DROP TABLE "ContactMoment";
ALTER TABLE "new_ContactMoment" RENAME TO "ContactMoment";
CREATE INDEX "ContactMoment_clientId_date_idx" ON "ContactMoment"("clientId", "date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "ClientTrainer_trainerId_idx" ON "ClientTrainer"("trainerId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledTask_contactMomentId_key" ON "ScheduledTask"("contactMomentId");

-- CreateIndex
CREATE INDEX "ScheduledTask_trainerId_completed_dueDate_idx" ON "ScheduledTask"("trainerId", "completed", "dueDate");

-- CreateIndex
CREATE INDEX "ScheduledTask_clientId_completed_idx" ON "ScheduledTask"("clientId", "completed");

-- Data: oude contacttypen omzetten naar de nieuwe set
UPDATE "ContactMoment" SET "type" = 'TELEFONISCH' WHERE "type" = 'BELAFSPRAAK';
UPDATE "ContactMoment" SET "type" = 'OVERIG' WHERE "type" = 'PERSOONLIJK';

-- Data: laatste contactdatum per klant vullen
UPDATE "Client" SET "lastContactDate" = (
    SELECT MAX("date") FROM "ContactMoment" WHERE "ContactMoment"."clientId" = "Client"."id"
);
