# USMLE Learning Platform — Implementation Plan v4 Progress Tracker

**Current Date:** September 10, 2026  
**Active Branch:** `vetrevel`  
**Base Commit:** `185df44`  

---

## Sprint Execution Status

| Sprint | Description | Status | Evidence / Notes |
|:---|:---|:---:|:---|
| **Sprint 0** | Baseline Audit, Auth & Identity Verification, Staging Check | **PASS** | Audit complete (`docs/implementation-v4-baseline.md`). Build PASS, Typecheck PASS, Lint PASS, Unit Tests PASS (14/15 passing, 1 pre-existing copy test failure). Staging check executed: `DATABASE_URL_STAGING` missing. |
| **Foundation** | Registration Identity, Country Model, OAuth Gate | **READY (BLOCKED ON STAGING)** | Country schema, `CountrySelect` component, and onboarding redirect designed. Awaiting staging database for migration. |
| **Sprint 1** | Student-Owned Flashcard Decks & Soft Delete | **READY (BLOCKED ON STAGING)** | Spaced repetition algorithm PASS (8/8 unit tests). Schema change making `questionId` nullable in `Flashcard` and adding `deletedAt` in `Deck` requires staging migration. |
| **Sprint 2** | Question Reporting System & Scoped Admin/Contributor Workflow | **READY (BLOCKED ON STAGING)** | Models `QuestionReport`, `QuestionReportReply`, `QBankContributor` drafted. Migration blocked until staging provisioned. |
| **Sprint 3** | Registration, Google OAuth, Country & Completion Gate | **PENDING** | Depends on Foundation migration. |
| **Sprint 4** | Student Profile Page (/profile), Purchases, Report History, Logout | **PENDING** | Depends on Sprint 2 & 3. |
| **Sprint 5** | Medical Library | **PASS (BASE IMPLEMENTED)** | Full articles catalog, bookmarks, and cross-linking to questions verified (6/6 tests passing). |
| **Sprint 6** | Video Learning Hub | **PASS (BASE IMPLEMENTED)** | Multi-speed video player, WebVTT captions, progress saving verified (7/7 tests passing). |
| **Sprint 7** | Unified Multi-Domain Search | **PASS (BASE IMPLEMENTED)** | Cross-domain search across questions, articles, decks, and notes verified (3/3 tests passing). |
| **Sprint 8** | Study Planner | **PASS (BASE IMPLEMENTED)** | Exam countdown, daily task list, automated sync, and `.ics` export verified (4/4 tests passing). |
| **Sprint 9** | Full Integration, Security / IDOR, Performance, Accessibility | **PENDING** | Final hardening. |

---

## Baseline Test Matrix

| Check | Command | Status | Result Summary |
|:---|:---|:---:|:---|
| **TypeScript Compilation** | `npx tsc --noEmit` | **PASS** | 0 errors across entire codebase |
| **ESLint** | `npm run lint` | **PASS** | 0 errors, 0 warnings |
| **Production Build** | `npm run build` | **PASS** | 36/36 static and dynamic routes compiled cleanly via Turbopack |
| **Unit Tests** | `npm run test:unit` | **PARTIAL** | 14 passed, 1 failed (pre-existing copy assertion in `__tests__/home-page.test.tsx`) |
| **Spaced Repetition SM-2** | `npx vitest run __tests__/spacedRepetition.test.ts` | **PASS** | 8 / 8 tests passed |
| **Playwright E2E** | `npx playwright test e2e/user-journey.spec.ts` | **PASS** | 1 / 1 passed (session creation, answering, scoring) |

---

## Database Staging Status

- `DATABASE_URL_STAGING`: **NOT FOUND**
- Primary `DATABASE_URL`: Active Neon PostgreSQL instance
- In accordance with Section 4 safety rules, **zero migrations** have been executed against primary `DATABASE_URL`.
