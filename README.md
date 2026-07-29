# 🩺 Micro Q-Bank (USMLE)

Micro Q-Bank is a clinical-grade, modern web application designed for medical students to prepare for their USMLE exams. It provides high-yield questions, detailed explanations, and performance tracking in an interface that mimics real test environments.

---

## 🚀 Tech Stack

This project is built using modern, bleeding-edge web technologies:
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4)
- **Database:** PostgreSQL (hosted on [Neon](https://neon.tech/))
- **ORM:** Prisma Client
- **Caching & Rate Limiting:** [Upstash Redis](https://upstash.com/)
- **Authentication:** NextAuth.js (v4) with Credentials & Google OAuth
- **Payments:** Stripe
- **Testing:** Playwright (E2E) & Vitest (Unit)
- **Error Tracking:** Sentry

---

## 🛠️ Getting Started (For Beginners)

Follow these steps to run the project locally on your machine.

### 1. Prerequisites
You need to have **Node.js** (v18+) and **npm** installed on your computer.

### 2. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/Krishlayy/usmle-appp.git
cd usmle-appp
npm install
```

### 3. Environment Variables
You need a `.env` file in the root of the project to connect to the database and services. Ask your team for the `.env` keys, or create your own services. A typical `.env` looks like this:
```env
# Database
DATABASE_URL="postgresql://[user]:[password]@[host]/[dbname]"
DIRECT_URL="postgresql://[user]:[password]@[host]/[dbname]"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secret_key"

# Google Auth
GOOGLE_CLIENT_ID="your_google_id"
GOOGLE_CLIENT_SECRET="your_google_secret"

# Stripe
STRIPE_SECRET_KEY="your_stripe_key"
STRIPE_WEBHOOK_SECRET="your_webhook_secret"
```

### 4. Database Setup
Generate the Prisma Client so your code knows the shape of your database:
```bash
npx prisma generate
```

*(Optional)* If you are setting up a brand new database, run the seed script to create the default Question Banks and Admin users:
```bash
npm run postinstall
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. You're good to go!

---

## 🏗️ Project Structure

Understanding where things live is crucial:
- `src/app/`: Contains all the Next.js pages and API routes.
  - `/admin`: The secure admin dashboard for doctors to manage questions.
  - `/dashboard`: The student interface for taking tests.
  - `/api`: Backend endpoints (Stripe webhooks, authentication, test submission).
- `src/components/`: Reusable React components (UI elements, TestPlayer, etc.).
- `src/lib/`: Helper functions (database connection, auth configuration).
- `prisma/`: Contains `schema.prisma` which defines the database tables (User, QBank, Question, TestSession).
- `e2e/`: Playwright end-to-end tests to ensure the platform doesn't break.

---

## 🔑 Authentication & Roles

There are two primary roles in the system:
1. **STUDENT:** Can purchase QBanks, take tests, and view performance.
2. **ADMIN:** Doctors and staff who can create questions, view all users, and manage the platform. Admin routes are strictly protected by `src/proxy.ts` (middleware).

---

## 📈 How to Improve the Project (Next Steps)

If you are a developer looking to take this project to the next level, here are the highest-impact improvements you can make:

### 1. Integrate a Real Email Service
Currently, the email verification system bypasses real email delivery for local testing. 
- **Action:** Integrate [Resend](https://resend.com/) or SendGrid inside `src/app/api/auth/signup/route.ts` to send actual verification links and password reset emails to users.

### 2. Implement AWS CloudFront CDN
Images are currently served directly from AWS S3. 
- **Action:** Configure CloudFront to cache these images globally. Update the `NEXT_PUBLIC_CLOUDFRONT_DOMAIN` in the environment variables to drastically improve image loading speeds for medical diagrams.

### 3. Expand the E2E Test Suite
We currently have a solid E2E test suite in the `e2e/` folder that tests the critical user journey (Signup -> Dashboard -> Test Player).
- **Action:** Add edge-case tests (e.g., failed payments, password resets, suspending users) to ensure 100% platform stability.

### 4. AI-Powered Explanations
The codebase has `@google/genai` installed.
- **Action:** Create an Admin feature that uses the Gemini API to automatically generate detailed medical explanations or distractor rationales for newly drafted questions.

### 5. CI/CD GitHub Actions
- **Action:** Add a `.github/workflows/main.yml` file to automatically run `npm run test:e2e` and `vitest` every time someone opens a Pull Request. This ensures no broken code ever makes it to the `main` branch.

---
*Built for medical excellence.* 🩺
