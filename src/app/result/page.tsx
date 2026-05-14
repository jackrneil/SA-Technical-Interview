"use client";

import Link from "next/link";
import { useState } from "react";
import { AccountBrief } from "@/components/AccountBrief";
import { EmailPreview } from "@/components/EmailPreview";
import { EvaluationPanel } from "@/components/EvaluationPanel";
import { WorkflowTimeline } from "@/components/WorkflowTimeline";
import { IntakeResponse, SendEmailResponse } from "@/lib/types";

function getStoredResult(): IntakeResponse | null {
  if (typeof window === "undefined") return null;

  const stored = window.sessionStorage.getItem("coursepilot:lastResult");
  return stored ? (JSON.parse(stored) as IntakeResponse) : null;
}

function emailToHtml(body: string): string {
  return body
    .split("\n")
    .map((line) => `<p>${line.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
    .join("");
}

export default function ResultPage() {
  const [result] = useState<IntakeResponse | null>(getStoredResult);
  const [sendState, setSendState] = useState<SendEmailResponse | null>(null);
  const [sending, setSending] = useState(false);

  async function sendEmail() {
    if (!result) return;

    setSending(true);
    setSendState(null);
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        to: result.lead.email,
        subject: result.aiResult.emailSubject,
        html: emailToHtml(result.aiResult.emailBody),
      }),
    });
    setSendState((await response.json()) as SendEmailResponse);
    setSending(false);
  }

  if (!result) {
    return (
      <main>
        <div className="content-card" style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
          <span className="eyebrow-pill">No result yet</span>
          <h1 className="section-title" style={{ marginTop: "1rem" }}>
            Generate a lead brief first.
          </h1>
          <p>Results are kept in browser session storage for this take-home so scraped data is not persisted in a database.</p>
          <Link className="btn btn-primary" href="/intake" style={{ marginTop: "1rem" }}>
            Go to intake
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <section style={{ marginBottom: "2rem" }}>
        <span className="eyebrow-pill">Human review</span>
        <h1 className="section-title" style={{ marginTop: "1rem" }}>
          {result.lead.fullName}
        </h1>
        <p className="lead">
          {result.lead.role} at {result.lead.companyName}. Review the account brief, generated email, evaluation result, and workflow timeline before
          sending.
        </p>
        <div className="pill-row">
          <span className="pill">{result.lead.primaryGoal}</span>
          <span className="pill">Confidence {result.aiResult.confidenceScore}/100</span>
          <span className="pill">{result.evaluation.overallPass ? "Evaluation pass" : "Needs review"}</span>
        </div>
      </section>

      <div className="two-column">
        <div className="stack">
          <AccountBrief {...result} />
          <WorkflowTimeline steps={result.workflow} />
        </div>
        <div className="stack">
          <EmailPreview aiResult={result.aiResult} />
          <EvaluationPanel evaluation={result.evaluation} />
          <div className="content-card">
            <span className="eyebrow-pill">Email send</span>
            <h2 style={{ marginTop: "0.85rem", fontSize: "1.25rem", fontWeight: 700 }}>Send after review</h2>
            <p>Real sending uses Resend only when server-side credentials are configured. Otherwise the app returns mock mode.</p>
            <button className="btn btn-primary" disabled={sending} onClick={sendEmail} style={{ marginTop: "0.85rem" }}>
              {sending ? "Sending..." : "Send email"}
            </button>
            {sendState ? (
              <p style={{ marginTop: "0.75rem" }}>
                <strong>{sendState.mode === "real" ? "Real send" : "Mock send"}:</strong> {sendState.message}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
