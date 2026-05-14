import { fallbackCompanyContext } from "@/lib/fallbacks";
import { CompanyContext, LeadInput, WorkflowStep } from "@/lib/types";
import { isSafePublicUrl } from "@/lib/validation";

const signalTerms = [
  "courses",
  "students",
  "creators",
  "enrollment",
  "training",
  "academy",
  "learning",
  "cohort",
  "certification",
  "education",
  "onboarding",
];

function extractMatch(html: string, pattern: RegExp): string | undefined {
  const match = html.match(pattern);
  return match?.[1]?.replace(/\s+/g, " ").trim();
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectBusinessSignals(text: string, primaryGoal: string): string[] {
  const lower = text.toLowerCase();
  const signals = signalTerms.filter((term) => lower.includes(term));

  if (!signals.includes(primaryGoal.toLowerCase())) {
    signals.unshift(primaryGoal);
  }

  return Array.from(new Set(signals)).slice(0, 8);
}

export async function fetchCompanyContext(lead: LeadInput): Promise<{ context: CompanyContext; step: WorkflowStep }> {
  if (!lead.companyWebsite) {
    return {
      context: fallbackCompanyContext(lead),
      step: {
        name: "Company website context",
        status: "skipped",
        details: "No company website was submitted, so company context uses the form data.",
      },
    };
  }

  if (!isSafePublicUrl(lead.companyWebsite)) {
    return {
      context: fallbackCompanyContext(lead),
      step: {
        name: "Company website context",
        status: "warning",
        details: "The company website URL was not safe to fetch, so company context uses the form data.",
      },
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(lead.companyWebsite, {
      headers: {
        "user-agent": "CoursePilotActivationAgent/1.0",
        accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`Website returned ${response.status}`);

    const html = (await response.text()).slice(0, 120_000);
    const text = stripHtml(html).slice(0, 2000);
    const title = extractMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const metaDescription = extractMatch(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i);

    return {
      context: {
        name: lead.companyName,
        website: lead.companyWebsite,
        siteTitle: title,
        metaDescription,
        detectedSignals: detectBusinessSignals(`${title ?? ""} ${metaDescription ?? ""} ${text}`, lead.primaryGoal),
        source: "website",
      },
      step: {
        name: "Company website context",
        status: "success",
        details: "Fetched the public company homepage and extracted summary signals.",
      },
    };
  } catch (error) {
    return {
      context: fallbackCompanyContext(lead),
      step: {
        name: "Company website context",
        status: "warning",
        details: `Company website fetch failed, so company context uses the form data. ${error instanceof Error ? error.message : ""}`.trim(),
      },
    };
  }
}
