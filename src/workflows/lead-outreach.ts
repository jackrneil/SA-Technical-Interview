import { generateText, experimental_generateImage as generateImage } from "ai";
import { put } from "@vercel/blob";
import nodemailer from "nodemailer";
import type { ApifyLinkedInResult, LeadWebhookPayload, OutreachDraft, OutreachLogRecord, OutreachSendResult } from "@/workflows/types";

const DEFAULT_APIFY_ACTOR = "2SyF0bVxmgGr8IVCZ";

// ─── Branded HTML email wrapper ────────────────────────────────────────────────
// Applied after the AI/fallback step so the template is always consistent.

function wrapInEmailTemplate(body: string, pixelUrl: string, _productUrl: string, imageUrl?: string | null): string {
  const logoUrl = "https://coursepilot-kappa.vercel.app/logo-icon.png";
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CoursePilot</title>
</head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

              <!-- Blue header with logo -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);padding:28px 40px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:14px;">
                          <img src="${logoUrl}" alt="CoursePilot" width="44" height="44" style="border-radius:10px;display:block;" />
                        </td>
                        <td style="vertical-align:middle;">
                          <p style="margin:0;color:#bfdbfe;font-size:11px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;">Personal outreach</p>
                          <p style="margin:4px 0 0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;line-height:1.3;">A note from Alex at CoursePilot</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Body -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:36px 40px 8px;color:#1e293b;font-size:15px;line-height:1.8;">
                    ${body}
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 40px;">
                    <div style="border-top:1px solid #f1f5f9;"></div>
                  </td>
                </tr>
              </table>

              <!-- Sender signature -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:24px 40px ${imageUrl ? "16px" : "32px"};">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:14px;">
                          <img src="${logoUrl}" alt="Alex" width="44" height="44" style="border-radius:50%;display:block;border:2px solid #e2e8f0;" />
                        </td>
                        <td style="vertical-align:middle;">
                          <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">Alex</p>
                          <p style="margin:2px 0 0;font-size:13px;color:#64748b;">CoursePilot</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${imageUrl ? `<!-- Personalised image — bottom, centered, portrait width -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 40px 32px;text-align:center;">
                    <p style="margin:0 0 12px;font-size:12px;color:#94a3b8;font-style:italic;">We put this together just for you.</p>
                    <img src="${imageUrl}" alt="Just for you" width="280" style="display:inline-block;width:280px;height:280px;object-fit:cover;border-radius:12px;border:3px solid #e2e8f0;box-shadow:0 4px 16px rgba(0,0,0,0.10);" />
                  </td>
                </tr>
              </table>` : ""}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 0 8px;">
              <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;">
                © ${currentYear} CoursePilot. You received this because you submitted an inquiry.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  <img src="${pixelUrl}" width="1" height="1" style="display:none;" alt="" />
