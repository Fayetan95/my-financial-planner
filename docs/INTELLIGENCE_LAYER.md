# Intelligence Layer

## Messy Input → Structured Data
Raw form values (age, income, savings, risk) → validated PlanInput record → deterministic projection → AI recommendation prompt.

## Auto-Structure Schema (AI prompt output parsed to JSON)
```json
{
  "recommendations": [
    {
      "title": "Increase monthly savings by $200",
      "detail": "Closing your $180k gap requires ~$200/mo more at moderate growth.",
      "priority": 1,
      "confidence": 0.87,
      "source": "openai-gpt4o",
      "review_status": "unreviewed"
    }
  ]
}
```

## Events to Track
- Plan submitted
- Projection computed (score, gap)
- Recommendation viewed
- Lead captured

## Scoring Rules (rule-based fallback)
| Condition | Score adjustment |
|---|---|
| Savings rate ≥ 15% income | +20 |
| On-track for target balance | +30 |
| Emergency fund ≥ 3mo expenses | +15 |
| Retirement age ≥ 65 | +10 |
| Gap > 50% target | −30 |

Base score 25; capped 0–100.

## What Gets Ranked
Recommendations ordered by `priority` (1 = top). AI sets priority; rule engine assigns 1–5 as fallback.

## v1 vs Later
- **v1:** rule-based score + AI recommendation text
- **Later:** Monte Carlo simulation, tax-bracket optimisation, personalised asset allocation
