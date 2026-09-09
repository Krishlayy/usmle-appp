# USMLE Learning Platform — Implementation Plan v4 Baseline Audit

**Date:** September 10, 2026  
**Repository:** usmle-appp  
**Branch:** vetrevel  
**Base Commit:** 185df44 (based on 3b27532)  
**Audit Scope:** Full codebase audit covering Sprints 0 through 9 of Implementation Plan v4.

---

## 1. Executive Summary & Repository Structure

The repository is a Next.js 16 (App Router) enterprise medical question bank and learning platform built with React 19, TypeScript 5, Tailwind CSS 4, Prisma ORM 7.8, and Neon PostgreSQL.

### Technology Stack
- **Framework:** Next.js 16.2.10 (Turbopack, App Router)
- **UI & Styling:** React 19.2.7, Tailwind CSS 4.3.2, Framer Motion 12.42, Lucide React icons, Tiptap rich text
- **ORM & Database:** Prisma 7.8.0, @prisma/adapter-pg connecting to remote Neon PostgreSQL (DATABASE_URL)
- **Authentication:** NextAuth.js 4.24.14 (@next-auth/prisma-adapter), Credentials Provider with bcryptjs, Google OAuth provider
- **Rate Limiting:** @upstash/ratelimit, @upstash/redis
- **Testing:** Vitest 4.1.10 (jsdom, @testing-library/react), Playwright 1.61.1
- **Payments:** Stripe 22.3.0
- **Media:** AWS S3 SDK (@aws-sdk/client-s3), ImageKit

---

## 2. What Exists & What Works

### 2.1 QBank Core & TestPlayer
- **Active QBanks:** 6 published QBanks with 81 total board-style questions across Cardiology, Biochemistry, Immunology, Microbiology, Pharmacology, and Pathology.
- **Test Modes:** Tutor Mode (instant explanations after each answer) and Timed Mode (countdown timer, submission review).
- **Test Session Lifecycle:** Creation, question navigation, option selection, strikethrough, bookmarks/flags, rich text notes with auto-save, results calculation, and detailed score report.
- **Clinical Exam UI:** High-fidelity replication of USMLE exam interface with split stem/exhibits, lab values drawer, highlighting, and calculator.

### 2.2 ReadyDecks / Flashcards 2.0
- **Spaced Repetition Engine:** Server-authoritative SM-2 algorithm (sm2_v1) in src/lib/spacedRepetition.ts. Deterministic ratings: AGAIN (interval reset to 1, ease penalized), GOOD (interval scaled), EASY (bonus factor + ease boost). 8/8 unit tests passing.
- **Decks System:** Deck and DeckCard models in Prisma schema. Curated and personal decks, flip card animation, review queue with due counts.
- **Cross-Feature Integration:** Explanation bar in TestPlayer.tsx features Create ReadyDecks Flashcard shortcut pre-filling question text and high-yield explanation.

### 2.3 Medical Library & High-Yield Reference
- **Articles & Slugs:** Article, ArticleRevision, ArticleQuestion, ArticleBookmark models.
- **Content:** Seeded high-yield cardiology articles (aortic-dissection, infective-endocarditis) linked to board questions.
- **UI:** Full-text reader at /library and /library/[slug] with bookmarking and bidirectional practice questions.

### 2.4 Video Learning Hub
- **Catalog:** Course, CourseModule, CourseLesson, CourseVideoProgress, LessonCaption models.
- **Player:** HTML5 player with WebVTT multi-language subtitles, playback speed control (0.75x to 2.0x), position auto-save, completion marking (>= 90%), and recommended practice questions.

### 2.5 Unified Multi-Domain Search
- **API & UI:** /api/search querying Questions, Articles, Decks, and Notes. Client at /dashboard/[qbankSlug]/search with 250ms debounced input and category filter tabs.

### 2.6 Study Planner
- **Planning Engine:** StudyPlan and PlanTask models with exam countdown timer, daily/weekly question pace calculators, task checklist, and RFC 5545 iCalendar (.ics) export.
- **Automated Sync:** Test session submissions, video completions, and card reviews automatically complete corresponding daily plan tasks.

---

## 3. What Is Incomplete or Broken

### 3.1 Google OAuth Identity Mapping (CRITICAL BLOCKER)
- **Problem:** src/lib/auth.ts configures adapter: PrismaAdapter(prisma) and GoogleProvider. However, the Prisma schema omits model Account!
- **Impact:** When a user attempts to sign in via Google OAuth, @next-auth/prisma-adapter executes prisma.account.findFirst or prisma.account.create. Because Account model does not exist in the Prisma schema or database, Google OAuth fails with a runtime database exception.
- **Resolution Needed:** Add standard NextAuth model Account to prisma/schema.prisma.

