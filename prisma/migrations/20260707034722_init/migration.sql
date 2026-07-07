-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orgName" TEXT NOT NULL,
    "yearsFounded" INTEGER NOT NULL,
    "hasDonataria" BOOLEAN NOT NULL,
    "respondentRole" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "levelName" TEXT NOT NULL,
    "blockScores" JSONB NOT NULL,
    "wantsToEnroll" BOOLEAN NOT NULL DEFAULT false,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Submission_createdAt_idx" ON "Submission"("createdAt");

-- CreateIndex
CREATE INDEX "Submission_level_idx" ON "Submission"("level");
