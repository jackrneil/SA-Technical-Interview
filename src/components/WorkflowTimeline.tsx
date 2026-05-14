import { WorkflowStep } from "@/lib/types";

export function WorkflowTimeline({ steps }: { steps: WorkflowStep[] }) {
  return (
    <div className="content-card">
      <span className="eyebrow-pill">Workflow timeline</span>
      <h2 style={{ marginTop: "0.85rem", fontSize: "1.3rem", fontWeight: 800 }}>Agent steps</h2>
      <div className="timeline">
        {steps.map((step) => (
          <div className="timeline-item" key={`${step.name}-${step.details}`}>
            <span className={`status ${step.status}`}>{step.status}</span>
            <h3>{step.name}</h3>
            <p>{step.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
