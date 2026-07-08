create table if not exists plan_inputs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  age integer,
  annual_income numeric,
  monthly_savings numeric,
  current_savings numeric,
  target_retirement_age integer,
  risk_profile text,
  created_at timestamptz not null default now()
);

alter table plan_inputs enable row level security;
drop policy if exists "plan_inputs_v1_read" on plan_inputs;
create policy "plan_inputs_v1_read" on plan_inputs for select using (true);
drop policy if exists "plan_inputs_v1_write" on plan_inputs;
create policy "plan_inputs_v1_write" on plan_inputs for all using (true) with check (true);

create table if not exists projections (
  id uuid primary key default gen_random_uuid(),
  plan_input_id uuid,
  user_id uuid,
  retirement_score numeric,
  projected_balance numeric,
  monthly_gap numeric,
  balance_curve jsonb,
  created_at timestamptz not null default now()
);

alter table projections enable row level security;
drop policy if exists "projections_v1_read" on projections;
create policy "projections_v1_read" on projections for select using (true);
drop policy if exists "projections_v1_write" on projections;
create policy "projections_v1_write" on projections for all using (true) with check (true);

create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  projection_id uuid,
  user_id uuid,
  title text,
  detail text,
  priority integer,
  value text,
  source text,
  confidence numeric,
  review_status text default 'unreviewed',
  created_at timestamptz not null default now()
);

alter table recommendations enable row level security;
drop policy if exists "recommendations_v1_read" on recommendations;
create policy "recommendations_v1_read" on recommendations for select using (true);
drop policy if exists "recommendations_v1_write" on recommendations;
create policy "recommendations_v1_write" on recommendations for all using (true) with check (true);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text,
  email text,
  plan_input_id uuid,
  created_at timestamptz not null default now()
);

alter table leads enable row level security;
drop policy if exists "leads_v1_read" on leads;
create policy "leads_v1_read" on leads for select using (true);
drop policy if exists "leads_v1_write" on leads;
create policy "leads_v1_write" on leads for all using (true) with check (true);

insert into plan_inputs (id, age, annual_income, monthly_savings, current_savings, target_retirement_age, risk_profile)
values
  ('a1000000-0000-0000-0000-000000000001', 35, 85000, 800, 32000, 65, 'moderate'),
  ('a1000000-0000-0000-0000-000000000002', 28, 62000, 400, 8000, 62, 'aggressive'),
  ('a1000000-0000-0000-0000-000000000003', 50, 120000, 1500, 180000, 67, 'conservative')
on conflict (id) do nothing;

insert into projections (id, plan_input_id, retirement_score, projected_balance, monthly_gap, balance_curve)
values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 72, 1240000, 320, '[{"age":35,"balance":32000},{"age":40,"balance":107000},{"age":45,"balance":224000},{"age":50,"balance":392000},{"age":55,"balance":620000},{"age":60,"balance":918000},{"age":65,"balance":1240000}]'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 54, 680000, -450, '[{"age":28,"balance":8000},{"age":33,"balance":45000},{"age":38,"balance":112000},{"age":43,"balance":220000},{"age":48,"balance":380000},{"age":53,"balance":510000},{"age":62,"balance":680000}]'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 88, 2850000, 1100, '[{"age":50,"balance":180000},{"age":53,"balance":290000},{"age":56,"balance":450000},{"age":59,"balance":680000},{"age":62,"balance":980000},{"age":65,"balance":1400000},{"age":67,"balance":2850000}]')
on conflict (id) do nothing;

insert into recommendations (id, projection_id, title, detail, priority, value, source, confidence, review_status)
values
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Bump monthly savings by $200', 'Increasing contributions from $800 to $1,000/mo closes your projected gap and adds ~$85k to your final balance.', 1, 'Increasing contributions from $800 to $1,000/mo closes your projected gap and adds ~$85k to your final balance.', 'rule-engine', 0.91, 'unreviewed'),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Open a Roth IRA', 'Tax-free growth on up to $7,000/year could add $120k+ to your retirement balance by age 65.', 2, 'Tax-free growth on up to $7,000/year could add $120k+ to your retirement balance by age 65.', 'rule-engine', 0.85, 'unreviewed'),
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 'Increase savings rate to 10% of income', 'At your current rate you are saving 7.7%. Reaching 10% now gives compound growth 30+ years to work.', 1, 'At your current rate you are saving 7.7%. Reaching 10% now gives compound growth 30+ years to work.', 'rule-engine', 0.93, 'unreviewed'),
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 'Consider delaying retirement by 2 years', 'Working until 64 instead of 62 adds savings contributions and shrinks the drawdown period, improving your score by ~12 points.', 2, 'Working until 64 instead of 62 adds savings contributions and shrinks the drawdown period, improving your score by ~12 points.', 'rule-engine', 0.80, 'unreviewed'),
  ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000003', 'You are on track — review asset allocation', 'Your plan shows a strong surplus. Shift 10% of bond allocation to equities to capture more upside before 60.', 1, 'Your plan shows a strong surplus. Shift 10% of bond allocation to equities to capture more upside before 60.', 'rule-engine', 0.88, 'unreviewed')
on conflict (id) do nothing;

insert into leads (id, name, email, plan_input_id)
values
  ('d1000000-0000-0000-0000-000000000001', 'Alex Demo', 'alex@example.com', 'a1000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;