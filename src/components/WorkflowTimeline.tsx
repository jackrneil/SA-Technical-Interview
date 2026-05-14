import { WorkflowStep } from "@/lib/types";

export function WorkflowTimeline({ steps }: { steps: WorkflowStep[] }) {
  return (
    <div className="card">
      <p className="eyebrow">Workflow timeline</p>
      <h2>Agent steps</h2>
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
