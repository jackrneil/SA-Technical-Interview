import { NextResponse } from "next/server";

export const runtime = "nodejs";

// 1x1 transparent GIF used as the tracking pixel.
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
  "base64",
);

export function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") || "unknown";

  console.log("[outreach-open]", JSON.stringify({ id, openedAt: new Date().toISOString() }));

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      "content-type": "image/gif",
      "content-length": String(PIXEL.length),
      "cache-control": "no-store, max-age=0",
    },
  });
}
