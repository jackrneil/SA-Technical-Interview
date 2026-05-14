export const primaryGoals = [
  "Launch a new course",
  "Increase student enrollment",
  "Improve student onboarding",
  "Automate follow up emails",
  "Modernize course website",
] as const;

export type PrimaryGoal = (typeof primaryGoals)[number];

export type WorkflowStatus = "success" | "warning" | "error" | "skipped";

export interface LeadInput {
  fullName: string;
  email: string;
  linkedinUrl: string;
  role: string;
  companyName: string;
  companyWebsite?: string;
  primaryGoal: PrimaryGoal;
}

export interface LinkedInProfile {
  name: string;
  headline: string;
  location: string;
  currentCompany: string;
  currentRole: string;
  about: string;
  profileImageUrl?: string;
  source: "apify" | "fallback";
}

export interface CompanyContext {
  name: string;
  website?: string;
  siteTitle?: string;
  metaDescription?: string;
  detectedSignals: string[];
  source: "website" | "fallback";
}

export interface AIResult {
  leadSummary: string;
  companySummary: string;
  likelyPainPoints: string[];
  coursePilotFit: string;
  emailSubject: string;
  emailBody: string;
  meetingCTA: string;
  internalAccountNotes: string;
  confidenceScore: number;
  fallbackNotes: string;
  missingContextQuestions: string[];
}

export interface RubricCategoryResult {
  pass: boolean;
  notes: string;
}

export interface EvaluationResult {
  overallPass: boolean;
  score: number;
  personalization: RubricCategoryResult;
  accuracy: RubricCategoryResult;
  businessValue: RubricCategoryResult;
  safety: RubricCategoryResult;
  ctaQuality: RubricCategoryResult;
  hallucinationFlags: string[];
}

export interface WorkflowStep {
  name: string;
  status: WorkflowStatus;
  details: string;
}

export interface IntakeResponse {
  lead: LeadInput;
  linkedinProfile: LinkedInProfile;
  companyContext: CompanyContext;
  aiResult: AIResult;
  evaluation: EvaluationResult;
  workflow: WorkflowStep[];
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResponse {
  sent: boolean;
  mode: "real" | "mock";
  message: string;
  providerId?: string;
}
