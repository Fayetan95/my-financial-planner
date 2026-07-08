import { NextResponse } from "next/server";
import { fetchProjectionBundle } from "@/lib/supabase/planner";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const bundle = await fetchProjectionBundle();
    return NextResponse.json({ data: bundle });
  } catch (error) {
    console.error("Failed to load demo plan.", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
