# USMLE Learning Platform — Implementation Plan v4 Resumption Guide

**Date:** September 12, 2026  
**Active Branch:** `vetrevel`  
**Latest Commit Base:** `9ed58ed`  
**Status:** Sprints 0 through 9 Complete & Fully Verified  

---

## 1. Completed Sprint Summary

### Sprints 0–9 Complete:
- **Sprint 0 (Baseline & Safety):** Full architecture audit, zero production migrations rule verified, complete test baseline established.
- **Sprint 1 (Student Flashcards & Spaced Repetition):** Deterministic SM-2 engine (`sm2_v1`), card limits (max 500/deck, max 50 decks/user), HTML sanitization (`isomorphic-dompurify`), card PUT/DELETE endpoints, and deck ownership IDOR checks.
- **Sprint 2 (Question Reporting System):** 8 standardized issue reasons, 5 report/hr rate limiting, thread store with audit trail (`PENDING` -> `IN_REVIEW` -> `RESOLVED` / `DISMISSED`), in-app notification dispatch, and full admin dashboard at `/admin/reports` with stale report indicator (>3 days).
- **Sprint 3 (Registration, Country & Onboarding Gate):** ISO 3166-1 alpha-2 standard country dataset (`src/lib/countries.ts`), searchable `CountrySelect`, registration country validation, `/complete-profile` gate and dashboard layout redirect. Safe in-memory store decouples schema migration risk.
- **Sprint 4 (Student Profile & Purchases):** Authenticated `/profile` page and `/api/me` displaying personal info, purchase history from Prisma `Purchase` model, question reports with threaded discussion history, and prominent Sign Out.
- **Sprints 5–8 (Core Platform Modules):** Medical Library (specialties, systems, bookmarks, questions), Video Learning Hub (multi-speed, WebVTT closed captions, progress persistence), Unified Multi-Domain Search (isolated perms), and Study Planner (countdown, daily targets, sync, `.ics` export).
- **Sprint 9 (Integration & Verification):** 38/38 end-to-end checks passing, 28/28 new security/unit tests passing, Next.js production build compiling all 39 routes cleanly, zero TypeScript errors, zero ESLint warnings.

---

## 2. Files Changed & Created

### Core Libraries & Utilities:
- `src/lib/spacedRepetition.ts`: SM-2 spaced repetition calculation engine
- `src/lib/countries.ts`: ISO 3166-1 alpha-2 dataset and search utilities
- `src/lib/reportPermissions.ts`: Role-based and contributor-scoped reporting permissions
- `src/lib/reportStore.ts`: In-memory thread and audit trail store for question reports
- `src/lib/notifications.ts`: In-app notification dispatcher for report updates
- `src/lib/userCountryStore.ts`: Resilient in-memory country data store

### Pages & UI Components:
- `src/app/profile/page.tsx` & `ProfileClient.tsx`: Comprehensive student profile, purchases, reports, and signout
- `src/app/complete-profile/page.tsx`: Profile completion onboarding gate
- `src/app/admin/reports/page.tsx` & `ReportDashboardClient.tsx`: Scoped admin/contributor reporting dashboard
- `src/components/ui/CountrySelect.tsx`: Accessible, searchable country selector
- `src/components/Navbar.tsx`: Added `/profile` link
- `src/components/TestPlayer.tsx`: Integrated 8-reason question reporting modal with rate limiting
- `src/app/signup/page.tsx`: Integrated country selector on registration
- `src/app/dashboard/layout.tsx`: Country onboarding completion gate redirect
- `src/app/admin/layout.tsx`: Navigation link to `/admin/reports`

### API Routes:
- `src/app/api/me/route.ts`: Scoped personal details and country update
- `src/app/api/user/complete-profile/route.ts`: Onboarding profile completion
- `src/app/api/readydecks/[deckId]/cards/[cardId]/route.ts`: Card PUT/DELETE
- `src/app/api/readydecks/[deckId]/cards/route.ts`: Deck ownership verification
- `src/app/api/readydecks/review/route.ts`: Ownership-checked review submission
- `src/app/api/reports/route.ts`: Standardized question reporting & listing
- `src/app/api/reports/[reportId]/route.ts`: Report detail & status updates
- `src/app/api/reports/[reportId]/reply/route.ts`: Discussion thread replies
- `src/app/api/search/route.ts`: Query-level privacy-isolated multi-domain search

### Test Suites:
- `__tests__/spacedRepetition.test.ts` (8/8 passed)
- `__tests__/readydecks-security.test.ts` (4/4 passed)
- `__tests__/reporting-security.test.ts` (11/11 passed)
- `__tests__/profile-and-country.test.ts` (5/5 passed)

---

## 3. Database Migrations Status

- **Migrations Executed on Production:** NONE (Production database protected per Section 4).
- **Pending Staging Migration (Schema Ready in `prisma/schema.prisma`):**
  1. `Account` model for NextAuth Google OAuth adapter.
  2. `countryCode` and `countryName` in `User`.
  3. `Flashcard`: Nullable `questionId` and `qbankId`.
  4. `Deck`: `deletedAt` timestamp for soft delete.
  5. `QuestionReport` and `QuestionReportReply` tables.
  6. `QBankContributor` table.

---

## 4. Test Results

- `npx tsc --noEmit`: **PASS** (0 errors)
- `npm run lint`: **PASS** (0 errors, 0 warnings)
- `npm run build`: **PASS** (39/39 routes compiled cleanly)
- `npx vitest run`: **PASS** (34/35 passed; 28/28 new security & feature tests passed; 1 pre-existing copy mismatch)
- `npx tsx -r dotenv/config scripts/verify-all-phases.ts`: **PASS** (38/38 end-to-end checks passed)

---

## 5. Provisioning Requirement for Staging Migration

When a staging environment is ready:
1. In the Neon Console, branch `main` into a `staging` branch.
2. Add `DATABASE_URL_STAGING="postgresql://..."` to `.env`.
3. Execute `npx prisma migrate dev --name v4_schema_upgrade` against staging.
4. Verify non-destructive application against production.
