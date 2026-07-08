import type { PlanInput, ProjectionResult, RecommendationDraft, RiskProfile } from "./types";

const growthRates: Record<RiskProfile, number> = {
  conservative: 0.045,
  moderate: 0.06,
  aggressive: 0.075,
};

const targetReplacementRate = 0.8;
const safeWithdrawalRate = 0.04;

export function normalizeCurrency(value: unknown) {
  const numberValue = typeof value === "string" ? Number(value.replace(/,/g, "")) : Number(value);
  return Number.isFinite(numberValue) ? numberValue : NaN;
}

export function validatePlanInput(payload: unknown): { data?: PlanInput; errors: Record<string, string> } {
  const source = payload as Partial<Record<keyof PlanInput, unknown>>;
  const data: PlanInput = {
    age: Number(source.age),
    annual_income: normalizeCurrency(source.annual_income),
    monthly_savings: normalizeCurrency(source.monthly_savings),
    current_savings: normalizeCurrency(source.current_savings),
    target_retirement_age: Number(source.target_retirement_age),
    risk_profile: (source.risk_profile as RiskProfile) || "moderate",
  };

  const errors: Record<string, string> = {};
  if (!Number.isInteger(data.age) || data.age < 18 || data.age > 80) {
    errors.age = "Enter an age between 18 and 80.";
  }
  if (!Number.isFinite(data.annual_income) || data.annual_income <= 0) {
    errors.annual_income = "Enter your annual income.";
  }
  if (!Number.isFinite(data.monthly_savings) || data.monthly_savings < 0) {
    errors.monthly_savings = "Enter monthly savings of $0 or more.";
  }
  if (!Number.isFinite(data.current_savings) || data.current_savings < 0) {
    errors.current_savings = "Enter current savings of $0 or more.";
  }
  if (
    !Number.isInteger(data.target_retirement_age) ||
    data.target_retirement_age <= data.age ||
    data.target_retirement_age > 85
  ) {
    errors.target_retirement_age = "Choose a retirement age after your current age.";
  }
  if (!["conservative", "moderate", "aggressive"].includes(data.risk_profile)) {
    errors.risk_profile = "Choose a risk profile.";
  }

  return Object.keys(errors).length ? { errors } : { data, errors };
}

export function projectPlan(input: PlanInput): ProjectionResult {
  const years = input.target_retirement_age - input.age;
  const monthlyRate = growthRates[input.risk_profile] / 12;
  const targetBalance = Math.round((input.annual_income * targetReplacementRate) / safeWithdrawalRate);
  const curve = [];
  let balance = input.current_savings;

  for (let month = 0; month <= years * 12; month += 1) {
    if (month > 0) {
      balance = balance * (1 + monthlyRate) + input.monthly_savings;
    }

    if (month % 12 === 0 || month === years * 12) {
      curve.push({
        age: input.age + Math.round(month / 12),
        balance: Math.round(balance),
      });
    }
  }

  const projectedBalance = Math.round(balance);
  const gap = projectedBalance - targetBalance;
  const months = Math.max(years * 12, 1);
  const futureValueFactor =
    monthlyRate === 0 ? months : ((1 + monthlyRate) ** months - 1) / monthlyRate;
  const monthlyGap = Math.round(gap / futureValueFactor);
  const savingsRate = input.annual_income > 0 ? (input.monthly_savings * 12) / input.annual_income : 0;

  return {
    retirement_score: scorePlan(input, projectedBalance, targetBalance, monthlyGap),
    projected_balance: projectedBalance,
    monthly_gap: monthlyGap,
    balance_curve: curve,
    target_balance: targetBalance,
    savings_rate: savingsRate,
  };
}

