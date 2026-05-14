import { fallbackLinkedInProfile } from "@/lib/fallbacks";
import { LeadInput, LinkedInProfile, WorkflowStep } from "@/lib/types";

function pickString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function mapApifyProfile(raw: unknown, lead: LeadInput): LinkedInProfile {
  const profile = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};

  return {
    name: pickString(profile, ["fullName", "name", "firstName"]) || lead.fullName,
    headline:
      pickString(profile, ["headline", "occupation", "title"]) ||
      (lead.role && lead.companyName ? `${lead.role} at ${lead.companyName}` : "Education professional"),
    location: pickString(profile, ["addressWithCountry", "location", "addressWithoutCountry"]) || "Unknown",
    currentCompany: pickString(profile, ["companyName", "currentCompany", "company"]) || lead.companyName || "Unknown company",
    currentRole: pickString(profile, ["jobTitle", "currentRole", "position", "title"]) || lead.role || "Unknown role",
    about: pickString(profile, ["about", "summary", "description"]) || `Public profile context was limited for ${lead.fullName}.`,
    profileImageUrl: pickString(profile, ["profilePic", "profilePicUrl", "profileImageUrl", "image"]) || undefined,
    email: pickString(profile, ["email", "publicEmail"]) || undefined,
    companyWebsite: pickString(profile, ["companyWebsite", "website"]) || undefined,
    companyIndustry: pickString(profile, ["companyIndustry", "industry"]) || undefined,
    source: "apify",
  };
}

export async function enrichLinkedInProfile(lead: LeadInput): Promise<{ profile: LinkedInProfile; step: WorkflowStep }> {
  const token = process.env.APIFY_TOKEN;
  const actorId = process.env.APIFY_LINKEDIN_ACTOR_ID;

  if (!token || !actorId) {
    return {
      profile: fallbackLinkedInProfile(lead),
      step: {
        name: "LinkedIn enrichment",
        status: "warning",
        details: "Apify credentials are not configured, so submitted lead data was used.",
      },
    };
  }

  try {
    const runResponse = await fetch(`https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/run-sync-get-dataset-items?token=${token}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ profileUrls: [lead.linkedinUrl] }),
      cache: "no-store",
    });

    if (!runResponse.ok) {
      throw new Error(`Apify returned ${runResponse.status}`);
    }

    const items = (await runResponse.json()) as unknown;
    const firstItem = Array.isArray(items) ? items[0] : undefined;

    if (!firstItem) {
      return {
        profile: fallbackLinkedInProfile(lead),
        step: {
          name: "LinkedIn enrichment",
          status: "warning",
          details: "Apify returned no profile data, so submitted lead data was used.",
        },
      };
    }

    return {
      profile: mapApifyProfile(firstItem, lead),
      step: {
        name: "LinkedIn enrichment",
        status: "success",
        details: "Public LinkedIn profile context was retrieved through Apify.",
      },
    };
  } catch (error) {
    return {
      profile: fallbackLinkedInProfile(lead),
      step: {
        name: "LinkedIn enrichment",
        status: "warning",
        details: `Apify enrichment failed, so submitted lead data was used. ${error instanceof Error ? error.message : ""}`.trim(),
      },
    };
  }
}
