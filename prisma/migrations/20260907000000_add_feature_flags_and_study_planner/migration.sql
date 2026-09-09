-- CreateEnum
CREATE TYPE "PlanTaskType" AS ENUM ('QUESTION_BLOCK', 'FLASHCARD_REVIEW', 'VIDEO_LESSON', 'READING', 'CUSTOM');

-- CreateTable
CREATE TABLE IF NOT EXISTS "FeatureFlag" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "StudyPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'USMLE Study Plan',
    "targetExamDate" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "dailyGoalQuestions" INTEGER NOT NULL DEFAULT 40,
    "weeklyGoalQuestions" INTEGER NOT NULL DEFAULT 200,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PlanTask" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "taskType" "PlanTaskType" NOT NULL DEFAULT 'QUESTION_BLOCK',
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "contentType" TEXT,
    "contentId" TEXT,
    "contentMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "FeatureFlag_key_key" ON "FeatureFlag"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FeatureFlag_key_idx" ON "FeatureFlag"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StudyPlan_userId_isActive_idx" ON "StudyPlan"("userId", "isActive");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PlanTask_planId_scheduledDate_idx" ON "PlanTask"("planId", "scheduledDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PlanTask_userId_scheduledDate_idx" ON "PlanTask"("userId", "scheduledDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PlanTask_isCompleted_idx" ON "PlanTask"("isCompleted");

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'StudyPlan_userId_fkey'
  ) THEN
    ALTER TABLE "StudyPlan" ADD CONSTRAINT "StudyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PlanTask_planId_fkey'
  ) THEN
    ALTER TABLE "PlanTask" ADD CONSTRAINT "PlanTask_planId_fkey" FOREIGN KEY ("planId") REFERENCES "StudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PlanTask_userId_fkey'
  ) THEN
    ALTER TABLE "PlanTask" ADD CONSTRAINT "PlanTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
