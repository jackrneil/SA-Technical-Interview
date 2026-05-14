import { LeadForm } from "@/components/LeadForm";

export default function IntakePage() {
  return (
    <main>
      <section className="intake-hero">
        <span className="eyebrow-pill">Lead intake</span>
        <h1 className="section-title intake-title">Tell us a little about yourself.</h1>
        <p className="section-sub">
          Drop your LinkedIn and pick what you&apos;re here for. We&apos;ll enrich your profile, draft a personalized email with the Vercel AI SDK,
          and start the durable Workflow SDK pipeline.
        </p>
      </section>
      <section className="intake-form-wrap">
        <LeadForm />
      </section>
    </main>
  );
}
