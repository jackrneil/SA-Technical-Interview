import { LeadForm } from "@/components/LeadForm";

export default function IntakePage() {
  return (
    <main>
      <section className="intake-hero">
        <span className="eyebrow-pill">Lead intake</span>
        <h1 className="section-title intake-title">Tell us a little about yourself.</h1>
        <p className="section-sub">
          Drop your info below and Alex from CoursePilot will be in touch.
        </p>
      </section>
      <section className="intake-form-wrap">
        <LeadForm />
      </section>
    </main>
  );
}
