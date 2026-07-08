import { NextResponse } from "next/server";
import { projectPlan, validatePlanInput } from "@/lib/planner/engine";
import { generateRecommendations } from "@/lib/planner/openai";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchProjectionBundle, writeAuditLog } from "@/lib/supabase/planner";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const validation = validatePlanInput(payload);

    if (!validation.data) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    const input = validation.data;
    const projection = projectPlan(input);
    const recommendations = await generateRecommendations(input, projection);
    const supabase = createAdminClient();

    const { data: planInput, error: planError } = await supabase
      .from("plan_inputs")
      .insert(input)
      .select("*")
      .single();

    if (planError) throw planError;

    const { data: projectionRow, error: projectionError } = await supabase
      .from("projections")
      .insert({
        plan_input_id: planInput.id,
        retirement_score: projection.retirement_score,
        projected_balance: projection.projected_balance,
        monthly_gap: projection.monthly_gap,
        balance_curve: projection.balance_curve,
      })
      .select("*")
      .single();

    if (projectionError) throw projectionError;

    const { error: recommendationError } = await supabase.from("recommendations").insert(
      recommendations.map((recommendation) => ({
        ...recommendation,
        projection_id: projectionRow.id,
      })),
    );

    if (recommendationError) throw recommendationError;

    await writeAuditLog(
      "projection_computed",
      "projections",
      projectionRow.id,
      `Score ${projection.retirement_score}; ${recommendations.length} recommendations generated.`,
    );

    const bundle = await fetchProjectionBundle(projectionRow.id);
    return NextResponse.json({ data: bundle });
  } catch (error) {
    console.error("Plan submission failed.", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
