export function ArchitecturePanel() {
  const items = [
    ["Frontend on Next.js", "App Router pages collect leads, show generated results, and keep human review before sending."],
    ["Server routes on Vercel", "Route handlers orchestrate validation, enrichment, AI generation, evaluation, and email sending."],
    ["AI SDK and Gateway", "The AI SDK centralizes structured generation and can route through AI Gateway with model policy controls."],
    ["Apify tool call", "A server-only LinkedIn enrichment step uses submitted profile URLs and falls back safely."],
    ["Resend email send", "Email delivery runs only on the server, with mock mode when credentials are absent."],
    ["Fallback behavior", "Every external dependency degrades to submitted data or safe templates so the demo stays usable."],
    ["Production roadmap", "Add auth, CRM sync, queues, rate limits, audit logs, analytics, and human approval workflows."],
  ];

  return (
    <div className="grid-3">
      {items.map(([title, body]) => (
        <div className="content-card" key={title}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.45rem" }}>{title}</h3>
          <p>{body}</p>
        </div>
      ))}
    </div>
  );
}
