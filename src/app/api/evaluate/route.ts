import { NextResponse } from "next/server";
import { evaluateAIResult } from "@/lib/evals/runEvaluation";
import { AIResult } from "@/lib/types";
import { validateLeadInput } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const payload = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const validation = validateLeadInput(payload.lead);

  if (!validation.ok || !validation.data) {
    return NextResponse.json({ error: "Validation failed.", errors: validation.errors }, { status: 400 });
  }

  if (typeof payload.aiResult !== "object" || payload.aiResult === null) {
    return NextResponse.json({ error: "aiResult is required." }, { status: 400 });
  }

  const { evaluation } = evaluateAIResult(validation.data, payload.aiResult as AIResult);
  return NextResponse.json({ evaluation });
}
