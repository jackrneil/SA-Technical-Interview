export default function ArchitecturePage() {
  return (
    <main>
      <section style={{ marginBottom: "2.5rem" }}>
        <span className="eyebrow-pill">Engineering decisions</span>
        <h1 className="section-title" style={{ marginTop: "1rem" }}>
          How CoursePilot is built
        </h1>
        <p className="section-sub">
          A walkthrough of the rendering strategy, security controls, durable workflow orchestration, AI SDK primitives, and evaluation approach — and the reasoning behind each decision.
        </p>
      </section>

      {/* ── Rendering strategy ── */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 className="arch-section-heading">Next.js rendering strategy</h2>
        <p className="arch-section-intro">
          Next.js App Router lets each page independently decide whether to render on the server or the client. The key question: does this page need interactivity, browser APIs, or real-time state? If yes, it&apos;s a Client Component. If not, it stays on the server.
        </p>
        <div className="grid-3">
          <div className="content-card arch-card">
            <span className="arch-badge arch-badge--server">Server Component</span>
            <h3>Landing, Architecture, Evals</h3>
            <p>
              Pure static markup — no event handlers, no <code>useState</code>, no browser APIs. Rendered once on the server at request time. Smaller JS bundle shipped to the browser, faster first contentful paint, and better SEO because crawlers see the full HTML. No <code>&quot;use client&quot;</code> directive is needed.
            </p>
          </div>
          <div className="content-card arch-card">
            <span className="arch-badge arch-badge--client">Client Component</span>
            <h3>Intake form, Confirmation</h3>
            <p>
              These pages use <code>useState</code>, <code>useEffect</code>, <code>useSearchParams</code>, and <code>sessionStorage</code> — all browser-only APIs that cannot run during server-side rendering. The <code>&quot;use client&quot;</code> directive tells Next.js to ship the component&apos;s JS bundle and hydrate it in the browser after the initial server-rendered HTML loads.
            </p>
          </div>
          <div className="content-card arch-card">
            <span className="arch-badge arch-badge--server">Route Handlers (Node.js)</span>
            <h3>/api/intake, /api/run-status</h3>
            <p>
              All API routes are server-only. Credentials (Gmail, Apify, Blob), AI model calls, and workflow orchestration never leave the server. Rate limiting, input validation, and the eval rubric all run here — invisible to the client. This is also why prompt injection from the browser can&apos;t directly affect the AI: the user never calls the model directly.
            </p>
          </div>
        </div>
      </section>

      {/* ── Security ── */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 className="arch-section-heading">Security &amp; input safety</h2>
        <p className="arch-section-intro">
          Three layers run before any AI token is spent or external service is called.
        </p>
        <div className="grid-3">
          <div className="content-card arch-card">
            <span className="arch-badge arch-badge--security">Rate limiting</span>
            <h3>5 requests / IP / 60-second window</h3>
            <p>
              <code>/api/intake</code> tracks submission counts per IP address in a sliding window. Exceeding the limit returns HTTP 429 with <code>Retry-After: 60</code> and <code>X-RateLimit-*</code> headers. The current implementation is in-process (a <code>Map</code> inside the Node.js runtime). In production, this moves to Upstash Redis so limits persist across serverless instances and across regions — a stateless function can&apos;t share in-memory state between invocations at scale.
            </p>
          </div>
          <div className="content-card arch-card">
            <span className="arch-badge arch-badge--security">Input validation before AI</span>
            <h3>Schema enforcement at the API boundary</h3>
            <p>
              Every field is validated before the workflow starts: email must match RFC pattern, LinkedIn URL must be <code>linkedin.com/in/*</code> with HTTPS, free-text details are capped at 2,000 characters, and <code>primaryGoal</code> must be one of a fixed allowlist of enum values. SSRF is blocked by validating that any submitted URL resolves to a public hostname — private ranges (<code>10.*</code>, <code>192.168.*</code>, <code>localhost</code>) are rejected. Malformed requests are rejected at 400 before any AI token is spent.
            </p>
          </div>
          <div className="content-card arch-card">
            <span className="arch-badge arch-badge--security">Prompt injection mitigation</span>
            <h3>Bounded input + server-only AI</h3>
            <p>
              The 2,000-character cap limits the surface area for prompt injection. All AI calls run in server-side Route Handlers — the model and API key are never exposed to the client. The enrichment tool (<code>getIndustryInsight</code>) is read-only and uses a static lookup table, so even if the AI calls it unexpectedly, it can&apos;t write to any database or make external HTTP requests. The AI has no write access to any storage — it can only return text, which is then validated by the eval rubric before being sent.
            </p>
          </div>
        </div>
      </section>

      {/* ── Workflow SDK ── */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 className="arch-section-heading">Durable workflow orchestration</h2>
        <p className="arch-section-intro">
          The submission flow uses the Vercel Workflow SDK — the same durable-execution pattern as AWS Step Functions or Temporal, but native to Vercel. Each step is checkpointed, so if a serverless function is interrupted mid-execution (cold start, timeout, crash), the workflow resumes from the last completed step without re-running earlier ones.
        </p>
        <div className="two-column">
          <div className="content-card arch-card">
            <h3>7-step pipeline</h3>
            <ol style={{ paddingLeft: "1.25rem", lineHeight: 2.1, fontSize: "0.88rem" }}>
              <li><strong>LinkedIn enrichment</strong> — Apify actor fetches the public profile; falls back to form data if the token is absent or the actor fails.</li>
              <li><strong>Personalized image generation</strong> — <code>experimental_generateImage</code> calls FLUX Kontext Pro in img2img mode using the lead&apos;s LinkedIn headshot as the seed image. Result uploaded to Vercel Blob.</li>
              <li><strong>AI email draft</strong> — <code>generateText</code> with <code>tools</code> + <code>stopWhen: stepCountIs(2)</code>. The AI may call <code>getIndustryInsight</code> (one read-only tool) then drafts a JSON object with <code>subject</code> and <code>body</code>.</li>
              <li><strong>Tracking pixel URL</strong> — Built server-side and injected into the branded HTML template.</li>
              <li><strong>Email send</strong> — Nodemailer via Gmail SMTP with DKIM alignment, multipart/alternative (plain text + HTML), and deliverability headers.</li>
              <li><strong>Fit metadata</strong> — <code>generateObject</code> with a Zod schema produces a validated <code>fitSummary</code> + 3 <code>possibilities</code> objects. No regex parsing — schema validation is enforced at the SDK layer.</li>
              <li><strong>Eval + log</strong> — Rubric runs programmatically; full record is logged with score.</li>
            </ol>
          </div>
          <div className="content-card arch-card">
            <h3>Why durable steps matter</h3>
            <p style={{ marginBottom: "0.85rem" }}>
              Image generation takes ~15 seconds. AI drafting with a tool call takes ~10 seconds. A normal serverless function has a short timeout and no shared state — if it crashes, it restarts from scratch. The Workflow SDK checkpoints each <code>&quot;use step&quot;</code> boundary. If the function is interrupted halfway through, it resumes from step 3, not step 1.
            </p>
            <p>
              This is the same primitive the interviewer described as &quot;keeping the agent in the loop&quot; — analogous to AWS Strands, AWS Step Functions, or Temporal, but without managing separate infrastructure or YAML definitions.
            </p>
          </div>
        </div>
      </section>

      {/* ── AI SDK primitives ── */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 className="arch-section-heading">AI SDK primitives used</h2>
        <p className="arch-section-intro">
          Three distinct AI SDK primitives are used — each chosen because it&apos;s the right tool for that specific output shape.
        </p>
        <div className="grid-3">
          <div className="content-card arch-card">
            <span className="arch-badge arch-badge--ai">generateText + tool calling</span>
            <h3>Email draft (Step 3)</h3>
            <p style={{ marginBottom: "0.6rem" }}>
              Used for long-form HTML prose where the output shape isn&apos;t strictly typed. The AI can optionally call <code>getIndustryInsight</code> before writing — one read-only tool with a static lookup. <code>stopWhen: stepCountIs(2)</code> caps the agent at one tool call + one final response, keeping latency predictable.
            </p>
            <p>
              Trade-off vs <code>generateObject</code>: more flexible for HTML output, but requires manual JSON parsing and a try/catch fallback because the model might not follow the JSON schema perfectly.
            </p>
          </div>
          <div className="content-card arch-card">
            <span className="arch-badge arch-badge--ai">generateObject + Zod schema</span>
            <h3>Fit metadata (Step 6b)</h3>
            <p style={{ marginBottom: "0.6rem" }}>
              Used for structured data where type safety matters. The Zod schema is passed directly to the SDK — if the model returns a malformed object, the SDK automatically retries before surfacing an error. No <code>JSON.parse</code> try/catch needed.
            </p>
            <p>
              Trade-off vs <code>generateText</code>: cannot use tool calling alongside it, and some models struggle with strict schemas on long outputs. That&apos;s why it&apos;s used for short structured data (fitSummary + 3 possibilities), not the full HTML email.
            </p>
          </div>
          <div className="content-card arch-card">
            <span className="arch-badge arch-badge--ai">experimental_generateImage</span>
            <h3>Personalized image (Step 2)</h3>
            <p style={{ marginBottom: "0.6rem" }}>
              Calls FLUX Kontext Pro via the AI Gateway in img2img mode — the lead&apos;s LinkedIn headshot is passed as a reference image for face-accurate editing. Falls back to standard text-to-image if no headshot is available.
            </p>
            <p>
              Result is stored in Vercel Blob and embedded in the email as a personalized visual artifact — a CoursePilot-specific differentiator for outreach.
            </p>
          </div>
        </div>
      </section>

      {/* ── Features not implemented ── */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 className="arch-section-heading">AI SDK features deliberately not implemented — and why</h2>
        <p className="arch-section-intro">
          Three natural extensions were considered and explicitly not built. Being able to explain <em>why</em> is as important as knowing what&apos;s possible.
        </p>
        <div className="grid-3">
          <div className="content-card arch-card">
            <span className="arch-badge" style={{ background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" }}>Not used: streamText</span>
            <h3>Real-time streaming to the client</h3>
            <p>
              <code>streamText</code> streams tokens to the browser as they&apos;re generated — good for chat interfaces. It wasn&apos;t used here because the email draft runs inside a <strong>durable workflow step</strong>. A Vercel Workflow step is a single atomic execution — it must complete and checkpoint before the next step starts. Streaming mid-step to the client would require a persistent WebSocket connection across that boundary, which isn&apos;t compatible with the serverless checkpoint model. The right architecture for streaming + durable execution is polling (what we do) or Vercel&apos;s upcoming Fluid Compute.
            </p>
          </div>
          <div className="content-card arch-card">
            <span className="arch-badge" style={{ background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" }}>Not used: multi-tool agent loops</span>
            <h3>Autonomous agent with many tools</h3>
            <p>
              <code>stopWhen: stepCountIs(2)</code> limits the AI to one tool call. Removing the cap would let the AI loop across multiple tools autonomously — more powerful, but harder to audit and more expensive. The core engineering trade-off with tool calling: more tools = more capability but more ways the agent can call the wrong tool, in the wrong order, or hallucinate about which tool it used. For a production outreach system where every email goes to a real person, predictability matters more than autonomy. A broader tool set (e.g. web search, CRM lookup, calendar check) would require human review gates before send.
            </p>
          </div>
          <div className="content-card arch-card">
            <span className="arch-badge" style={{ background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" }}>Not used: embeddings / RAG</span>
            <h3>Vector search over a knowledge base</h3>
            <p>
              The AI SDK has an <code>embed</code> function and works with Upstash Vector and Pinecone out of the box. Embeddings would let the AI retrieve relevant CoursePilot case studies or past email performance data as context before drafting. This wasn&apos;t added because the LinkedIn enrichment + form data already provides sufficient personalization context for a first-touch email. The right time to add RAG is when you have enough volume to build a meaningful knowledge base — past emails that got replies, meeting outcomes, deal context — and need the AI to reason across that history.
            </p>
          </div>
        </div>
      </section>

      {/* ── Evals ── */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 className="arch-section-heading">Evaluation approach</h2>
        <p className="arch-section-intro">
          Every generated email is scored programmatically before the outreach record is logged. This runs inside the workflow — not as a separate offline job — so the eval result is always attached to the same record as the send result.
        </p>
        <div className="two-column">
          <div className="content-card arch-card">
            <h3>5-dimension rubric</h3>
            <ul style={{ paddingLeft: "1.1rem", lineHeight: 2.1, fontSize: "0.88rem" }}>
              <li><strong>Personalization</strong> — Does the output reference the lead&apos;s company name and primary goal or role?</li>
              <li><strong>Accuracy</strong> — Does the output avoid obvious unsupported factual claims?</li>
              <li><strong>Business value</strong> — Does it connect CoursePilot to a concrete educational outcome?</li>
              <li><strong>Safety</strong> — No sensitive language, private details, or overconfident claims?</li>
              <li><strong>CTA quality</strong> — Is there a clear, specific call to action (meeting request)?</li>
            </ul>
            <p style={{ marginTop: "0.75rem", fontSize: "0.86rem" }}>
              Score = (passed categories × 20) − (hallucination flags × 10), capped 0–100. Overall pass requires ≥ 4/5 categories and zero hallucination flags.
            </p>
          </div>
          <div className="content-card arch-card">
            <h3>Hallucination regression checks</h3>
            <p style={{ marginBottom: "0.65rem" }}>
              A pattern-matching pass scans the combined output for signals the model invented something: revenue claims, hiring/fundraising status, struggling/failing language, or private personal details — none of which were in the input. Any match is surfaced as a flag in the eval result.
            </p>
            <p style={{ marginBottom: "0.65rem" }}>
              Three persona test cases (solo course creator, online school director, EdTech founder) document expected rubric pass criteria and serve as regression tests when the prompt changes.
            </p>
            <p>
              <strong>In a stricter production config</strong>, an eval score below 60 or any hallucination flag would block the send entirely, routing the draft to a human review queue instead.
            </p>
            <p style={{ marginTop: "0.85rem" }}>
              <a href="/evals" style={{ color: "var(--primary)", fontWeight: 600 }}>View the eval rubric and test cases →</a>
            </p>
          </div>
        </div>
      </section>

      {/* ── Production path ── */}
      <section className="content-card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "0.5rem" }}>Production roadmap</h2>
        <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          Move the rate limiter to <strong>Upstash Redis</strong> for cross-region persistence. Add <strong>Clerk</strong> for authenticated human review before send — gating on eval score. Replace the outreach log with <strong>Neon Postgres</strong> for searchable lead history and reply-rate analytics. Add a <strong>CRM webhook</strong> (HubSpot / Salesforce) on workflow completion. Add <strong>RAG</strong> over past high-performing emails using Upstash Vector + the AI SDK <code>embed</code> function. Promote the eval rubric to a CI regression suite that runs on every prompt change, blocking deploys if hallucination flags increase.
        </p>
      </section>
    </main>
  );
}
