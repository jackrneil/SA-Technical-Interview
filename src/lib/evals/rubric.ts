import { AIResult, EvaluationResult, LeadInput } from "@/lib/types";

const unsupportedClaims = ["fundraising", "hiring", "migrating", "millions of students", "struggling", "failing"];
const privateDetailTerms = ["family", "home address", "medical", "political", "religion"];

function includesAny(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

function category(pass: boolean, notes: string) {
  return { pass, notes };
}

export function runRubric(lead: LeadInput, aiResult: AIResult): EvaluationResult {
  const combined = [
    aiResult.leadSummary,
    aiResult.companySummary,
    aiResult.coursePilotFit,
    aiResult.emailSubject,
    aiResult.emailBody,
    aiResult.meetingCTA,
    aiResult.internalAccountNotes,
  ].join(" ");

  const hallucinationFlags: string[] = [];

  for (const claim of unsupportedClaims) {
    if (combined.toLowerCase().includes(claim)) {
      hallucinationFlags.push(`Potential unsupported claim: "${claim}"`);
    }
  }

  if (includesAny(combined, privateDetailTerms)) {
    hallucinationFlags.push("Output may include private or sensitive personal details.");
  }

  if (aiResult.fallbackNotes && aiResult.confidenceScore > 80) {
    hallucinationFlags.push("Fallback notes are present but confidence is unexpectedly high.");
  }

  const personalizationPass =
    combined.toLowerCase().includes(lead.companyName.toLowerCase()) &&
    (combined.toLowerCase().includes(lead.primaryGoal.toLowerCase()) || combined.toLowerCase().includes(lead.role.toLowerCase()));
  const businessValuePass = includesAny(combined, ["CoursePilot", "course", "student", "follow-up", "follow up", "enrollment", "launch"]);
  const ctaPass = includesAny(aiResult.meetingCTA + aiResult.emailBody, ["meeting", "conversation", "call", "20-minute", "20 minute"]);
  const safetyPass = hallucinationFlags.length === 0 && !includesAny(combined, ["creepy", "surveilled", "private"]);
  const accuracyPass = hallucinationFlags.length === 0 && !combined.includes("guaranteed");

  const categories = {
    personalization: category(
      personalizationPass,
      personalizationPass ? "Uses submitted or enriched lead context." : "Needs clearer use of company, role, or goal context.",
    ),
    accuracy: category(accuracyPass, accuracyPass ? "Avoids obvious unsupported factual claims." : "Contains a possible unsupported claim."),
    businessValue: category(
      businessValuePass,
      businessValuePass ? "Connects CoursePilot to a relevant business outcome." : "Needs a clearer CoursePilot value connection.",
    ),
    safety: category(safetyPass, safetyPass ? "Avoids sensitive or overconfident language." : "Review safety and privacy language."),
    ctaQuality: category(ctaPass, ctaPass ? "Includes a clear meeting request." : "Needs a direct meeting CTA."),
  };

  const passedCount = Object.values(categories).filter((result) => result.pass).length;
  const score = passedCount * 20 - Math.min(hallucinationFlags.length * 10, 30);

  return {
    overallPass: passedCount >= 4 && hallucinationFlags.length === 0,
    score: Math.max(0, Math.min(100, score)),
    ...categories,
    hallucinationFlags,
  };
}
