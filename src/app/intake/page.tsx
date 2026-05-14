import { LeadForm } from "@/components/LeadForm";

export default function IntakePage() {
  return (
    <main>
      <section style={{ maxWidth: "720px", margin: "0 auto 2rem" }}>
        <span className="eyebrow-pill">Lead intake</span>
        <h1 className="section-title" style={{ marginTop: "1rem" }}>
          Turn an inbound lead into a personalized brief.
        </h1>
        <p className="section-sub">
          Submit a lead and the agent will validate input, enrich the LinkedIn URL when configured, fetch public company context, draft outreach with
          the Vercel AI SDK, and run a lightweight evaluation rubric.
        </p>
      </section>
      <section style={{ maxWidth: "720px", margin: "0 auto" }}>
        <LeadForm />
      </section>
    </main>
  );
}
