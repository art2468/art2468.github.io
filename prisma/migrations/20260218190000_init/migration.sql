-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Prospect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'LinkedIn',
    "profileUrl" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "company" TEXT,
    "title" TEXT,
    "region" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "lastContactedAt" DATETIME,
    "nextFollowUpAt" DATETIME,
    "tags" JSON,
    "rawAboutText" TEXT NOT NULL,
    "rawExperienceText" TEXT NOT NULL,
    "myNotes" TEXT,
    "aiCareerSummary" JSON,
    "aiLikelyPriorities" JSON,
    "aiFitScore" INTEGER,
    "aiFitReason" TEXT,
    "aiBestAngle" TEXT,
    "aiPersonalNote" TEXT,
    "aiFollowUpQuestion" TEXT,
    "aiModel" TEXT,
    "aiRunAt" DATETIME,
    CONSTRAINT "Prospect_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Interaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prospectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "outcome" TEXT,
    CONSTRAINT "Interaction_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Prospect_userId_profileUrl_key" ON "Prospect"("userId", "profileUrl");
CREATE INDEX "Prospect_updatedAt_idx" ON "Prospect"("updatedAt");
CREATE INDEX "Prospect_status_idx" ON "Prospect"("status");
CREATE INDEX "Interaction_prospectId_createdAt_idx" ON "Interaction"("prospectId", "createdAt");
