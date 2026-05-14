export interface LeadWebhookPayload {
  linkedinUrl: string;
  firstName: string;
  lastName: string;
  title: string;
  companyName: string;
  businessEmail: string;
  website?: string;
  industry?: string;
  employeeCount?: string;
  estimateRevenue?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  seenAt?: string;
  referrer?: string;
  tags?: string;
  capturedUrl?: string;
}

export interface ApifyLinkedInResult {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  companyName?: string;
  companyIndustry?: string;
  companySize?: string;
  addressWithCountry?: string;
  profilePic?: string;
  educations?: Array<{ title?: string }>;
  skills?: Array<{ title?: string }>;
  updates?: Array<{ title?: string; subTitle?: string }>;
  source: "apify" | "fallback";
}

export interface OutreachDraft {
  subject: string;
  body: string;
}

export interface OutreachSendResult {
  sent: boolean;
  mode: "real" | "mock";
  message: string;
  providerId?: string;
}

export interface OutreachLogRecord {
  id: string;
  loggedAt: string;
  lead: LeadWebhookPayload;
  enrichment: ApifyLinkedInResult;
  draft: OutreachDraft;
  send: OutreachSendResult;
}
