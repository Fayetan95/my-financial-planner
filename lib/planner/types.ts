export type RiskProfile = "conservative" | "moderate" | "aggressive";

export type PlanInput = {
  age: number;
  annual_income: number;
  monthly_savings: number;
  current_savings: number;
  target_retirement_age: number;
  risk_profile: RiskProfile;
};

export type BalancePoint = {
  age: number;
  balance: number;
};

export type ProjectionResult = {
  retirement_score: number;
  projected_balance: number;
  monthly_gap: number;
  balance_curve: BalancePoint[];
  target_balance: number;
  savings_rate: number;
};

export type RecommendationDraft = {
  title: string;
  detail: string;
  priority: number;
  value: string;
  source: "openai-gpt4o" | "rule-engine";
  confidence: number;
  review_status: "unreviewed";
};

export type PlannerRecord = {
  plan_input: PlanInput & { id: string; created_at?: string };
  projection: ProjectionResult & { id: string; plan_input_id: string; created_at?: string };
  recommendations: Array<RecommendationDraft & { id: string; projection_id: string; created_at?: string }>;
};
