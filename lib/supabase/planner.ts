import { createAdminClient } from "./admin";

export async function fetchProjectionBundle(projectionId?: string) {
  const supabase = createAdminClient();
  let projectionQuery = supabase.from("projections").select("*").order("created_at", { ascending: false }).limit(1);

  if (projectionId) {
    projectionQuery = supabase.from("projections").select("*").eq("id", projectionId).limit(1);
  }

  const { data: projectionRows, error: projectionError } = await projectionQuery;
  if (projectionError) throw projectionError;

  const projection = projectionRows?.[0];
  if (!projection) return null;

  const { data: planInput, error: planInputError } = await supabase
    .from("plan_inputs")
    .select("*")
    .eq("id", projection.plan_input_id)
    .single();

  if (planInputError) throw planInputError;

  const { data: recommendations, error: recommendationError } = await supabase
    .from("recommendations")
    .select("*")
    .eq("projection_id", projection.id)
    .order("priority", { ascending: true });

  if (recommendationError) throw recommendationError;

  return {
    plan_input: planInput,
    projection,
    recommendations: recommendations || [],
  };
}

export async function writeAuditLog(
  action: string,
  targetTable: string,
  targetId: string,
  payloadSummary: string,
  riskLevel = "low",
) {
  try {
    const supabase = createAdminClient();
    await supabase.from("audit_logs").insert({
      action,
      actor: "anonymous_visitor",
      target_table: targetTable,
      target_id: targetId,
      payload_summary: payloadSummary,
      risk_level: riskLevel,
    });
  } catch (error) {
    console.warn("Audit log write skipped.", error);
  }
}
