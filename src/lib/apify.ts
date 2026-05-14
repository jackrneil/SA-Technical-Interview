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
    headline: pickString(profile, ["headline", "occupation", "title"]) || `${lead.role} at ${lead.companyName}`,
    location: pickString(profile, ["location", "addressWithoutCountry"]) || "Unknown",
    currentCompany: pickString(profile, ["currentCompany", "companyName", "company"]) || lead.companyName,
    currentRole: pickString(profile, ["currentRole", "jobTitle", "position", "title"]) || lead.role,
    about: pickString(profile, ["about", "summary", "description"]) || `Public profile context was limited for ${lead.fullName}.`,
    profileImageUrl: pickString(profile, ["profilePicUrl", "profileImageUrl", "image"]) || undefined,
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
