import { generateText } from "ai";
import { Resend } from "resend";
import type { ApifyLinkedInResult, LeadWebhookPayload, OutreachDraft, OutreachLogRecord, OutreachSendResult } from "@/workflows/types";

const DEFAULT_APIFY_ACTOR = "2SyF0bVxmgGr8IVCZ";

/**
 * Step 1: Apify LinkedIn enrichment.
 *
 * Mirrors the n8n "Run an Actor and get dataset7" node. Falls back to the
 * submitted lead so the workflow keeps running when credentials are missing.
 */
async function runApifyLinkedInActor(linkedinUrl: string, lead: LeadWebhookPayload): Promise<ApifyLinkedInResult> {
  "use step";

  const token = process.env.APIFY_TOKEN;
  const actorId = process.env.APIFY_LINKEDIN_ACTOR_ID || DEFAULT_APIFY_ACTOR;

  if (!token || !linkedinUrl) {
    return {
      firstName: lead.firstName,
      lastName: lead.lastName,
      jobTitle: lead.title,
      companyName: lead.companyName,
      companyIndustry: lead.industry,
      companySize: lead.employeeCount,
      addressWithCountry: [lead.city, lead.state].filter(Boolean).join(", ") || undefined,
      source: "fallback",
    };
  }

  const response = await fetch(`https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/run-sync-get-dataset-items?token=${token}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ profileUrls: [linkedinUrl] }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Apify actor returned ${response.status}`);
  }

  const items = (await response.json()) as unknown;
  const profile = (Array.isArray(items) && items[0] && typeof items[0] === "object" ? (items[0] as Partial<ApifyLinkedInResult>) : {}) as Partial<ApifyLinkedInResult>;

  return {
    ...profile,
    source: "apify",
  };
}

/**
 * Step 2: AI Agent for outreach email generation.
 *
 * Mirrors the n8n "AI Agent Ashley Hotfix2" node by sending a structured prompt
 * to the Vercel AI SDK and requiring a strict JSON {subject, body} response.
 * The prompt is adapted for CoursePilot.
 */
function buildFallbackDraft(lead: LeadWebhookPayload, enrichment: ApifyLinkedInResult, productUrl: string, calendlyLink: string): OutreachDraft {
  const firstName = (lead.firstName || enrichment.firstName || "there").trim();
  const company = (enrichment.companyName || lead.companyName || "your team").trim();
  const purposeLine = lead.purpose
    ? `<p>You mentioned you want to ${lead.purpose.toLowerCase()}. That usually starts as manual research and follow-up time before every conversation.</p>`
    : `<p>With ${company}'s focus on ${lead.industry || "education"}, this likely shows up as research and follow-up time before each conversation.</p>`;
  const detailsLine = lead.details
    ? `<p>Noting what you shared: ${lead.details.replace(/[<>]/g, "").replace(/[.!?]+$/, "")}.</p>`
    : "";
  return {
    subject: `Reducing manual outreach time at ${company}`,
    body:
      `<p>Hi ${firstName},</p>` +
      purposeLine +
      detailsLine +
      `<p>CoursePilot helps education teams turn an inbound visit into a personalized brief and outreach draft so a human only has to review and send.</p>` +
      `<p>${productUrl}</p>` +
      `<p>A typical outcome is faster lead response and higher reply rates without adding headcount.</p>` +
      `<p>Open to a quick conversation? <a href="${calendlyLink}">${calendlyLink}</a></p>` +
      `<p>Alex from CoursePilot.</p>`,
  };
}