</body>
</html>`;
}

// ─── Step 1: LinkedIn enrichment ──────────────────────────────────────────────

async function runApifyLinkedInActor(linkedinUrl: string, lead: LeadWebhookPayload): Promise<ApifyLinkedInResult> {
  "use step";

  console.log("[step 1/7 | linkedin-enrichment] Starting — url:", linkedinUrl);

  const token = process.env.APIFY_TOKEN;
  const actorId = process.env.APIFY_LINKEDIN_ACTOR_ID || DEFAULT_APIFY_ACTOR;

  if (!token || !linkedinUrl) {
    console.log("[step 1/7 | linkedin-enrichment] No Apify token — using form data as fallback");
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
  const profile = (Array.isArray(items) && items[0] && typeof items[0] === "object"
    ? (items[0] as Partial<ApifyLinkedInResult>)
    : {}) as Partial<ApifyLinkedInResult>;

  const result: ApifyLinkedInResult = { ...profile, source: "apify" };
  console.log("[step 1/7 | linkedin-enrichment] Done — source: apify, name:", result.firstName, result.lastName, "| company:", result.companyName);
  return result;
}

// ─── Step 2: Generate personalised kindergarten image ─────────────────────────

function getCityLandmark(location: string): string {
  const l = location.toLowerCase();
  if (l.includes("san francisco") || l.includes("bay area") || l.includes("oakland")) return "the Golden Gate Bridge draped in morning fog";
  if (l.includes("new york") || l.includes("nyc") || l.includes("manhattan") || l.includes("brooklyn")) return "the Manhattan skyline and the Empire State Building";
  if (l.includes("los angeles") || l.includes("hollywood") || l.includes("santa monica")) return "the Hollywood sign glowing on the hills";
  if (l.includes("chicago")) return "the Chicago skyline and the Willis Tower";
  if (l.includes("seattle")) return "the Seattle Space Needle against a cloudy sky";
  if (l.includes("austin")) return "the Texas State Capitol dome at golden hour";
  if (l.includes("boston")) return "the Charles River with sailboats and Fenway Park";
  if (l.includes("miami")) return "Miami Beach and the turquoise Atlantic Ocean";
  if (l.includes("denver")) return "the snow-capped Rocky Mountains";
  if (l.includes("portland")) return "Mount Hood rising over Portland rooftops";
  if (l.includes("nashville")) return "the Nashville skyline with the AT&T Batman Building";
  if (l.includes("dallas") || l.includes("fort worth")) return "the Dallas skyline at sunset";
  if (l.includes("atlanta")) return "the Atlanta skyline with Centennial Olympic Park";
  if (l.includes("washington") || l.includes(" dc") || l.includes("d.c.")) return "the Washington Monument and Lincoln Memorial";
  if (l.includes("london")) return "the London Eye and Big Ben along the Thames";
  if (l.includes("toronto")) return "the CN Tower over Lake Ontario";
  if (l.includes("sydney")) return "the Sydney Opera House and Harbour Bridge";
  if (l.includes("paris")) return "the Eiffel Tower at dusk";
  if (l.includes("tokyo")) return "Mount Fuji and the Tokyo skyline";
  return "a beautiful sunny cityscape with blue skies and rolling hills";
}

async function generatePersonalizedImage(lead: LeadWebhookPayload, enrichment: ApifyLinkedInResult): Promise<string | null> {
  "use step";

  const firstName = (enrichment.firstName || lead.firstName || "the person").trim();
  const lastName = (enrichment.lastName || lead.lastName || "").trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const company = (enrichment.companyName || lead.companyName || "their company").trim();
  const jobTitle = enrichment.jobTitle || lead.title || "professional";
  const location = enrichment.addressWithCountry || [lead.city, lead.state].filter(Boolean).join(", ") || "";
  const university = enrichment.educations?.[0]?.title || "";
  const headshotUrl = enrichment.profilePic || "";
  const landmark = location ? getCityLandmark(location) : "a beautiful sunny cityscape";

  const universityDetail = university
    ? `The classroom walls are decorated with pennants, colors, and a banner for ${university} — the university they attended.`
    : "The classroom has colorful ABC charts, number posters, and finger-paint artwork pinned to the walls.";

  const prompt = [
    `A still, ultra-photorealistic photograph — NOT animated, NOT illustrated, NOT a painting — of a real adult human named ${fullName}.`,
    headshotUrl ? `Their face and body must closely match this LinkedIn photo reference. Preserve their exact facial features, skin tone, hair color, and real adult age.` : "",
    `${fullName} is a ${jobTitle} at ${company}. They are a full-grown adult, clearly in their 20s or older.`,
    `They are seated at a tiny single-student kindergarten desk — the kind with a small attached seat — right in the center of a bright, colorful kindergarten classroom.`,
    `Their full body is visible from head to toe. They are comically, absurdly oversized compared to everything around them — their knees are up near their chest, their adult body dwarfs the tiny desk completely.`,
    `Surrounding them are actual kindergarten-age children sitting at identical tiny desks. The children are genuinely small, roughly half the height of ${fullName}. The size contrast is comedic and unmistakable.`,
    `${fullName} is radiating overwhelming, almost ridiculous happiness — the biggest ear-to-ear smile in the room, eyes lit up, clearly the most excited person there by a massive margin. The children around them look calm and normal by comparison.`,
    `${fullName} is wearing a casual t-shirt with the ${company} name and logo clearly printed on the front.`,
    `Through the large classroom window you can clearly see: ${landmark}.`,
    universityDetail,
    `The classroom has colorful ABCs on the walls, crayon drawings on the chalkboard, and alphabet floor tiles.`,
    `Full-body wide shot. Canon 5D Mark IV quality. Sharp focus, face clearly recognizable. Natural warm classroom light. No motion blur. No text overlays. Static photograph only.`,
  ].filter(Boolean).join(" ");

  const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;
  console.log("[step 2/7 | personalized-image] Starting — name:", fullName, "| company:", company, "| location:", location || "(none)", "| blob ready:", hasBlobToken, "| headshot:", headshotUrl ? "yes" : "no");

  if (!hasBlobToken) {
    console.warn("[step 2/7 | personalized-image] SKIPPED — BLOB_READ_WRITE_TOKEN is not set.");
    return null;
  }

  try {
    // flux-kontext-pro accepts input images via prompt.images — the SDK passes
    // them directly to BFL's API as reference images for face-accurate editing.
    // URLs and base64 strings are both supported; URL is simpler and avoids
    // the base64 fetch step entirely.
    const useKontext = !!headshotUrl;
    const model = useKontext ? "bfl/flux-kontext-pro" : "xai/grok-imagine-image";
    console.log("[step 2/7 | personalized-image] Calling", model, "| img2img:", useKontext);

    // The BFL SDK documents prompt.images for img2img; cast to any to satisfy
    // the gateway string-model type which only declares prompt as string.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const generateImageAny = generateImage as (opts: any) => Promise<any>;
    const result = await generateImageAny({
      model,
      prompt: useKontext ? { text: prompt, images: [headshotUrl] } : prompt,
      aspectRatio: "1:1",
    });

    const base64 = result.images?.[0]?.base64;
    if (!base64) throw new Error("Model returned no image data");

    console.log("[step 2/7 | personalized-image] Image generated — uploading to Vercel Blob...");
    const buffer = Buffer.from(base64, "base64");
    const filename = `outreach-images/${Date.now()}-${firstName.toLowerCase().replace(/\s+/g, "-")}.png`;
    const blob = await put(filename, buffer, { access: "public", contentType: "image/png" });

    console.log("[step 2/7 | personalized-image] SUCCESS — model:", model, "| url:", blob.url);
    return blob.url;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[step 2/7 | personalized-image] FAILED —", msg);
    return null;
  }
}

// ─── Step 3: AI outreach email draft ──────────────────────────────────────────

function buildFallbackDraft(lead: LeadWebhookPayload, enrichment: ApifyLinkedInResult, productUrl: string, calendlyLink: string): OutreachDraft {
  const firstName = (lead.firstName || enrichment.firstName || "there").trim();
  const role = enrichment.jobTitle || lead.title || "your role";
  const company = (enrichment.companyName || lead.companyName || "your team").trim();

  const purposeLine = lead.purpose
    ? `<p>You mentioned you want to <strong>${lead.purpose.toLowerCase()}</strong> — that's usually where the most manual work hides: researching each lead, writing something relevant, and deciding who needs the next touch.</p>`
    : `<p>Teams in <strong>${lead.industry || "education"}</strong> usually hit the same wall: the research and follow-up before each conversation takes longer than the conversation itself.</p>`;

  const detailsLine = lead.details
    ? `<p><em>"${lead.details.replace(/[<>]/g, "").replace(/[.!?]+$/, "")}"</em> — that context is exactly the kind of thing CoursePilot is built to act on.</p>`
    : "";

  return {
    subject: `Quick idea for ${firstName} at ${company}`,
    body:
      `<p>Hi <strong>${firstName}</strong>,</p>` +
      purposeLine +
      detailsLine +
      `<p>As <em>${role}</em> at <strong>${company}</strong>, you're probably the one deciding whether that process stays manual or gets systematized. <strong>CoursePilot</strong> handles the enrichment, draft, and follow-up automatically — so your team only has to review and send.</p>` +
      `<p style="margin:20px 0;"><a href="${productUrl}" style="color:#2563eb;font-weight:600;">${productUrl.replace(/https?:\/\//, "")}</a></p>` +
      `<p>The outcome for most teams is a faster first touch, higher reply rates, and <em>no extra headcount</em>.</p>` +
      `<p>Worth 30 minutes? <a href="${calendlyLink}" style="color:#2563eb;font-weight:600;">Book time here</a> and we can walk through exactly where it fits for ${company}.</p>`,
  };
}

