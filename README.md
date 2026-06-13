<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000?style=flat-square&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/TanStack_Query-5-FF4154?style=flat-square" />
</p>

<h1 align="center">Spendwise</h1>

<p align="center">
  <strong>Log any expense in two taps.</strong><br/>
  <em>A mobile-first personal expense tracker — full-stack Next.js, Prisma and optimistic UI.</em>
</p>

![Spendwise demo](docs/demo.gif)

---

## What it demonstrates

A **full-stack** Next.js app (front and back in one codebase) focused on the one metric that matters in an expense tracker: how fast you can log a spend.

- **Two-tap entry** — a custom numeric keypad, one-tap category chips and instant save. No forms, no friction.
- **Optimistic UI** — TanStack Query inserts the expense into the cache before the request resolves and rolls back on error, so the list and monthly total update instantly.
- **Mobile-first** — thumb-friendly keypad, floating action button, safe-area aware, works the same on web and phone.
- **Visual classification** — nine categories with emoji + color, a monthly donut breakdown (Recharts) and day-grouped history.
- **Money as integers** — amounts stored in cents to avoid floating-point errors.

## Architecture

This is the canonical "Next.js is full-stack" setup — **no separate backend**:

- **UI + API in one app**: React components render the client; Route Handlers (`app/api/expenses`) are the backend, validated with Zod and persisted with Prisma. On Vercel they deploy as serverless functions automatically.
- **Data layer**: TanStack Query owns server state with optimistic add/delete mutations; React state only holds UI.
- **Database**: Prisma + PostgreSQL (Neon in production). SQLite locally so the app runs with zero external setup.
- **Feature-based structure**: `src/features/expenses` is self-contained; `src/lib` holds Prisma, categories, formatting.

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
