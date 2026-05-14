import { ArchitecturePanel } from "@/components/ArchitecturePanel";

export default function ArchitecturePage() {
  return (
    <main>
      <section style={{ marginBottom: "2rem" }}>
        <span className="eyebrow-pill">Vercel architecture</span>
        <h1 className="section-title" style={{ marginTop: "1rem" }}>
          Frontend, server routes, tools, AI, and review in one deployable app.
        </h1>
        <p className="section-sub">
          CoursePilot demonstrates how a Solutions Architect can connect an intake experience, backend orchestration, third-party enrichment,
          structured AI generation, safety controls, and business outcomes on Vercel.
        </p>
      </section>
      <ArchitecturePanel />
      <section className="content-card" style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.5rem" }}>Enterprise path</h2>
        <p>
          In production this workflow would add authentication, role-based access, CRM integration, audit logs, rate limiting, queued background jobs,
          approved data sources, persistent lead history, and analytics on reply and meeting conversion.
        </p>
      </section>
    </main>
  );
}