async function generateOutreachEmail(lead: LeadWebhookPayload, enrichment: ApifyLinkedInResult): Promise<OutreachDraft> {
  "use step";

  const calendlyLink = process.env.OUTREACH_CALENDLY_URL || "https://calendly.com/course-pilot/30min";
  const productUrl = process.env.OUTREACH_PRODUCT_URL || "https://coursepilot.example/";
  const model = process.env.AI_MODEL || "openai/gpt-5.5";
  const firstName = (lead.firstName || enrichment.firstName || "there").trim();
  const role = enrichment.jobTitle || lead.title || "";
  const company = enrichment.companyName || lead.companyName || "";

  console.log("[step 3/7 | ai-email-draft] Generating outreach email via model:", model, "| to:", firstName);

  const skills = (enrichment.skills ?? []).slice(0, 5).map((s) => s?.title).filter(Boolean).join(", ");
  const updates = (enrichment.updates ?? [])
    .slice(0, 3)
    .map((u, i) => `Post ${i + 1}: ${[u?.subTitle, u?.title].filter(Boolean).join(" ")}`)
    .join("\n");

  const userPrompt = `# LEAD INTELLIGENCE PROVIDED

Contact Info
First Name: ${enrichment.firstName || lead.firstName || ""}
Last Name: ${enrichment.lastName || lead.lastName || ""}
Title: ${role}
Company: ${company}
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

Product URL: ${productUrl}
Calendly Link: ${calendlyLink}`;

  const systemPrompt = `You are a CoursePilot Solutions Architect writing a warm, personal outreach email to an inbound education-technology lead.

Tone & Style
Write like a sharp, direct operator — not a marketer. Be specific. Be human.
Use the lead's name, role, company, purpose, and any details they shared to make every sentence feel written for them.
Use <strong> tags to bold the lead's name in the greeting, their company name, and one or two key ideas per paragraph.
Use <em> tags to italicise one phrase per paragraph that adds personality or emphasis (e.g. a quoted detail they shared, an outcome phrase, a rhetorical aside).
Do NOT use emojis, asterisks, or filler phrases like "I hope this finds you well".

Structure (all wrapped in <p> tags — no other block elements)
1. Greeting: <p>Hi <strong>${firstName}</strong>,</p>
2. Personal hook: Reference their stated purpose or details directly. Make them feel seen.
3. Problem: Name the specific manual friction their role creates in education outreach/follow-up.
4. Solution: One precise sentence about what CoursePilot does for their specific context. No URL needed here.
5. Outcome: A concrete operational result for their specific context. Use <em> for one phrase.
6. CTA: End with "Worth 30 minutes?" then: <a href="${calendlyLink}" style="color:#2563eb;font-weight:600;">Book time here</a> and reference their company name.

Constraints
Return ONLY valid JSON with exactly two keys: subject and body.
subject: short, specific to their role/company/purpose — never generic.
body: the 6-paragraph HTML string. Only <p>, <strong>, <em>, and <a> tags allowed.
Body must start exactly with: <p>Hi <strong>${firstName}</strong>,</p>
Total word count: 130–180 words.
Do NOT include a sign-off line (Alex from CoursePilot) — that goes in the email footer automatically.
After the CTA, add one final short PS line that is visionary and ties education or learning back to CoursePilot, with a hint that there is something to see at the bottom of the email. The tone should feel like a confident product moment — bold but not cheesy. Examples of the right tone: "<p><em>P.S. We imagined what your classroom looks like once CoursePilot is running it — scroll down.</em></p>" or "<p><em>P.S. Every great course launch starts somewhere. We pictured yours — take a look below.</em></p>" — vary it naturally based on their role and purpose. One sentence only, no emojis, no exclamation marks.

Output example
{"subject":"Faster follow-up for ${company || "your team"}","body":"<p>Hi <strong>${firstName}</strong>,</p><p>...</p>"}`;

  try {
    const { text, usage, finishReason } = await generateText({
      model,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.3,
    });

    console.log("[step 3/7 | ai-email-draft] Done — finishReason:", finishReason, "| tokens:", JSON.stringify(usage));

    const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI response did not contain JSON.");

    const parsed = JSON.parse(match[0]) as Partial<OutreachDraft>;
    if (!parsed.subject || !parsed.body) throw new Error("AI response was missing subject or body.");

    return { subject: String(parsed.subject), body: String(parsed.body) };
  } catch (error) {
    console.warn("[step 3/7 | ai-email-draft] Falling back to template —", error instanceof Error ? error.message : String(error));
    return buildFallbackDraft(lead, enrichment, productUrl, calendlyLink);
  }
}

