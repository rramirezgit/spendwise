<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000?style=flat-square&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/TanStack_Query-5-FF4154?style=flat-square" />
</p>

<h1 align="center">Spendwise</h1>

<p align="center">
  <strong>A shared monthly budget, in daily production use.</strong><br/>
  <em>A mobile-first expense tracker — full-stack Next.js and Prisma.</em>
</p>

---

## What it demonstrates

A **full-stack** Next.js app (front and back in one codebase) built around fast expense entry and honest money math.

- **Fast entry** — a custom numeric keypad with one-tap category chips; the daily-spend flow saves in as few as 3 taps when the default category applies.
- **Mobile-first** — thumb-friendly keypad, floating action button, safe-area aware, works the same on web and phone.
- **Visual classification** — nine categories with emoji + color, a monthly donut breakdown (Recharts) and day-grouped history.
- **Money as integers** — amounts stored in cents (`Int` in the schema, not `Float`) to avoid floating-point rounding errors.
- **Server state via TanStack Query**, with cache invalidation on every mutation — reads always reflect the latest write. (Optimistic updates with rollback are a natural next step here, not yet implemented.)

## Architecture

This is the canonical "Next.js is full-stack" setup — **no separate backend**:

- **UI + API in one app**: React components render the client; Route Handlers (`app/api/budget/*`) are the backend, validated with Zod and persisted with Prisma. On Vercel they deploy as serverless functions automatically.
- **Data layer**: TanStack Query owns server state; every mutation invalidates and refetches on success. React state only holds UI.
- **Database**: Prisma + PostgreSQL (Neon in production). SQLite locally so the app runs with zero external setup.
- **Feature-based structure**: `src/features/budget` is self-contained; `src/lib` holds Prisma, categories, formatting.

## Run locally

```bash
git clone https://github.com/rramirezgit/spendwise.git
cd spendwise
pnpm install

cp .env.example .env          # local dev uses SQLite (DATABASE_URL="file:./dev.db")
npx prisma migrate dev
pnpm dev
```

Open [localhost:3000](http://localhost:3000). The dev build uses a built-in demo user, so there is no login step to preview it.

## Deploy to production (Vercel + Neon + Google login)

Everything ships as **one Vercel project**. Steps:

1. **Database — Neon** (free): create a Postgres database, copy the connection string. In `prisma/schema.prisma` switch `provider = "sqlite"` to `provider = "postgresql"`, then `npx prisma migrate deploy`.
2. **Auth — Google**: create OAuth credentials in Google Cloud Console, then add Auth.js (`next-auth`) with the Google provider and the Prisma adapter (the `User` model is already in the schema).
3. **Vercel**: import the repo, set env vars `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`. Deploy.

## Commands

```bash
pnpm dev       # Development server
pnpm build     # Production build
pnpm lint      # ESLint
```

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Prisma 6 · PostgreSQL / SQLite · TanStack Query v5 · Zod · Recharts · Tailwind CSS 4
