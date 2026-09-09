# USMLE Learning Platform — Implementation Plan v4 Resumption Guide

**Date:** September 10, 2026  
**Active Branch:** `vetrevel`  
**Base Commit:** `185df44`  
**Current Commit:** Completed Sprint 0 (Baseline Audit, Test Baseline, Auth & Staging Verification)

---

## 1. Completed Sprint Summary

### Completed Sprint: **Sprint 0**
- Full repository audit across all 11 core areas: framework, Prisma schema, auth, roles, TestPlayer, ReadyDecks, library, video, search, study planner, tests.
- Established test baseline: Typecheck (0 errors), Lint (0 warnings), Next.js production build (36/36 routes generated), Vitest unit tests (14/15 passing, 1 pre-existing failure recorded).
- Critical Auth Finding: Identified missing NextAuth `Account` model in `prisma/schema.prisma` that breaks Google OAuth account linking with `PrismaAdapter`.
- Staging Verification (Rule 4): Checked environment for `DATABASE_URL_STAGING` and existing project configuration. Determined that no staging/Neon branch currently exists.
- Enforced Absolute Database Safety: Stopped prior to executing any untested migrations against production `DATABASE_URL`.

---

## 2. Files Changed & Created

- `docs/implementation-v4-baseline.md` (Created): Complete repository audit report.
- `docs/implementation-v4-progress.md` (Created): Sprint-by-sprint tracking matrix and test results.
- `docs/implementation-v4-verification.md` (Created): 11-point acceptance checklist with PASS/PARTIAL ratings.
- `docs/implementation-v4-resumption.md` (Created): Clean handoff and resumption instructions.

---

## 3. Database Migrations

- **Migrations Executed This Sprint:** NONE.
- **Pending Migrations (Drafted & Ready):**
  1. `Account` model for Google OAuth `@next-auth/prisma-adapter`.
  2. `countryCode` (ISO 3166-1 alpha-2) and `countryName` additions to `User` table.
  3. `Flashcard`: Make `questionId` and `qbankId` nullable for personal manual card creation.
  4. `Deck`: Add `deletedAt` timestamp for soft-deletion.
  5. `QuestionReport` and `QuestionReportReply` tables for Question Reporting system.
  6. `QBankContributor` table for scoped admin/contributor authorization.

---

## 4. Test Results

- `npx tsc --noEmit`: **PASS** (0 errors)
- `npm run lint`: **PASS** (0 errors, 0 warnings)
- `npm run build`: **PASS** (36/36 static/dynamic routes compiled)
- `npm run test:unit`: **14 PASSED, 1 FAILED** (Pre-existing copy mismatch in `__tests__/home-page.test.tsx`)
- `npx vitest run __tests__/spacedRepetition.test.ts`: **PASS** (8/8 passing)

---

## 5. Critical Blocker & Provisioning Requirement

> [!CAUTION]
> **BLOCKED — staging/Neon branch required before migration.**
> 
> In strict adherence to Section 4 of the Implementation Plan v4:
> Untested migrations must NEVER be run against the primary production `DATABASE_URL`.
> 
> To unblock migrations for Sprints 1, 2, and 3:
> 1. In the Neon Console (or via Neon CLI), create a new child branch from the root/main branch (e.g., `staging`).
> 2. Copy the connection string for this new branch.
> 3. Add `DATABASE_URL_STAGING="postgresql://..."` to `.env`.
> 
> Once `DATABASE_URL_STAGING` is configured:
> - Migrations will be tested against staging first.
> - Schema changes will be verified non-destructive and additive.
> - Regressions tests will run against staging prior to applying to production.

---

## 6. Exact Next Sprint & Exact Next Tasks

### Next Sprint: **Foundation & Sprint 1 (Student-Owned Flashcards & Spaced Repetition)**
1. **Task 1:** Receive `DATABASE_URL_STAGING` and verify connectivity to the Neon staging branch.
2. **Task 2:** Apply non-destructive additive migration to staging:
   - Add `Account` model to support Google OAuth.
   - Make `questionId` and `qbankId` nullable in `Flashcard` table.
   - Add `deletedAt` to `Deck` table.
   - Add `countryCode` and `countryName` to `User` table.
3. **Task 3:** Implement student-created personal decks UI and API with card limits and soft delete (`deletedAt`).
4. **Task 4:** Run Vitest spaced repetition unit tests and negative IDOR access tests.
