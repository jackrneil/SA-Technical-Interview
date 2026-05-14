import { NextResponse } from "next/server";
import { start } from "workflow/api";
import { generateActivationAssets } from "@/lib/ai";
import { enrichLinkedInProfile } from "@/lib/apify";
import { fetchCompanyContext } from "@/lib/companyContext";
import { evaluateAIResult } from "@/lib/evals/runEvaluation";
import { isSafePublicUrl, validateFormSubmission } from "@/lib/validation";
import { LeadInput, WorkflowStep } from "@/lib/types";
import { runLeadOutreachWorkflow } from "@/workflows/lead-outreach";

export const runtime = "nodejs";

function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
}

function normalizeWebsite(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const candidate = value.startsWith("http") ? value : `https://${value}`;
  return isSafePublicUrl(candidate) ? candidate : undefined;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const validation = validateFormSubmission(body);
  if (!validation.ok || !validation.data) {
    return NextResponse.json({ error: "Validation failed.", errors: validation.errors }, { status: 400 });
  }

  const submission = validation.data;
  const { firstName, lastName } = splitName(submission.fullName);
  const workflow: WorkflowStep[] = [
    {
      name: "Input validation",
      status: "success",
      details: "Submission passed name, LinkedIn URL, and purpose checks.",
    },
  ];

  // Bootstrap a partial lead so the Apify step has something to fall back on.
  const partialLead: LeadInput = {
    fullName: submission.fullName,
    linkedinUrl: submission.linkedinUrl,
    primaryGoal: submission.primaryGoal,
    details: submission.details,
    email: "",
    role: "",
    companyName: "",
  };

  const { profile: linkedinProfile, step: linkedinStep } = await enrichLinkedInProfile(partialLead);
  workflow.push(linkedinStep);

  const inferredCompanyWebsite = normalizeWebsite(linkedinProfile.companyWebsite);

  // Merge form input with Apify-discovered fields so downstream steps have
  // everything they need without making the user re-type it.
  const lead: LeadInput = {
    fullName: submission.fullName,
    linkedinUrl: submission.linkedinUrl,
    primaryGoal: submission.primaryGoal,
    details: submission.details,
    email: linkedinProfile.email || `${firstName.toLowerCase() || "lead"}@example.com`,
    role: linkedinProfile.currentRole || "Unknown role",
    companyName: linkedinProfile.currentCompany || "Unknown company",
    companyWebsite: inferredCompanyWebsite,
  };

  const { context: companyContext, step: companyStep } = await fetchCompanyContext(lead);
  workflow.push(companyStep);

  const { result: aiResult, step: aiStep } = await generateActivationAssets(lead, linkedinProfile, companyContext);
  workflow.push(aiStep);

  const { evaluation, step: evaluationStep } = evaluateAIResult(lead, aiResult);
  workflow.push(evaluationStep);

  // Kick off the durable Vercel Workflow SDK pipeline so the
  // Apify -> AI -> pixel -> send -> log flow runs the same way the n8n
  // webhook would have. The workflow runs asynchronously.
  let workflowRunId: string | undefined;
  try {
    const handle = await start(runLeadOutreachWorkflow, [
      {
        linkedinUrl: lead.linkedinUrl,
        firstName,
        lastName,
        title: lead.role,
        companyName: lead.companyName,
        businessEmail: lead.email,
        website: lead.companyWebsite,
        industry: linkedinProfile.companyIndustry,
        purpose: lead.primaryGoal,
        details: lead.details,
        seenAt: new Date().toISOString(),
        capturedUrl: "https://coursepilot.example/intake",
      },
    ]);
    workflowRunId = handle?.runId;
    workflow.push({
      name: "Durable workflow started",
      status: "success",
      details: `Vercel Workflow SDK run ${handle?.runId ?? "(no id)"} is processing the durable pipeline.`,
    });
  } catch (workflowError) {
    workflow.push({
      name: "Durable workflow started",
      status: "warning",
      details: `Workflow trigger failed: ${workflowError instanceof Error ? workflowError.message : String(workflowError)}`,
    });
  }

  return NextResponse.json({
    lead,
    linkedinProfile,
    companyContext,
    aiResult,
    evaluation,
    workflow,
    workflowRunId,
  });
}