// ─── Step 4: Build tracking pixel URL ─────────────────────────────────────────

async function buildTrackingPixelUrl(leadEmail: string): Promise<string> {
  "use step";

  const base =
    process.env.OUTREACH_PIXEL_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const id = encodeURIComponent(leadEmail || "unknown");
  const url = `${base.replace(/\/$/, "")}/api/track-open?id=${id}`;

  console.log("[step 4/7 | tracking-pixel] Pixel URL built for:", leadEmail || "(no email)");
  return url;
}

// ─── Step 5: Wrap in branded HTML template + inject pixel ─────────────────────

async function injectTrackingPixel(draft: OutreachDraft, pixelUrl: string, imageUrl: string | null): Promise<OutreachDraft> {
  "use step";

  const productUrl = process.env.OUTREACH_PRODUCT_URL || "https://coursepilot.example/";
  const html = wrapInEmailTemplate(draft.body, pixelUrl, productUrl, imageUrl);

  console.log("[step 5/7 | inject-pixel] Wrapped in branded HTML template", imageUrl ? "(with personalized image)" : "(no image)", "— injected tracking pixel");
  return { subject: draft.subject, body: html };
}

// ─── Step 6: Send via Gmail SMTP ──────────────────────────────────────────────

async function sendOutreachEmail(to: string, subject: string, html: string): Promise<OutreachSendResult> {
  "use step";

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const from = process.env.FROM_EMAIL || gmailUser;

  // SMTP_FORCE_TO overrides the recipient for testing purposes.
  const effectiveTo = process.env.SMTP_FORCE_TO || to;

  console.log(
    "[step 6/7 | send-email] Sending to:", effectiveTo || "(no recipient)",
    process.env.SMTP_FORCE_TO ? `(forced from: ${to})` : "",
    "| subject:", subject,
  );

  if (!gmailUser || !gmailPass || !effectiveTo) {
    const reason = !gmailUser ? "missing GMAIL_USER" : !gmailPass ? "missing GMAIL_APP_PASSWORD" : "no recipient address";
    console.warn("[step 6/7 | send-email] Mock mode —", reason);
    return { sent: true, mode: "mock", message: `Mock send (${reason}).` };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailPass },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Alex from CoursePilot" <${from}>`,
      to: effectiveTo,
      subject,
      html,
    });
    console.log("[step 6/7 | send-email] Sent — message ID:", info.messageId, "| to:", effectiveTo);
    return { sent: true, mode: "real", message: "Email sent via Gmail SMTP.", providerId: info.messageId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[step 6/7 | send-email] SMTP error:", msg);
    return { sent: false, mode: "real", message: msg };
  }
}

