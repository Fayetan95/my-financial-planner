# Data Model

## plan_inputs
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid NULL | owner scope (lock-down sprint) |
| age | integer | 18–80 |
| annual_income | numeric | USD |
| monthly_savings | numeric | USD |
| current_savings | numeric | USD |
| target_retirement_age | integer | |
| risk_profile | text | 'conservative'\|'moderate'\|'aggressive' |
| created_at | timestamptz | default now() |

## projections
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| plan_input_id | uuid | FK → plan_inputs.id |
| user_id | uuid NULL | |
| retirement_score | numeric | 0–100 |
| projected_balance | numeric | at target age |
| monthly_gap | numeric | shortfall (<0) or surplus (>0) |
| balance_curve | jsonb | [{age, balance}] array |
| created_at | timestamptz | |

## recommendations
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| projection_id | uuid | FK → projections.id |
| user_id | uuid NULL | |
| title | text | short action label |
| detail | text | explanation |
| priority | integer | 1 = highest |
| **value** | text | AI-generated text |
| **source** | text | 'openai-gpt4o'\|'rule-engine' |
| **confidence** | numeric | 0–1 |
| **review_status** | text | default 'unreviewed' |
| created_at | timestamptz | |

## leads
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| email | text | |
| plan_input_id | uuid NULL | FK → plan_inputs.id |
| created_at | timestamptz | |

## RLS
All tables: RLS enabled. v1 permissive policies allow anonymous read + write. Lock-down sprint replaces with `auth.uid() = user_id`.
