import { NextResponse } from "next/server";
import { start } from "workflow/api";
import { validateFormSubmission } from "@/lib/validation";
import { runLeadOutreachWorkflow } from "@/workflows/lead-outreach";

export const runtime = "nodejs";

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const validation = validateFormSubmission(body);
  if (!validation.ok || !validation.data) {
    return NextResponse.json({ error: "Validation failed.", errors: validation.errors }, { status: 400 });
  }

  const { fullName, email, linkedinUrl, primaryGoal, details } = validation.data;
  const { firstName, lastName } = splitName(fullName);

  let runId: string | undefined;
  try {
    const handle = await start(runLeadOutreachWorkflow, [
      {
        linkedinUrl,
        firstName,
        lastName: lastName || undefined,
        businessEmail: email,
        purpose: primaryGoal,
        details: details || undefined,
        seenAt: new Date().toISOString(),
        capturedUrl: "https://coursepilot.example/intake",
      },
    ]);
    runId = handle?.runId;
  } catch (err) {
    console.error("[intake] Failed to start workflow:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "Failed to start the workflow. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, runId });
}
