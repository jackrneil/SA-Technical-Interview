import { LeadForm } from "@/components/LeadForm";

export default function Home() {
  const workflow = ["Validate intake", "Enrich lead", "Fetch company context", "Generate AI brief", "Evaluate draft", "Review and send"];

  return (
    <main>
      <div className="hero-grid">
        <section className="card hero">
          <p className="eyebrow">AI Cloud take-home</p>
          <h1>Turn education leads into reviewable activation outreach.</h1>
          <p className="lead">
            CoursePilot helps creators, small schools, and education companies launch online courses, capture student interest, and personalize
            follow-up with an AI-assisted workflow.
          </p>
          <p>
            Inbound leads often arrive with limited context. This agent handles the first pass: it validates the intake, enriches the submitted
            LinkedIn URL when configured, summarizes company context, drafts a personalized email, and runs a lightweight evaluation before any email
            is sent.
          </p>
          <div className="pill-row">
            <span className="pill">Vercel AI SDK</span>
            <span className="pill">Apify tool call</span>
            <span className="pill">Resend or mock send</span>
            <span className="pill">Human review</span>
          </div>
        </section>
        <LeadForm />
      </div>
      <section className="section">
        <div className="grid-3">
          {workflow.map((step) => (
            <div className="card" key={step}>
              <h3>{step}</h3>
              <p>Designed to degrade gracefully so missing third-party credentials never break the demo path.</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
