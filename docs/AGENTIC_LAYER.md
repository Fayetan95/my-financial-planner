# Agentic Layer

## Risk Tiers

### Low — Auto (no approval needed)
- Generate recommendation text from projection data → write to `recommendations`
- Tag plan with risk profile label
- Score retirement readiness (0–100)

### Medium — Light approval
- Send follow-up email summary to lead (draft shown to builder before send)
- Update recommendation `review_status` to 'approved'

### High — Always approval
- Email blast to all captured leads
- Publish plan results publicly

### Critical — Human only
- Delete lead records
- Purge plan data
- Any financial advice disclaimer changes

## Named Tools (v1)
- `generate_recommendations(projection_id)` — calls OpenAI, writes rows
- `score_plan(plan_input_id)` — runs rule engine, returns 0–100
- `capture_lead(name, email, plan_input_id)` — writes to `leads`

## Audit Log Fields
`action | actor | target_table | target_id | payload_summary | risk_level | timestamp`

## v1 vs Later
- **v1:** auto recommendation generation + lead capture
- **Later:** email follow-up workflow, advisor booking agent
