# Test Plan

## v1 Success Scenario (manual)
1. Open live URL — confirm demo plan loads with score, chart, and recommendations visible. No login prompt.
2. Clear the form and click **Run My Plan** without filling any field → validation errors appear on all required fields; no API call made.
3. Fill valid inputs (age 35, income $80k, monthly savings $500, current savings $20k, target retirement age 65, moderate risk) → click **Run My Plan**.
4. Loading skeleton appears during API call.
5. Results render: score between 0–100, line chart with ≥10 data points, ≥2 recommendation cards.
6. Open Supabase table editor → confirm new rows in `plan_inputs`, `projections`, `recommendations`.
7. Enter name + email in lead form → click **Save My Results**.
8. Confirm new row in `leads` table with correct email.
9. Reload page → demo plan still visible (seed data intact).

## Empty State
- Delete all seed rows → homepage shows "No plan yet — enter your details to start" message, not a blank screen or JS error.

## Error States
- Set invalid `OPENAI_API_KEY` → recommendations still render (rule-based fallback); no 500 exposed to UI; error logged server-side.
- Kill Supabase connection → form submission shows user-facing error message "Something went wrong — please try again"; no raw error stack shown.

## AI Field Verification
- Query `recommendations` table → every AI-generated row has `source = 'openai-gpt4o'`, `confidence` between 0 and 1, `review_status = 'unreviewed'`.
- Rule-based fallback rows have `source = 'rule-engine'`.

## Security Check
- View page source + Network tab → `OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` do not appear anywhere.
- `SUPABASE_ANON_KEY` may appear (expected and safe).
