import { NextResponse } from "next/server";
import { start } from "workflow/api";
import { validateFormSubmission } from "@/lib/validation";
import { runLeadOutreachWorkflow } from "@/workflows/lead-outreach";

export const runtime = "nodejs";

// ─── In-process rate limiter ───────────────────────────────────────────────────
// Allows 5 submissions per IP per 60-second window. In production this would
// use Upstash Redis so limits survive across serverless instances and regions.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT - entry.count };
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

export async function POST(request: Request) {
  // Rate limiting — read forwarded IP (set by Vercel's edge) or fall back to a
  // constant so local dev never gets blocked.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1";

  const { allowed, remaining } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute before submitting again." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Limit": String(RATE_LIMIT),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const validation = validateFormSubmission(body);
  if (!validation.ok || !validation.data) {
    return NextResponse.json({ error: "Validation failed.", errors: validation.errors }, { status: 400 });
  }

  const { fullName, email, linkedinUrl, primaryGoal, details } = validation.data;
  const { firstName, lastName } = splitName(fullName);

  let runId: string | undefined;
  try {
    const handle = await start(runLeadOutreachWorkflow, [
      {
        linkedinUrl,
        firstName,
        lastName: lastName || undefined,
        businessEmail: email,
        purpose: primaryGoal,
        details: details || undefined,
        seenAt: new Date().toISOString(),
        capturedUrl: "https://coursepilot.example/intake",
      },
    ]);
    runId = handle?.runId;
  } catch (err) {
    console.error("[intake] Failed to start workflow:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "Failed to start the workflow. Please try again." }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, runId },
    { headers: { "X-RateLimit-Limit": String(RATE_LIMIT), "X-RateLimit-Remaining": String(remaining) } },
  );
}
