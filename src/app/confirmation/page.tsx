"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ConfirmationContent() {
  const params = useSearchParams();
  const runId = params.get("runId");

  return (
    <main>
      <section className="confirmation-wrap">
        <div className="confirmation-icon" aria-hidden>
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="24" fill="#eff6ff" />
            <path d="M14 25l7 7 13-14" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="section-title confirmation-title">You&apos;re all set.</h1>
        <p className="section-sub confirmation-sub">
          We&apos;ve received your info. Alex from CoursePilot will be in touch via email shortly.
        </p>
        {runId ? (
          <p className="confirmation-runid">Reference ID: <code>{runId}</code></p>
        ) : null}
        <div className="confirmation-actions">
          <Link href="/" className="btn btn-primary">
            Back to home
          </Link>
          <a href="https://calendly.com/course-pilot/30min" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            Book a call now
          </a>
        </div>
      </section>
    </main>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}
