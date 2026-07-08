# Architecture

## Stack
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + Recharts
- **Backend:** Supabase (Postgres + RLS + Edge Functions)
- **AI:** OpenAI API (server-side Edge Function — key never in browser)
- **Hosting:** Vercel

## Now vs Later
**Now:** input form → projection engine → results dashboard → lead capture
**Later:** auth + per-user plans, PDF export, brokerage data import, advisor booking

## Key User Action — Step by Step
1. Visitor lands on `/` — seed demo plan renders instantly from DB
2. Visitor edits inputs and clicks **Run My Plan**
3. Browser POSTs to `/api/plan` (Next.js Route Handler)
4. Handler validates inputs, writes `plan_inputs` row to Supabase
5. Projection engine (pure TS) computes balance curve, retirement score, shortfall
6. Result written to `projections` table
7. OpenAI called (server-side) → ranked `recommendations` rows written (value + source + confidence + review_status)
8. Response returned; UI renders chart + score + recommendation cards
9. Lead capture form shown → email written to `leads` table

## Layer Order
1. **Data first** — tables, constraints, RLS, seed rows
2. **Core engine** — projection math, CRUD API routes
3. **Smart layer** — AI recommendations on top; rule-based fallback keeps engine alive if API is down

## Why Core Runs Without AI
Projection math and rule-based recommendations are pure TypeScript. AI enriches the output but is never in the critical path.
