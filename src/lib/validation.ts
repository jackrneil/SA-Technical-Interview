import { FormSubmission, LeadInput, primaryGoals } from "@/lib/types";

export interface ValidationResult {
  ok: boolean;
  data?: LeadInput;
  errors: Record<string, string>;
}

export interface FormValidationResult {
  ok: boolean;
  data?: FormSubmission;
  errors: Record<string, string>;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const privateHostnamePatterns = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^0\./,
  /^169\.254\./,
];

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isSafePublicUrl(value: string): boolean {
  if (!isHttpUrl(value)) return false;

  const url = new URL(value);
  const hostname = url.hostname.toLowerCase();

  if (hostname.endsWith(".local") || privateHostnamePatterns.some((pattern) => pattern.test(hostname))) {
    return false;
  }

  return true;
}

export function normalizeLinkedInUrl(value: string): string {
  const trimmed = value.trim();
  // Add https:// if the user pasted without a protocol
  if (trimmed && !trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return "https://" + trimmed;
  }
  return trimmed;
}

export function isLinkedInProfileUrl(value: string): boolean {
  try {
    const normalized = normalizeLinkedInUrl(value);
    const url = new URL(normalized);
    const host = url.hostname.toLowerCase();
    // Accept any LinkedIn subdomain: linkedin.com, www.linkedin.com,
    // uk.linkedin.com, au.linkedin.com, ca.linkedin.com, etc.
    const isLinkedIn = host === "linkedin.com" || host.endsWith(".linkedin.com");
    return (url.protocol === "https:" || url.protocol === "http:") && isLinkedIn && url.pathname.startsWith("/in/");
  } catch {
    return false;
  }
}

export function validateFormSubmission(input: unknown): FormValidationResult {
  const body = typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
  const errors: Record<string, string> = {};

  const submission = {
    fullName: asString(body.fullName),
    email: asString(body.email),
    // Normalize: add https:// if the user omitted the protocol
    linkedinUrl: normalizeLinkedInUrl(asString(body.linkedinUrl)),
    primaryGoal: asString(body.primaryGoal),
    details: asString(body.details),
  };

  if (!submission.fullName) errors.fullName = "Your name is required.";
  if (!emailPattern.test(submission.email)) errors.email = "A valid email address is required.";
  if (!isLinkedInProfileUrl(submission.linkedinUrl)) errors.linkedinUrl = "Use a valid LinkedIn profile URL.";
  if (!primaryGoals.includes(submission.primaryGoal as LeadInput["primaryGoal"])) {
    errors.primaryGoal = "Choose a purpose from the list.";
  }
  if (submission.details && submission.details.length > 2000) {
    errors.details = "Keep details under 2000 characters.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    errors: {},
    data: {
      fullName: submission.fullName,
      email: submission.email,
      linkedinUrl: submission.linkedinUrl,
      primaryGoal: submission.primaryGoal as LeadInput["primaryGoal"],
      details: submission.details || undefined,
    },
  };
}

export function validateLeadInput(input: unknown): ValidationResult {
  const body = typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
  const errors: Record<string, string> = {};

  const lead = {
    fullName: asString(body.fullName),
    email: asString(body.email),
    linkedinUrl: asString(body.linkedinUrl),
    role: asString(body.role),
    companyName: asString(body.companyName),
    companyWebsite: asString(body.companyWebsite),
    primaryGoal: asString(body.primaryGoal),
    details: asString(body.details),
  };

  if (!lead.fullName) errors.fullName = "Full name is required.";
  if (!emailPattern.test(lead.email)) errors.email = "A valid work email is required.";
  if (!isLinkedInProfileUrl(lead.linkedinUrl)) errors.linkedinUrl = "Use a valid LinkedIn profile URL.";
  if (!lead.role) errors.role = "Role is required.";
  if (!lead.companyName) errors.companyName = "Company name is required.";
  if (!primaryGoals.includes(lead.primaryGoal as LeadInput["primaryGoal"])) {
    errors.primaryGoal = "Choose a valid primary goal.";
  }
  if (lead.companyWebsite && !isSafePublicUrl(lead.companyWebsite)) {
    errors.companyWebsite = "Company website must be a public HTTP or HTTPS URL.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    errors: {},
    data: {
      ...lead,
      companyWebsite: lead.companyWebsite || undefined,
      details: lead.details || undefined,
      primaryGoal: lead.primaryGoal as LeadInput["primaryGoal"],
    },
  };
}
