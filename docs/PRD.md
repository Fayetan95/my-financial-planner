# PRD — My Financial Planner

## Problem
People lack a simple, interactive tool to understand their retirement readiness and financial health. Builders lack a polished, AI-powered portfolio app that proves they can ship.

## Target User
Anyone curious about their financial future; recruiters evaluating the builder's technical depth.

## Core Objects
- **PlanInput** — user's financial snapshot (age, income, savings, goal)
- **Projection** — computed retirement trajectory (AI-enhanced)
- **Recommendation** — ranked action items derived from the projection
- **Lead** — captured contact/interest record

## MVP Checklist (v1 must-haves)
- [ ] Financial input form (age, income, monthly savings, target retirement age, current savings)
- [ ] Projection engine runs on submit and persists result to DB
- [ ] Results dashboard: retirement readiness score, projected balance chart, shortfall/surplus
- [ ] AI-generated recommendation list (rule-based fallback if AI is off)
- [ ] Lead capture form (name + email) on results page
- [ ] Seed demo data visible on load — no login required
- [ ] All buttons/forms persist to DB; UI reflects saved state
- [ ] Empty, loading, and error states handled on every screen

## Non-Goals (v1)
- User accounts / authentication
- Per-user data isolation
- Real brokerage integrations
- Tax optimisation engine
- Mobile app

## Success Criteria
A visitor opens the live URL, sees a demo plan pre-loaded, enters their own numbers, clicks **Run My Plan**, sees a retirement score + chart + ranked recommendations, and their email is captured — all within 30 seconds, no login required.