// ─── Step 7: Log the outreach record ──────────────────────────────────────────

async function logOutreachRecord(record: Omit<OutreachLogRecord, "id" | "loggedAt">): Promise<OutreachLogRecord> {
  "use step";

  const full: OutreachLogRecord = {
    id: crypto.randomUUID(),
    loggedAt: new Date().toISOString(),
    ...record,
  };

  console.log("[step 7/7 | outreach-log]", JSON.stringify(full));
  return full;
}

// ─── Main workflow orchestrator ────────────────────────────────────────────────

export async function runLeadOutreachWorkflow(lead: LeadWebhookPayload) {
  "use workflow";

  console.log("[workflow | lead-outreach] Starting — lead:", lead.firstName, lead.lastName, "| email:", lead.businessEmail, "| purpose:", lead.purpose);

  const enrichment = await runApifyLinkedInActor(lead.linkedinUrl, lead);
  const personalizedImage = await generatePersonalizedImage(lead, enrichment);
  const draft = await generateOutreachEmail(lead, enrichment);
  const businessEmail = lead.businessEmail || "";
  const pixelUrl = await buildTrackingPixelUrl(businessEmail);
  const finalEmail = await injectTrackingPixel(draft, pixelUrl, personalizedImage);
  const send = await sendOutreachEmail(businessEmail, finalEmail.subject, finalEmail.body);
  const record = await logOutreachRecord({ lead, enrichment, draft: finalEmail, send });

  console.log("[workflow | lead-outreach] Complete — runId:", record.id, "| sent:", send.sent, "| mode:", send.mode);

  return {
    workflowId: record.id,
    sent: send.sent,
    mode: send.mode,
    providerId: send.providerId,
    enrichmentSource: enrichment.source,
  };
}
