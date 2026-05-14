import { generateText } from "ai";
import { buildFallbackAIResult } from "@/lib/fallbacks";
import { AIResult, CompanyContext, LeadInput, LinkedInProfile, WorkflowStep } from "@/lib/types";

function safeJsonParse(text: string): AIResult | null {
  try {
    const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(cleaned) as Partial<AIResult>;

    if (!parsed.leadSummary || !parsed.emailSubject || !parsed.emailBody || !parsed.meetingCTA) {
      return null;
    }

    return {
      leadSummary: String(parsed.leadSummary),
      companySummary: String(parsed.companySummary ?? ""),
      likelyPainPoints: Array.isArray(parsed.likelyPainPoints) ? parsed.likelyPainPoints.map(String) : [],
      coursePilotFit: String(parsed.coursePilotFit ?? ""),
      emailSubject: String(parsed.emailSubject),
      emailBody: String(parsed.emailBody),
      meetingCTA: String(parsed.meetingCTA),
      internalAccountNotes: String(parsed.internalAccountNotes ?? ""),
      confidenceScore: Math.max(0, Math.min(100, Number(parsed.confidenceScore ?? 50))),
      fallbackNotes: String(parsed.fallbackNotes ?? ""),
      missingContextQuestions: Array.isArray(parsed.missingContextQuestions) ? parsed.missingContextQuestions.map(String) : [],
    };
  } catch {
    return null;
  }
}

function buildPrompt(lead: LeadInput, linkedinProfile: LinkedInProfile, companyContext: CompanyContext, short = false): string {
  const submittedLead = {
    fullName: lead.fullName,
    email: lead.email,
    role: lead.role,
    companyName: lead.companyName,
    purpose: lead.primaryGoal,
    detailsFromUser: lead.details || "(none provided)",
  };

  const context = {
    submittedLead,
    linkedinProfile,
    companyContext,
    coursePilot:
      "CoursePilot helps education companies and creators launch course pages, collect student interest, and personalize follow up.",
  };

  return `Using this lead context, generate a strict JSON response for CoursePilot.

Rules:
- Return JSON only.
- Do not invent facts. Treat the LinkedIn profile and user-provided details as the only sources of truth.
- If the lead provided "detailsFromUser", reference it specifically in leadSummary or coursePilotFit.
- Tie the email to the lead's stated purpose ("${lead.primaryGoal}").
- Frame pain points as likely or inferred when not explicitly provided.
- Include fallbackNotes when enrichment or website context used fallback data.
- Include missingContextQuestions when confidenceScore is below 70.
- Keep the email professional, useful, and concise (under 160 words).

Required keys: leadSummary, companySummary, likelyPainPoints, coursePilotFit, emailSubject, emailBody, meetingCTA, internalAccountNotes, confidenceScore, fallbackNotes, missingContextQuestions.

Context:
${JSON.stringify(short ? { submittedLead, coursePilot: context.coursePilot } : context, null, 2)}`;
}

async function callModel(prompt: string): Promise<AIResult | null> {
  const model = process.env.AI_MODEL || "openai/gpt-5.5";

  const { text } = await generateText({
    model,
    system:
      "You are an enterprise software Solutions Architect assistant for CoursePilot. Turn lead context into a personalized but professional outreach email and internal account brief. Do not invent facts. If information is missing, state the uncertainty. Keep the tone clear, useful, and business focused.",
    prompt,
    temperature: 0.2,
  });

  return safeJsonParse(text);
}

export async function generateActivationAssets(
  lead: LeadInput,
  linkedinProfile: LinkedInProfile,
  companyContext: CompanyContext,
): Promise<{ result: AIResult; step: WorkflowStep }> {
  try {
    const firstAttempt = await callModel(buildPrompt(lead, linkedinProfile, companyContext));

    if (firstAttempt) {
      return {
        result: firstAttempt,
        step: {
          name: "AI generation",
          status: "success",
          details: "Generated structured outreach and account brief with the Vercel AI SDK.",
        },
      };
    }

    const retry = await callModel(buildPrompt(lead, linkedinProfile, companyContext, true));

    if (retry) {
      return {
        result: retry,
        step: {
          name: "AI generation",
          status: "warning",
          details: "Initial AI output was unavailable or invalid; a shorter prompt retry succeeded.",
        },
      };
    }

    return {
      result: buildFallbackAIResult(lead, linkedinProfile, companyContext, "AI Gateway credentials are missing or model output was invalid."),
      step: {
        name: "AI generation",
        status: "warning",
        details: "AI generation was unavailable, so a safe fallback email template was used.",
      },
    };
  } catch (error) {
    return {
      result: buildFallbackAIResult(lead, linkedinProfile, companyContext, error instanceof Error ? error.message : "AI generation failed."),
      step: {
        name: "AI generation",
        status: "warning",
        details: "AI generation failed, so a safe fallback email template was used.",
      },
    };
  }
}
