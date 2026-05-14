import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const payload = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};

  if (!isValidEmail(payload.to) || typeof payload.subject !== "string" || typeof payload.html !== "string") {
    return NextResponse.json({ error: "to, subject, and html are required." }, { status: 400 });
  }

  // Production hardening would add rate limiting and approval audit logging here.
  const result = await sendEmail({
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  });

  return NextResponse.json(result, { status: result.sent ? 200 : 502 });
}