async function generateOutreachEmail(lead: LeadWebhookPayload, enrichment: ApifyLinkedInResult): Promise<OutreachDraft> {
  "use step";

  const calendlyLink = process.env.OUTREACH_CALENDLY_URL || "https://calendly.com/coursepilot/30min";
  const productUrl = process.env.OUTREACH_PRODUCT_URL || "https://coursepilot.example/";

  const firstName = (lead.firstName || enrichment.firstName || "there").trim();

  const skills = (enrichment.skills ?? [])
    .slice(0, 5)
    .map((skill) => skill?.title)
    .filter(Boolean)
    .join(", ");

  const updates = (enrichment.updates ?? []).slice(0, 3).map((update, index) => `Post ${index + 1}: ${[update?.subTitle, update?.title].filter(Boolean).join(" ")}`).join("\n");

  const userPrompt = `# LEAD INTELLIGENCE PROVIDED

Contact Info
First Name: ${enrichment.firstName || lead.firstName || ""}
Last Name: ${enrichment.lastName || lead.lastName || ""}
Title: ${enrichment.jobTitle || lead.title || ""}
Company: ${enrichment.companyName || lead.companyName || ""}
Industry: ${enrichment.companyIndustry || lead.industry || ""}
Company Size: ${enrichment.companySize || lead.employeeCount || ""}
Location: ${enrichment.addressWithCountry || [lead.city, lead.state].filter(Boolean).join(", ") || ""}
School: ${enrichment.educations?.[0]?.title || ""}

Skills
${skills}

Recent LinkedIn Activity
${updates}

Stated Purpose On Intake Form
${lead.purpose || "(not provided)"}

Additional Details Provided By The Lead
${lead.details || "(none)"}

Website Context
Viewed: ${lead.capturedUrl || productUrl}
Seen At: ${lead.seenAt || ""}

Company Overview For Context Only
CoursePilot helps creators, schools, and education teams launch course experiences, capture student interest, and personalize follow-up at scale with AI. The product reduces manual outreach work and surfaces a clear next action for each lead.

Calendly Link
${calendlyLink}`;

  const systemPrompt = `You are a CoursePilot Solutions Architect writing outbound to an inbound education-technology lead.

Strategic Requirements
Write like a focused B2B operator, not a growth marketer.
Anchor on the lead's stated purpose ("${lead.purpose || "not provided"}") and any additional details they shared.
If the lead provided additional details, reference them specifically in paragraph 1 or 2 so the email feels personalized.
Define CoursePilot in one precise sentence.
Tie value directly to the recipient's role, company size, industry, or recent activity.
Use proof framing without inventing metrics. If no metrics provided, speak in operational outcomes such as reduced research time, higher reply rate, and more personalized follow-up.
No hype language. No exaggerated numbers. No fabricated results.
No emojis. No asterisks. No buzzwords.

Structure
Paragraph 1: Relevant observation grounded in their role, company, industry, or recent activity.
Paragraph 2: Clear problem statement tied to manual outreach and follow-up.
Paragraph 3: One sentence explaining exactly what CoursePilot does in plain English. Include the plain URL ${productUrl} as visible text on its own line inside the paragraph. Do not wrap it in an anchor tag.
Paragraph 4: Concrete operational outcome relevant to their context.
Paragraph 5: Direct call to action with the Calendly link embedded as an anchor tag pointing to ${calendlyLink}.

Constraints
Return ONLY valid JSON with exactly two keys: subject and body.
Body must be HTML using only <p> tags.
Body must start exactly with: <p>Hi ${firstName},</p>
Include exactly one clickable hyperlink and it must be the Calendly anchor tag.
The CoursePilot website must appear as a plain visible URL exactly once: ${productUrl} and must not be clickable.
Keep length between 110 and 160 words.
Close with Alex from CoursePilot.

Output format example
{"subject":"Reducing manual outreach time","body":"<p>Hi ${firstName},</p><p>...</p>"}`;

  const model = process.env.AI_MODEL || "openai/gpt-5.5";

  try {
    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.2,
    });

    const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("AI response did not contain JSON.");
    }

    const parsed = JSON.parse(match[0]) as Partial<OutreachDraft>;
    if (!parsed.subject || !parsed.body) {
      throw new Error("AI response was missing subject or body.");
    }

    return { subject: String(parsed.subject), body: String(parsed.body) };
  } catch (error) {
    console.warn("[outreach-ai-fallback]", error instanceof Error ? error.message : String(error));
    return buildFallbackDraft(lead, enrichment, productUrl, calendlyLink);
  }
}

/**
 * Step 3: Generate tracking pixel URL.
 *
 * Mirrors the n8n "Generate Pixel URL2" node.
 */
async function buildTrackingPixelUrl(leadEmail: string): Promise<string> {
  "use step";

  const base =
    process.env.OUTREACH_PIXEL_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const id = encodeURIComponent(leadEmail || "unknown");
  return `${base.replace(/\/$/, "")}/api/track-open?id=${id}`;
}

/**
 * Step 4: Inject tracking pixel into the AI-generated HTML body.
 *
 * Mirrors the n8n "Code in JavaScript6" node.
 */
async function injectTrackingPixel(draft: OutreachDraft, pixelUrl: string): Promise<OutreachDraft> {
  "use step";

  const pixelTag = `<img src="${pixelUrl}" width="1" height="1" style="display:none;" alt="" />`;
  return {
    subject: draft.subject,
    body: draft.body.endsWith(pixelTag) ? draft.body : `${draft.body}${pixelTag}`,
  };
}

/**
 * Step 5: Send the email through Resend (mirrors the Gmail send node in n8n).
 *
 * Uses mock mode when Resend credentials are missing so the workflow stays demo-safe.
 */
async function sendOutreachEmail(to: string, subject: string, html: string): Promise<OutreachSendResult> {
  "use step";

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;

  if (!apiKey || !from || !to) {
    return {
      sent: true,
      mode: "mock",
      message: "Mock Sent: Resend credentials are missing or no recipient was provided.",
    };
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({ from, to, subject, html });

  if (error) {
    return { sent: false, mode: "real", message: error.message };
  }

  return { sent: true, mode: "real", message: "Email sent through Resend.", providerId: data?.id };
}

/**
 * Step 6: Log the email send (mirrors the Google Sheets "log email sent" node).
 *
 * For the take-home this writes a structured log line. In production this step
 * would write to Sheets, BigQuery, or a CRM activity record.
 */
async function logOutreachRecord(record: Omit<OutreachLogRecord, "id" | "loggedAt">): Promise<OutreachLogRecord> {
  "use step";

  const full: OutreachLogRecord = {
    id: crypto.randomUUID(),
    loggedAt: new Date().toISOString(),
    ...record,
  };

  console.log("[outreach-log]", JSON.stringify(full));
  return full;
}

/**
 * Main workflow function.
 *
 * Mirrors the n8n connection graph: webhook -> Apify -> AI agent -> pixel ->
 * inject pixel -> send email -> log.
 */
export async function runLeadOutreachWorkflow(lead: LeadWebhookPayload) {
  "use workflow";

  const enrichment = await runApifyLinkedInActor(lead.linkedinUrl, lead);
  const draft = await generateOutreachEmail(lead, enrichment);
  const businessEmail = lead.businessEmail || "";
  const pixelUrl = await buildTrackingPixelUrl(businessEmail);
  const finalEmail = await injectTrackingPixel(draft, pixelUrl);
  const send = await sendOutreachEmail(businessEmail, finalEmail.subject, finalEmail.body);
  const record = await logOutreachRecord({ lead, enrichment, draft: finalEmail, send });

  return {
    workflowId: record.id,
    sent: send.sent,
    mode: send.mode,
    providerId: send.providerId,
    enrichmentSource: enrichment.source,
  };
}
