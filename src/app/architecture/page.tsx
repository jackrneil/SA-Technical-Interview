import { ArchitecturePanel } from "@/components/ArchitecturePanel";

export default function ArchitecturePage() {
  return (
    <main>
      <section className="card hero">
        <p className="eyebrow">Vercel architecture</p>
        <h1>Frontend, server routes, tools, AI, and review in one deployable app.</h1>
        <p className="lead">
          CoursePilot demonstrates how a Solutions Architect can connect an intake experience, backend orchestration, third-party enrichment,
          structured AI generation, safety controls, and business outcomes on Vercel.
        </p>
      </section>
      <section className="section">
        <ArchitecturePanel />
      </section>
      <section className="card section">
        <h2>Enterprise path</h2>
        <p>
          In production this workflow would add authentication, role-based access, CRM integration, audit logs, rate limiting, queued background jobs,
          approved data sources, persistent lead history, and analytics on reply and meeting conversion.
        </p>
      </section>
    </main>
  );
}
