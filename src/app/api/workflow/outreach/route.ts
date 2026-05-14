import { NextResponse } from "next/server";
import { start } from "workflow/api";
import { runLeadOutreachWorkflow } from "@/workflows/lead-outreach";
import type { LeadWebhookPayload } from "@/workflows/types";

export const runtime = "nodejs";

/**
 * Webhook entry point for the lead outreach workflow.
 *
 * Accepts the same flat JSON keys as the n8n webhook payload so the n8n flow
 * can be replaced one-for-one. The body fields are case-sensitive and use the
 * exact keys used by the n8n template ("LinkedIn URL", "First Name", etc.).
 */
function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value.trim() : "";
}

function splitFullName(value: string): { firstName: string; lastName: string } {
  const trimmed = value.trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

function normalizePayload(input: unknown): LeadWebhookPayload | null {
  if (!input || typeof input !== "object") return null;
  const record = input as Record<string, unknown>;
  const body = (typeof record.body === "object" && record.body !== null ? (record.body as Record<string, unknown>) : record) as Record<string, unknown>;

  const linkedinUrl = readString(body, "LinkedIn URL") || readString(body, "linkedinUrl");
  if (!linkedinUrl) return null;

  let firstName = readString(body, "First Name") || readString(body, "firstName");
  let lastName = readString(body, "Last Name") || readString(body, "lastName");
  const fullName = readString(body, "Full Name") || readString(body, "fullName") || readString(body, "name");

  if (!firstName && fullName) {
    const split = splitFullName(fullName);
    firstName = split.firstName;
    lastName = lastName || split.lastName;
  }

  if (!firstName) return null;

  return {
    linkedinUrl,
    firstName,
    lastName: lastName || undefined,
    title: readString(body, "Title") || readString(body, "title") || undefined,
    companyName: readString(body, "Company Name") || readString(body, "companyName") || undefined,
    businessEmail: readString(body, "Business Email") || readString(body, "businessEmail") || undefined,
    website: readString(body, "Website") || undefined,
    industry: readString(body, "Industry") || undefined,
    employeeCount: readString(body, "Employee Count") || undefined,
    estimateRevenue: readString(body, "Estimate Revenue") || undefined,
    city: readString(body, "City") || undefined,
    state: readString(body, "State") || undefined,
    zipcode: readString(body, "Zipcode") || undefined,
    seenAt: readString(body, "Seen At") || undefined,
    referrer: readString(body, "Referrer") || undefined,
    tags: readString(body, "Tags") || undefined,
    capturedUrl: readString(body, "Captured URL") || undefined,
    purpose: readString(body, "Purpose") || readString(body, "purpose") || readString(body, "primaryGoal") || undefined,
    details: readString(body, "Details") || readString(body, "details") || undefined,
  };
}

export async function POST(request: Request) {
  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const payload = normalizePayload(raw);

  if (!payload) {
    return NextResponse.json(
      { error: "Webhook requires at minimum a LinkedIn URL and a first name (or fullName)." },
      { status: 400 },
    );
  }

  // Production hardening would add per-IP rate limiting and webhook signature checks here.
  const handle = await start(runLeadOutreachWorkflow, [payload]);

  return NextResponse.json({
    message: "Lead outreach workflow started.",
    runId: handle?.runId,
  });
}
