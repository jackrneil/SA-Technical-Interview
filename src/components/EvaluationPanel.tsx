import { EvaluationResult } from "@/lib/types";

const categories: Array<keyof Pick<EvaluationResult, "personalization" | "accuracy" | "businessValue" | "safety" | "ctaQuality">> = [
  "personalization",
  "accuracy",
  "businessValue",
  "safety",
  "ctaQuality",
];

export function EvaluationPanel({ evaluation }: { evaluation: EvaluationResult }) {
  return (
    <div className="content-card">
      <span className="eyebrow-pill">Evaluation result</span>
      <div className="score" style={{ marginTop: "0.6rem" }}>{evaluation.score}/100</div>
      <p>{evaluation.overallPass ? "Pass: ready for human review." : "Review suggested before sending."}</p>
      <div className="stack">
        {categories.map((category) => {
          const result = evaluation[category];
          return (
            <div key={category}>
              <span className={`status ${result.pass ? "success" : "warning"}`}>{result.pass ? "pass" : "review"}</span>
              <h3>{category.replace(/([A-Z])/g, " $1")}</h3>
              <p>{result.notes}</p>
            </div>
          );
        })}
        <section>
          <h3>Hallucination flags</h3>
          {evaluation.hallucinationFlags.length > 0 ? (
            <ul>
              {evaluation.hallucinationFlags.map((flag) => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
          ) : (
            <p>No hallucination regression flags were detected.</p>
          )}
        </section>
      </div>
    </div>
  );
}
