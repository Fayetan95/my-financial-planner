# Tasks & Sprints

## Sprint 1 — DB + Projection Engine (Core)
**Goal:** Schema live, projection math works end-to-end, demo data visible without login.
- [ ] Run migration SQL on Supabase (all 4 tables + seed rows)
- [ ] Verify seed demo plan renders on `/` without login
- [ ] Build `/api/plan` Route Handler: validate inputs → compute projection → write plan_inputs + projections rows
- [ ] Rule-based recommendation engine (TypeScript, no AI yet) → writes recommendations rows
- [ ] Retirement score calculation (rule-based, 0–100)
- [ ] Confirm every DB write is reflected in a re-fetch (no dead buttons)
- **Definition of Done:** POST to `/api/plan` with valid inputs → rows exist in all three tables → score + balance_curve returned in response. Confirmed by manual DB check + API test.

## Sprint 2 — Results UI (v1 functional ✅)
**Goal:** Full user journey works in browser — input → results → lead capture.
- [ ] Input form (all fields, validation, loading state)
- [ ] Results dashboard: retirement score dial, projected balance line chart (Recharts), shortfall/surplus callout
- [ ] Recommendation cards (ranked, from DB)
- [ ] Lead capture form on results page → writes to `leads` table
- [ ] Empty state (no plan yet), error state (API failure), loading skeleton
- [ ] Seed demo plan pre-loaded on homepage
- **Definition of Done:** Visitor opens live URL → sees demo plan → edits numbers → clicks Run My Plan → score + chart + recommendations render → submits email → `leads` row confirmed in DB. Full flow under 30 seconds.

## Sprint 3 — AI Recommendations
**Goal:** OpenAI replaces rule-based fallback for recommendation text.
- [ ] Server-side `generate_recommendations` tool (OpenAI call, JSON parse, writes value/source/confidence/review_status)
- [ ] Graceful fallback to rule engine if OpenAI call fails
- [ ] Review status badge on recommendation cards ('AI' vs 'Rule-based')
- **Definition of Done:** Submitted plan returns AI-authored recommendations; `source = 'openai-gpt4o'`, `confidence` populated; rule engine still fires if API key removed.

## Sprint 4 — Polish + Case Study
**Goal:** Portfolio-ready, recruiter-demoable.
- [ ] Responsive layout (mobile + desktop)
- [ ] Copy audit: every label, CTA, and empty state is clear and jargon-free
- [ ] OG image + meta description for social sharing
- [ ] Written case study page (`/about`) covering problem, decisions, stack, demo link
- [ ] Vercel deploy confirmed live
- **Definition of Done:** Recruiter can open URL on phone, run a plan, and read the case study without any broken states.

## Sprint 5 — Lock It Down (auth + isolation)
**Goal:** Real users can save their own plans securely.
- [ ] Supabase Auth (email magic link)
- [ ] Replace v1 RLS policies with owner-scoped (`auth.uid() = user_id`)
- [ ] Add NOT NULL constraint to user_id on core tables
- [ ] Login/signup UI; redirect to saved plan after auth
- **Definition of Done:** User A cannot read User B's plan; anonymous seed rows still visible on demo page.

## Gantt (sprint → feature)
```
Sprint 1: DB schema, seed data, projection API, rule engine
Sprint 2: Input form, results UI, lead capture  ← v1 functional
Sprint 3: AI recommendations
Sprint 4: Polish, responsive, case study, deploy
Sprint 5: Auth, RLS lock-down
```
