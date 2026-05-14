import { NextResponse } from "next/server";
import { generateActivationAssets } from "@/lib/ai";
import { enrichLinkedInProfile } from "@/lib/apify";
import { fetchCompanyContext } from "@/lib/companyContext";
import { evaluateAIResult } from "@/lib/evals/runEvaluation";
import { WorkflowStep } from "@/lib/types";
import { validateLeadInput } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const validation = validateLeadInput(body);

  if (!validation.ok || !validation.data) {
    return NextResponse.json({ error: "Validation failed.", errors: validation.errors }, { status: 400 });
  }

  const lead = validation.data;
  const workflow: WorkflowStep[] = [
    {
      name: "Input validation",
      status: "success",
      details: "Lead input passed required field, email, LinkedIn, and URL validation.",
    },
  ];

  // Production hardening would add per-user/IP rate limiting before third-party calls.
  const [{ profile: linkedinProfile, step: linkedinStep }, { context: companyContext, step: companyStep }] = await Promise.all([
    enrichLinkedInProfile(lead),
    fetchCompanyContext(lead),
  ]);

  workflow.push(linkedinStep, companyStep);

  const { result: aiResult, step: aiStep } = await generateActivationAssets(lead, linkedinProfile, companyContext);
  workflow.push(aiStep);

  const { evaluation, step: evaluationStep } = evaluateAIResult(lead, aiResult);
  workflow.push(evaluationStep);

  return NextResponse.json({
    lead,
    linkedinProfile,
    companyContext,
    aiResult,
    evaluation,
    workflow,
  });
}
