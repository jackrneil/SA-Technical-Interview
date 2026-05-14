export function LoadingCard({ message }: { message: string }) {
  return (
    <div className="content-card">
      <span className="eyebrow-pill">Working</span>
      <h2 style={{ marginTop: "0.85rem", fontSize: "1.3rem", fontWeight: 800 }}>{message}</h2>
      <p>The agent is validating the lead, calling tools when configured, generating a draft, and running the evaluation rubric.</p>
    </div>
  );
}
