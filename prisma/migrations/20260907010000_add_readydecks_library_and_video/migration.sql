-- ====================================================
-- PHASE 1: READYDECKS / FLASHCARDS 2.0
-- ====================================================

CREATE TABLE IF NOT EXISTS "Deck" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DeckCard" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeckCard_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "FlashcardReview" (
    "id" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previousInterval" INTEGER NOT NULL DEFAULT 0,
    "newInterval" INTEGER NOT NULL DEFAULT 1,
    "previousEaseFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "newEaseFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "algorithmVersion" TEXT NOT NULL DEFAULT 'sm2_v1',

    CONSTRAINT "FlashcardReview_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Deck_subject_idx" ON "Deck"("subject");
CREATE INDEX IF NOT EXISTS "Deck_isPublished_idx" ON "Deck"("isPublished");
CREATE INDEX IF NOT EXISTS "Deck_authorId_idx" ON "Deck"("authorId");

CREATE UNIQUE INDEX IF NOT EXISTS "DeckCard_deckId_flashcardId_key" ON "DeckCard"("deckId", "flashcardId");
CREATE INDEX IF NOT EXISTS "DeckCard_deckId_position_idx" ON "DeckCard"("deckId", "position");

CREATE INDEX IF NOT EXISTS "FlashcardReview_userId_reviewedAt_idx" ON "FlashcardReview"("userId", "reviewedAt");
CREATE INDEX IF NOT EXISTS "FlashcardReview_flashcardId_userId_idx" ON "FlashcardReview"("flashcardId", "userId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Deck_authorId_fkey') THEN
    ALTER TABLE "Deck" ADD CONSTRAINT "Deck_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DeckCard_deckId_fkey') THEN
    ALTER TABLE "DeckCard" ADD CONSTRAINT "DeckCard_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DeckCard_flashcardId_fkey') THEN
    ALTER TABLE "DeckCard" ADD CONSTRAINT "DeckCard_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "Flashcard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FlashcardReview_flashcardId_fkey') THEN
    ALTER TABLE "FlashcardReview" ADD CONSTRAINT "FlashcardReview_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "Flashcard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FlashcardReview_userId_fkey') THEN
    ALTER TABLE "FlashcardReview" ADD CONSTRAINT "FlashcardReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ====================================================
-- PHASE 2: MEDICAL LIBRARY
-- ====================================================

CREATE TABLE IF NOT EXISTS "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "system" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "authorId" TEXT NOT NULL,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ArticleRevision" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "editorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "summary" TEXT,
    "changeDescription" TEXT,
    "editedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleRevision_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ArticleQuestion" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "ArticleQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ArticleBookmark" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleBookmark_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ArticleView" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "userId" TEXT,
    "viewDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleView_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Article_slug_key" ON "Article"("slug");
CREATE INDEX IF NOT EXISTS "Article_specialty_idx" ON "Article"("specialty");
CREATE INDEX IF NOT EXISTS "Article_status_idx" ON "Article"("status");
CREATE INDEX IF NOT EXISTS "Article_slug_idx" ON "Article"("slug");

CREATE INDEX IF NOT EXISTS "ArticleRevision_articleId_editedAt_idx" ON "ArticleRevision"("articleId", "editedAt");

CREATE UNIQUE INDEX IF NOT EXISTS "ArticleQuestion_articleId_questionId_key" ON "ArticleQuestion"("articleId", "questionId");
CREATE INDEX IF NOT EXISTS "ArticleQuestion_articleId_idx" ON "ArticleQuestion"("articleId");
CREATE INDEX IF NOT EXISTS "ArticleQuestion_questionId_idx" ON "ArticleQuestion"("questionId");

CREATE UNIQUE INDEX IF NOT EXISTS "ArticleBookmark_articleId_userId_key" ON "ArticleBookmark"("articleId", "userId");
CREATE INDEX IF NOT EXISTS "ArticleBookmark_userId_idx" ON "ArticleBookmark"("userId");

CREATE INDEX IF NOT EXISTS "ArticleView_articleId_viewDate_idx" ON "ArticleView"("articleId", "viewDate");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Article_authorId_fkey') THEN
    ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ArticleRevision_articleId_fkey') THEN
    ALTER TABLE "ArticleRevision" ADD CONSTRAINT "ArticleRevision_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ArticleRevision_editorId_fkey') THEN
    ALTER TABLE "ArticleRevision" ADD CONSTRAINT "ArticleRevision_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ArticleQuestion_articleId_fkey') THEN
    ALTER TABLE "ArticleQuestion" ADD CONSTRAINT "ArticleQuestion_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ArticleQuestion_questionId_fkey') THEN
    ALTER TABLE "ArticleQuestion" ADD CONSTRAINT "ArticleQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ArticleBookmark_articleId_fkey') THEN
    ALTER TABLE "ArticleBookmark" ADD CONSTRAINT "ArticleBookmark_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ArticleBookmark_userId_fkey') THEN
    ALTER TABLE "ArticleBookmark" ADD CONSTRAINT "ArticleBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ====================================================
-- PHASE 4 & 5: VIDEO LEARNING HUB
-- ====================================================

CREATE TABLE IF NOT EXISTS "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CourseModule" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseModule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CourseLesson" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    "relatedTopic" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseLesson_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CourseVideoProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "positionSec" INTEGER NOT NULL DEFAULT 0,
    "percentComplete" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseVideoProgress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LessonCaption" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonCaption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Course_slug_key" ON "Course"("slug");
CREATE INDEX IF NOT EXISTS "Course_specialty_status_idx" ON "Course"("specialty", "status");

CREATE INDEX IF NOT EXISTS "CourseModule_courseId_position_idx" ON "CourseModule"("courseId", "position");

CREATE INDEX IF NOT EXISTS "CourseLesson_moduleId_position_idx" ON "CourseLesson"("moduleId", "position");

CREATE UNIQUE INDEX IF NOT EXISTS "CourseVideoProgress_userId_lessonId_key" ON "CourseVideoProgress"("userId", "lessonId");
CREATE INDEX IF NOT EXISTS "CourseVideoProgress_userId_idx" ON "CourseVideoProgress"("userId");
CREATE INDEX IF NOT EXISTS "CourseVideoProgress_lessonId_idx" ON "CourseVideoProgress"("lessonId");

CREATE UNIQUE INDEX IF NOT EXISTS "LessonCaption_lessonId_language_key" ON "LessonCaption"("lessonId", "language");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CourseModule_courseId_fkey') THEN
    ALTER TABLE "CourseModule" ADD CONSTRAINT "CourseModule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CourseLesson_moduleId_fkey') THEN
    ALTER TABLE "CourseLesson" ADD CONSTRAINT "CourseLesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CourseVideoProgress_userId_fkey') THEN
    ALTER TABLE "CourseVideoProgress" ADD CONSTRAINT "CourseVideoProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CourseVideoProgress_lessonId_fkey') THEN
    ALTER TABLE "CourseVideoProgress" ADD CONSTRAINT "CourseVideoProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "CourseLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LessonCaption_lessonId_fkey') THEN
    ALTER TABLE "LessonCaption" ADD CONSTRAINT "LessonCaption_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "CourseLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
