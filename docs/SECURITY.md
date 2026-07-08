# Security

## Secret Handling
- `OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` stored in Vercel environment variables only
- Never referenced in any client-side file; only in `/api/*` Route Handlers
- Public Supabase anon key is safe to expose (RLS is the guard)

## Permission Model (v1 — demo)
- All tables: RLS enabled, permissive v1 policies (anonymous read + write)
- No user data isolation yet — demo data is public by design
- Lock-down sprint: replace policies with `auth.uid() = user_id`; add NOT NULL constraint on user_id

## Approved Tools Rule
- Only named, scoped functions (`generate_recommendations`, `score_plan`, `capture_lead`) may be called by automated logic
- No `eval`, no dynamic SQL, no `run_any` patterns
- Every AI call goes through a server Route Handler — never from the browser

## Audit Principle
- Every plan submission, projection write, and lead capture appended to `audit_logs`
- `review_status` on AI fields ensures no AI output is silently trusted
- If a task involves data deletion, payment, or legal copy: stop and get a human reviewer