### 3.2 Country Data & Student Onboarding Gate (INCOMPLETE)
- **Problem:** The User model currently lacks structured country fields (countryCode, countryName).
- **Impact:** Normal signup does not collect or validate country; Google OAuth users have no country data and there is no non-bypassable profile completion redirect.
- **Resolution Needed:** Add countryCode (ISO 3166-1 alpha-2) and countryName to User, create /complete-profile route, update signup form and API, and enforce completion in layout.

### 3.3 Question Reporting System (INCOMPLETE / LEGACY)
- **Problem:** Existing codebase only has a minimal legacy QuestionIssue model (issueType, description, status). It lacks:
  - Granular reasons (INCORRECT_QUESTION, INCORRECT_ANSWER, INCORRECT_EXPLANATION, MULTIPLE_CORRECT_ANSWERS, NO_CORRECT_ANSWER, TYPO, AMBIGUITY, OTHER).
  - Discussion replies (QuestionReportReply model).
  - Rate limiting (max 1 open report per student/question within 24 hours).
  - Contributor QBank scoping model (QBankContributor).
  - Student report history view in profile.
  - Notifications for report status transitions and replies.

### 3.4 Student Decks Management & Soft Delete (INCOMPLETE)
- **Problem:** Flashcard requires non-nullable questionId and qbankId, preventing students from creating purely manual cards without referencing a board question.
- **Problem:** Deck lacks deletedAt for soft-delete preservation of historical reviews.
- **Problem:** Card limit and deck limit configuration and UI indicators are not implemented.

### 3.5 Student Profile Page (/profile) (MISSING)
- Dedicated /profile route does not exist. Students cannot view personal details, purchase history, or submitted reports.

### 3.6 Email Verification Delivery (PARTIAL / SIMULATED)
- src/app/api/auth/signup/route.ts creates a verification token but logs the link to console using a dummy service ([DUMMY EMAIL SERVICE]). Real SMTP sending via nodemailer using the existing .env SMTP variables is not implemented.

---

## 4. Schema & Seed Inconsistencies

1. **Missing Account Model:** Required by @next-auth/prisma-adapter for Google OAuth.
2. **Missing QBankContributor Model:** Required for granular contributor assignment to specific QBanks.
3. **Missing QuestionReport & QuestionReportReply:** Replaces legacy un-threaded QuestionIssue.
4. **Flashcard Foreign Key Nullability:** questionId is currently non-nullable, blocking manual personal flashcards.
5. **Pre-existing Seeds:** prisma/seed.ts seeds only 15 Cardiology questions. The production database contains 81 questions seeded through other scripts.

---

## 5. Security & Authorization Audit

- **IDOR Protection in ReadyDecks:** GET /api/readydecks/[deckId] and cards route must strictly enforce authorId === session.user.id or isPublished: true. Non-owners must never access private cards.
- **Reporting Permissions:** A student must only view and reply to their own reports. QBank contributors must strictly be restricted to their assigned qbankId. Global unrestricted report APIs must never be created.
- **Profile Ownership:** Profile endpoints must use authenticated session identity (session.user.id), never accepting client-supplied userId.
- **Search Isolation:** Multi-domain search must filter at the database query level (where: { userId: session.user.id } for flashcards) to prevent private deck leaks.

---

## 6. Test Baseline Status

- **Typecheck (npx tsc --noEmit):** PASS (0 errors)
- **Lint (npm run lint):** PASS (0 warnings, 0 errors)
- **Build (npm run build):** PASS (36/36 static/dynamic pages compiled successfully)
- **Unit Tests (npm run test:unit):**
  - Total: 4 test files, 15 tests.
  - Passed: 3 files, 14 tests (spacedRepetition.test.ts, TestSettingsProvider.test.tsx, verifyQbankAccess.test.ts).
  - Pre-existing Failure: 1 test in __tests__/home-page.test.tsx checking for outdated copy 'master medical concepts' vs modernized 'Master USMLE Concepts'.

---

## 7. Database Staging & Migration Blocker (Section 4 Compliance)

Per Section 4 of Implementation Plan v4:
- The environment variable DATABASE_URL_STAGING does NOT exist.
- No staging Neon database or branch is configured in .env.
- In accordance with the absolute safety rule:
  > 'If a staging database/Neon branch does NOT exist: STOP BEFORE RUNNING THE MIGRATION. Do NOT migrate against the primary DATABASE_URL. Report: BLOCKED — staging/Neon branch required before migration. Tell me exactly what is needed to provision/configure it.'
- **Status:** **BLOCKED for production database migrations** until a staging connection string is provided.
