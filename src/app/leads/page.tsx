import Link from "next/link";
import { getLeads, isDbConfigured } from "@/lib/db";

function statusBadge(sent: boolean, mode: string | null) {
  if (mode === "mock") return <span className="status warning">mock send</span>;
  if (sent) return <span className="status success">sent</span>;
  return <span className="status error">failed</span>;
}

function evalBadge(score: number | null, pass: boolean | null) {
  if (score === null) return null;
  const color = pass ? "success" : "warning";
  return <span className={`status ${color}`}>{score}/100</span>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  if (!isDbConfigured()) {
    return (
      <main>
        <section style={{ marginBottom: "2rem" }}>
          <span className="eyebrow-pill">Lead database</span>
          <h1 className="section-title" style={{ marginTop: "1rem" }}>No database connected</h1>
          <p className="section-sub">
            Add <code>POSTGRES_URL</code> to your environment variables (Vercel → Storage → Create Database → Neon Postgres) to start persisting leads.
          </p>
        </section>
        <div className="content-card" style={{ maxWidth: "600px" }}>
          <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>How to connect</h3>
          <ol style={{ paddingLeft: "1.25rem", lineHeight: 2.2, fontSize: "0.9rem", color: "var(--muted)" }}>
            <li>Go to your Vercel project → <strong>Storage</strong> tab</li>
            <li>Click <strong>Create Database</strong> → choose <strong>Neon Postgres</strong></li>
            <li>Vercel automatically adds <code>POSTGRES_URL</code> (and related vars) to your environment</li>
            <li>Redeploy — leads will start persisting immediately</li>
          </ol>
        </div>
      </main>
    );
  }

  const leads = await getLeads(100);

  return (
    <main>
      <section style={{ marginBottom: "2rem" }}>
        <span className="eyebrow-pill">Lead database</span>
        <h1 className="section-title" style={{ marginTop: "1rem" }}>
          All captured leads
        </h1>
        <p className="section-sub">
          Every submission that completes the workflow is stored here — including enrichment data, email outcome, eval score, and AI-generated fit summary.
        </p>
      </section>

      {leads.length === 0 ? (
        <div className="content-card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>No leads yet. Submit the intake form to generate the first one.</p>
          <Link href="/intake" className="btn btn-primary">Go to intake →</Link>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "1rem", fontSize: "0.88rem", color: "var(--muted)" }}>
            {leads.length} lead{leads.length !== 1 ? "s" : ""} stored
          </div>

          <div className="leads-table-wrap">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Purpose</th>
                  <th>Email</th>
                  <th>Eval</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text)" }}>
                        {[lead.first_name, lead.last_name].filter(Boolean).join(" ") || "—"}
                      </div>
                      {lead.email && (
                        <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{lead.email}</div>
                      )}
                    </td>
                    <td>
                      <div>{lead.company_name || "—"}</div>
                      {lead.industry && (
                        <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{lead.industry}</div>
                      )}
                    </td>
                    <td style={{ color: "var(--muted)", fontSize: "0.88rem" }}>{lead.job_title || "—"}</td>
                    <td style={{ fontSize: "0.84rem" }}>
                      {lead.purpose ? (
                        <span className="pill" style={{ fontSize: "0.75rem" }}>{lead.purpose}</span>
                      ) : "—"}
                    </td>
                    <td>{statusBadge(lead.email_sent, lead.email_mode)}</td>
                    <td>{evalBadge(lead.eval_score, lead.eval_pass)}</td>
                    <td style={{ fontSize: "0.82rem", color: "var(--muted)", whiteSpace: "nowrap" }}>
                      {formatDate(lead.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail cards for leads with fit summaries */}
          {leads.filter((l) => l.fit_summary).length > 0 && (
            <section style={{ marginTop: "2.5rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "1rem" }}>AI fit summaries</h2>
              <div className="grid-3">
                {leads
                  .filter((l) => l.fit_summary)
                  .slice(0, 6)
                  .map((lead) => (
                    <div className="content-card" key={lead.id}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <strong style={{ fontSize: "0.95rem" }}>
                          {[lead.first_name, lead.last_name].filter(Boolean).join(" ") || "Lead"}
                        </strong>
                        {evalBadge(lead.eval_score, lead.eval_pass)}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.65rem" }}>
                        {lead.job_title && lead.company_name ? `${lead.job_title} at ${lead.company_name}` : lead.company_name || ""}
                      </div>
                      <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "#374151" }}>{lead.fit_summary}</p>
                      {lead.hallucination_flags && lead.hallucination_flags.length > 0 && (
                        <div style={{ marginTop: "0.65rem" }}>
                          {lead.hallucination_flags.map((flag) => (
                            <div key={flag} style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: "0.2rem" }}>⚠ {flag}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
