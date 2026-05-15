import { NextResponse } from "next/server";
import { getLeads, getLeadById, isDbConfigured } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Database not configured. Add POSTGRES_URL to environment variables.", leads: [] },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
    if (id) {
      const lead = await getLeadById(id);
      if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
      return NextResponse.json({ lead });
    }

    const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 200);
    const leads = await getLeads(limit);
    return NextResponse.json({ leads, count: leads.length });
  } catch (err) {
    console.error("[api/leads] DB error:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "Failed to fetch leads." }, { status: 500 });
  }
}
