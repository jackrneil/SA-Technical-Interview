import { AIResult, CompanyContext, LeadInput, LinkedInProfile } from "@/lib/types";

export function fallbackLinkedInProfile(lead: LeadInput): LinkedInProfile {
  const role = lead.role || "Unknown role";
  const company = lead.companyName || "their company";
  return {
    name: lead.fullName,
    headline: `${role} at ${company}`,
    location: "Unknown",
    currentCompany: company,
    currentRole: role,
    about: `Submitted lead with a goal to ${lead.primaryGoal.toLowerCase()}.`,
    source: "fallback",
  };
}

export function fallbackCompanyContext(lead: LeadInput): CompanyContext {
  return {
    name: lead.companyName || "Unknown company",
    website: lead.companyWebsite,
    detectedSignals: [lead.primaryGoal],
    source: "fallback",
  };
}

export function buildFallbackAIResult(
  lead: LeadInput,
  linkedinProfile: LinkedInProfile,
  companyContext: CompanyContext,
  reason: string,
): AIResult {
  const firstName = lead.fullName.split(" ")[0] || lead.fullName;
  const contextNote = linkedinProfile.source === "fallback" ? "LinkedIn enrichment was unavailable" : "LinkedIn enrichment was available";
  const websiteNote = companyContext.source === "fallback" ? "company website context was limited" : "company website context was available";

  return {
    leadSummary: `${lead.fullName} is listed as ${lead.role} at ${lead.companyName}. Their stated goal is to ${lead.primaryGoal.toLowerCase()}.`,
    companySummary: `${lead.companyName} appears to be evaluating ways to ${lead.primaryGoal.toLowerCase()} with CoursePilot.`,
    likelyPainPoints: [
      `Turning interest in ${lead.primaryGoal.toLowerCase()} into a clear launch or follow-up plan`,
      "Reducing manual research and message drafting before a sales conversation",
    ],
    coursePilotFit:
      "CoursePilot can help create course pages, capture student interest, and generate personalized follow-up messages while keeping a human in the approval loop.",
    emailSubject: `Idea for ${lead.companyName}'s ${lead.primaryGoal.toLowerCase()} goal`,
    emailBody: `Hi ${firstName},\n\nI saw your interest in ${lead.primaryGoal.toLowerCase()} at ${lead.companyName}. CoursePilot helps education teams launch course experiences, capture student interest, and personalize follow-up without adding extra manual work for the team.\n\nIf helpful, I can share a short example of how CoursePilot could support this workflow for ${lead.companyName}.\n\nWould you be open to a 20-minute conversation next week?`,
    meetingCTA: "Would you be open to a 20-minute conversation next week?",
    internalAccountNotes: `${contextNote}; ${websiteNote}. Keep the first meeting focused on the submitted goal and ask for current activation workflow details before making firm recommendations.`,
    confidenceScore: 35,
    fallbackNotes: `Safe fallback used: ${reason}`,
    missingContextQuestions: [
      "What tools does the team currently use for course launches and follow-up?",
      "What does a successful activation or enrollment outcome look like?",
      "Who reviews outbound messages before they are sent?",
    ],
  };
}
