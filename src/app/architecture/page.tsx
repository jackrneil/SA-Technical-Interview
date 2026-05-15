export default function ArchitecturePage() {
  return (
    <main>
      <section style={{ marginBottom: "2.5rem" }}>
        <span className="eyebrow-pill">Engineering decisions</span>
        <h1 className="section-title" style={{ marginTop: "1rem" }}>
          How CoursePilot is built
        </h1>
        <p className="section-sub">
          A walkthrough of the rendering strategy, security controls, AI orchestration, and evaluation approach — and the trade-offs behind each decision.
        </p>
      </section>

      {/* ── Rendering strategy ── */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 className="arch-section-heading">Next.js rendering strategy</h2>
        <p className="arch-section-intro">
          Next.js App Router lets you choose per-page whether to render on the server or the client. The right choice depends on whether the page needs interactivity, browser APIs, or just static markup.
        </p>
        <div className="grid-3">
          <div className="content-card arch-card">
            <span className="arch-badge arch-badge--server">Server Component</span>
            <h3>Landing, Architecture, Evals</h3>
            <p>
              Pure markup with no browser APIs or event handlers. Rendered once on the server — smaller JS bundle, faster first paint, better SEO. No <code>&quot;use client&quot;</code> directive needed.
            </p>
          </div>
          <div className="content-card arch-card">
            <span className="arch-badge arch-badge--client">Client Component</span>
            <h3>Intake form, Confirmation, Result</h3>
            <p>
              These pages use <code>useState</code>, <code>useEffect</code>, <code>sessionStorage</code>, and polling — all browser-only APIs. They carry <code>&quot;use client&quot;</code> and hydrate on the browser after the initial server render.
            </p>
          </div>
          <div className="content-card arch-card">
            <span className="arch-badge arch-badge--server">Route Handlers</span>
            <h3>/api/* endpoints</h3>
            <p>
              All server-only. Credentials, AI calls, and workflow orchestration never touch the client. The rate limiter, input validator, and email sender all run here — not in browser code.
            </p>
          </div>
        </div>
      </section>

      {/* ── Security ── */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 className="arch-section-heading">Security &amp; input safety</h2>
        <p className="arch-section-intro">
          Three layers protect the API before any AI or external service is called.
        </p>
        <div className="grid-3">
          <div className="content-card arch-card">
            <span className="arch-badge arch-badge--security">Rate limiting</span>
            <h3>5 requests / IP / minute</h3>
            <p>
              <code>/api/intake</code> tracks submissions per IP in a sliding window. Exceeds the limit returns HTTP 429 with a <code>Retry-After</code> header. In production this moves to Upstash Redis so limits survive across serverless instances and regions.
            </p>
          </div>
          <div className="content-card arch-card">
            <span className="arch-badge arch-badge--security">Input validation</span>
            <h3>Schema enforcement before AI</h3>
            <p>
              Every field is validated before the workflow starts: email must match RFC pattern, LinkedIn URL must be <code>linkedin.com/in/*</code>, details capped at 2,000 characters, and <code>primaryGoal</code> must be one of the allowlisted enum values. Malformed requests are rejected at 400 before any AI token is spent.
            </p>
          </div>
          <div className="content-card arch-card">
            <span className="arch-badge arch-badge--security">Prompt injection mitigation</span>
            <h3>Character cap + server-only AI</h3>
            <p>
              The 2,000-character cap on free-text input limits the attack surface for prompt injection. All AI calls run server-side in route handlers — the model and API key are never exposed to the client. The enrichment tool only fetches allowlisted public LinkedIn URLs; SSRF is blocked by hostname validation before any outbound fetch.
            </p>
          </div>
        </div>
      </section>

      {/* ── Workflow SDK ── */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 className="arch-section-heading">Durable workflow orchestration</h2>
        <p className="arch-section-intro">
          The core submission flow uses the Vercel Workflow SDK — the same primitive as AWS Step Functions or Temporal, but native to Vercel. Each step is checkpointed so the workflow survives serverless cold starts, timeouts, and retries without re-running completed steps.
        </p>
        <div className="two-column">
          <div className="content-card arch-card">
            <h3>7-step pipeline</h3>
            <ol style={{ paddingLeft: "1.25rem", lineHeight: 2, fontSize: "0.92rem" }}>
              <li><strong>LinkedIn enrichment</strong> — Apify actor scrapes public profile; falls back to form data if unavailable.</li>
              <li><strong>Personalized image generation</strong> — FLUX model generates a kindergarten-style image using the lead&apos;s headshot as input via img2img.</li>
              <li><strong>AI email draft</strong> — Single <code>generateText</code> call outputs 4-field JSON: email subject, HTML body, fit summary, and 3 company-specific possibilities.</li>
              <li><strong>Tracking pixel</strong> — Pixel URL built server-side and injected into the email HTML template.</li>
              <li><strong>Email send</strong> — Nodemailer via Gmail SMTP with DKIM alignment, plain-text alternative, and deliverability headers.</li>
              <li><strong>Outreach log</strong> — Full record logged for audit trail.</li>
            </ol>
          </div>
          <div className="content-card arch-card">
            <h3>Why durable steps matter</h3>
            <p style={{ marginBottom: "0.85rem" }}>
              Image generation takes ~15 seconds. AI drafting takes ~10 seconds. A normal serverless function would time out or lose state on a cold start. The Workflow SDK checkpoints each step — if the function is interrupted mid-way, it resumes from the last completed step rather than restarting from scratch.
            </p>
            <p>
              This is the same pattern the interviewer described as &ldquo;keeping the agent in the loop&rdquo; — comparable to AWS Strands or Temporal, but without managing separate infrastructure.
            </p>
          </div>
        </div>
      </section>

      {/* ── AI SDK ── */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 className="arch-section-heading">AI SDK usage</h2>
        <p className="arch-section-intro">
          The app uses three distinct AI SDK primitives — each chosen for a specific reason.
        </p>
        <div className="grid-3">
          <div className="content-card arch-card">
            <span className="arch-badge arch-badge--ai">generateText + structured JSON</span>
            <h3>Email draft + result content</h3>
            <p>
              A single <code>generateText</code> call outputs 4 fields as validated JSON. The prompt enforces the schema and validates the response before accepting it — if a field is missing or malformed, the fallback template is used instead. This prevents hallucinated or partial outputs from reaching the lead.
            </p>
          </div>
          <div className="content-card arch-card">
            <span className="arch-badge arch-badge--ai">experimental_generateImage</span>
            <h3>Personalized kindergarten image</h3>
            <p>
              Uses FLUX Kontext Pro via img2img with the lead&apos;s LinkedIn headshot as the seed image. The result is stored in Vercel Blob and included in the email — giving each outreach a visual artifact that is unique to that lead.
            </p>
          </div>
          <div className="content-card arch-card">
            <span className="arch-badge arch-badge--ai">AI Gateway (optional)</span>
            <h3>Model routing + fallback</h3>
            <p>
              The model is configurable via <code>AI_MODEL</code> env var, routed through Vercel AI Gateway. This means you can swap providers, enforce model policies, and add observability without touching application code. The email draft step specifically avoids thinking models to prevent token waste on internal reasoning.
            </p>
          </div>
        </div>
      </section>

      {/* ── Evals ── */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 className="arch-section-heading">Evaluation approach</h2>
        <p className="arch-section-intro">
          Before any email is sent, the AI output is scored programmatically across 5 dimensions. This is the lightweight eval approach the Vercel take-home requires — not just "does it work" but "is it safe and high quality."
        </p>
        <div className="two-column">
          <div className="content-card arch-card">
            <h3>5-dimension rubric</h3>
            <ul style={{ paddingLeft: "1.1rem", lineHeight: 2, fontSize: "0.92rem" }}>
              <li><strong>Personalization</strong> — Does the output reference the lead&apos;s name, role, company, or goal?</li>
              <li><strong>Accuracy</strong> — Are specific claims grounded in submitted data?</li>
              <li><strong>Business value</strong> — Does it articulate a concrete outcome?</li>
              <li><strong>Safety</strong> — No disallowed content or manipulation patterns?</li>
              <li><strong>CTA quality</strong> — Is there a clear, specific call to action?</li>
            </ul>
          </div>
          <div className="content-card arch-card">
            <h3>Hallucination flags + test cases</h3>
            <p style={{ marginBottom: "0.85rem" }}>
              A pattern-matching pass checks for hallucination signals: revenue claims, employee counts, or funding details that were never in the input. Any match flags the output for human review.
            </p>
            <p>
              Three persona test cases (creator, enterprise school, training company) document expected rubric behavior and serve as regression tests for prompt changes.
            </p>
            <p style={{ marginTop: "0.85rem" }}>
              <a href="/evals" style={{ color: "var(--primary)", fontWeight: 600 }}>View the eval rubric →</a>
            </p>
          </div>
        </div>
      </section>

      {/* ── Production path ── */}
      <section className="content-card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "0.5rem" }}>Production roadmap</h2>
        <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          Move the rate limiter to <strong>Upstash Redis</strong> for cross-region persistence. Add <strong>Clerk or Auth0</strong> for authenticated human review before send. Replace the outreach log with a <strong>Neon Postgres</strong> table for searchable lead history. Add a <strong>CRM webhook</strong> (HubSpot / Salesforce) on workflow completion. Wire <strong>Vercel Analytics</strong> to track form → confirmation → Calendly conversion. Promote the eval rubric to a continuous regression suite that runs on every prompt change in CI.
        </p>
      </section>
    </main>
  );
}