export function scorePlan(
  input: PlanInput,
  projectedBalance: number,
  targetBalance: number,
  monthlyGap: number,
) {
  let score = 25;
  const savingsRate = input.annual_income > 0 ? (input.monthly_savings * 12) / input.annual_income : 0;

  if (savingsRate >= 0.15) score += 20;
  if (projectedBalance >= targetBalance) score += 30;
  if (input.current_savings >= (input.annual_income / 12) * 3) score += 15;
  if (input.target_retirement_age >= 65) score += 10;
  if (monthlyGap < 0 && Math.abs(projectedBalance - targetBalance) > targetBalance * 0.5) score -= 30;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function ruleBasedRecommendations(input: PlanInput, projection: ProjectionResult): RecommendationDraft[] {
  const recommendations: RecommendationDraft[] = [];
  const savingsPercent = Math.round(projection.savings_rate * 1000) / 10;
  const targetMonthlySavings = Math.ceil((input.annual_income * 0.15) / 12 / 25) * 25;
  const extraNeeded = Math.max(0, targetMonthlySavings - input.monthly_savings);

  if (projection.monthly_gap < 0) {
    const closeGapBy = Math.ceil(Math.abs(projection.monthly_gap) / 25) * 25;
    recommendations.push({
      title: `Increase monthly savings by $${closeGapBy.toLocaleString()}`,
      detail: `Your projection is below target. Adding about $${closeGapBy.toLocaleString()} per month would close most of the estimated gap by age ${input.target_retirement_age}.`,
      priority: 1,
      value: `Adding about $${closeGapBy.toLocaleString()} per month would close most of the estimated gap by age ${input.target_retirement_age}.`,
      source: "rule-engine",
      confidence: 0.9,
      review_status: "unreviewed",
    });
  } else {
    recommendations.push({
      title: "Keep your savings rhythm",
      detail: `You are tracking above the target balance by roughly $${Math.abs(
        projection.projected_balance - projection.target_balance,
      ).toLocaleString()}. Review the plan quarterly so market assumptions stay realistic.`,
      priority: 1,
      value: "You are tracking above target. Keep the contribution habit and review the plan quarterly.",
      source: "rule-engine",
      confidence: 0.88,
      review_status: "unreviewed",
    });
  }

  if (projection.savings_rate < 0.15) {
    recommendations.push({
      title: `Move savings rate toward 15%`,
      detail: `You are saving about ${savingsPercent}% of income. A 15% target means saving roughly $${targetMonthlySavings.toLocaleString()} per month${
        extraNeeded ? `, or $${extraNeeded.toLocaleString()} more than today` : ""
      }.`,
      priority: 2,
      value: `A 15% savings target means roughly $${targetMonthlySavings.toLocaleString()} per month.`,
      source: "rule-engine",
      confidence: 0.86,
      review_status: "unreviewed",
    });
  }

  if (input.current_savings < (input.annual_income / 12) * 3) {
    recommendations.push({
      title: "Build a three-month cash buffer",
      detail: "Your emergency fund appears below three months of income. A stronger cash reserve protects retirement contributions from surprise expenses.",
      priority: 3,
      value: "Build a three-month cash buffer before increasing investment risk.",
      source: "rule-engine",
      confidence: 0.82,
      review_status: "unreviewed",
    });
  }

  if (input.target_retirement_age < 65 && projection.monthly_gap < 0) {
    recommendations.push({
      title: "Test a later retirement date",
      detail: "Delaying retirement by one to three years can add contributions, compound growth, and reduce the drawdown period.",
      priority: 4,
      value: "Model a retirement date one to three years later to see the score impact.",
      source: "rule-engine",
      confidence: 0.78,
      review_status: "unreviewed",
    });
  }

  if (recommendations.length < 2) {
    recommendations.push({
      title: "Automate annual increases",
      detail: "Set contributions to rise when income rises so your savings rate improves without a large lifestyle change.",
      priority: 5,
      value: "Automate annual savings increases after raises or bonus payments.",
      source: "rule-engine",
      confidence: 0.8,
      review_status: "unreviewed",
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 5);
}
