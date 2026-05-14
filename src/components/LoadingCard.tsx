export function LoadingCard({ message }: { message: string }) {
  return (
    <div className="card">
      <p className="eyebrow">Working</p>
      <h2>{message}</h2>
      <p>The agent is validating the lead, calling tools when configured, generating a draft, and running the evaluation rubric.</p>
    </div>
  );
}
