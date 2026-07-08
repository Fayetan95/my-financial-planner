import type { PlanInput, ProjectionResult, RecommendationDraft } from "./types";
import { ruleBasedRecommendations } from "./engine";

type OpenAIRecommendation = Omit<RecommendationDraft, "source" | "review_status">;

export async function generateRecommendations(
  input: PlanInput,
  projection: ProjectionResult,
): Promise<RecommendationDraft[]> {
  if (!process.env.OPENAI_API_KEY) {
    return ruleBasedRecommendations(input, projection);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You write concise, educational retirement-planning recommendations. Return JSON only with a recommendations array. Do not provide legal, tax, or investment advice guarantees.",
          },
          {
            role: "user",
            content: JSON.stringify({
              plan_input: input,
              projection: {
                retirement_score: projection.retirement_score,
                projected_balance: projection.projected_balance,
                target_balance: projection.target_balance,
                monthly_gap: projection.monthly_gap,
                savings_rate: projection.savings_rate,
              },
              schema: {
                recommendations: [
                  {
                    title: "short action label",
                    detail: "one sentence explanation",
                    priority: 1,
                    value: "plain-language impact text",
                    confidence: 0.85,
                  },
                ],
              },
            }),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed: ${response.status}`);
    }

    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content || "{}") as { recommendations?: OpenAIRecommendation[] };
    const recommendations = (parsed.recommendations || [])
      .filter((item) => item.title && item.detail)
      .slice(0, 5)
      .map((item, index) => ({
        title: String(item.title),
        detail: String(item.detail),
        priority: Number(item.priority) || index + 1,
        value: String(item.value || item.detail),
        source: "openai-gpt4o" as const,
        confidence: Math.max(0, Math.min(1, Number(item.confidence) || 0.75)),
        review_status: "unreviewed" as const,
      }));

    return recommendations.length >= 2 ? recommendations : ruleBasedRecommendations(input, projection);
  } catch (error) {
    console.error("AI recommendation generation failed, using rule engine.", error);
    return ruleBasedRecommendations(input, projection);
  }
}
