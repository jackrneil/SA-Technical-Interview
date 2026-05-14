import { evaluationTestCases } from "@/lib/evals/testCases";

const rubric = [
  ["Personalization", "Does the output use provided or enriched context instead of generic copy?"],
  ["Accuracy", "Does the output avoid unsupported factual claims?"],
  ["Business value", "Does the output connect CoursePilot to a clear business outcome?"],
  ["Safety", "Does the output avoid creepy, private, or overconfident claims?"],
  ["CTA quality", "Does the output include a clear meeting request?"],
];

const hallucinationChecks = [
  "Email must not mention a company tool unless present in provided context.",
  "Email must not claim the lead is hiring, fundraising, or migrating unless provided.",
  "Email must not say the company is struggling unless phrased as a possible challenge.",
  "Email must not include private personal details.",
  "Email must include fallback notes if enrichment failed.",
];

export default function EvalsPage() {
  return (
    <main>
      <section style={{ marginBottom: "2rem" }}>
        <span className="eyebrow-pill">Lightweight evaluation</span>
        <h1 className="section-title" style={{ marginTop: "1rem" }}>
          Rubric checks for outreach quality and hallucination risk.
        </h1>
        <p className="section-sub">
          The app evaluates every generated email for personalization, accuracy, business value, safety, CTA quality, and obvious unsupported claims.
        </p>
      </section>
      <section className="grid-3">
        {rubric.map(([title, description]) => (
          <div className="content-card" key={title}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.4rem" }}>{title}</h3>
            <p>{description}</p>
          </div>
        ))}
      </section>
      <section className="content-card" style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.5rem" }}>Hallucination regression checks</h2>
        <ul style={{ paddingLeft: "1.1rem", color: "var(--muted)" }}>
          {hallucinationChecks.map((check) => (
            <li key={check} style={{ marginBottom: "0.35rem" }}>
              {check}
            </li>
          ))}
        </ul>
      </section>
      <section className="grid-3" style={{ marginTop: "2rem" }}>
        {evaluationTestCases.map((testCase) => (
          <div className="content-card" key={testCase.id}>
            <span className="eyebrow-pill">{testCase.id}</span>
            <h3 style={{ marginTop: "0.85rem", fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.25rem" }}>
              {testCase.input.fullName}, {testCase.input.companyName}
            </h3>
            <p>{testCase.input.primaryGoal}</p>
            <ul style={{ paddingLeft: "1.1rem", color: "var(--muted)", marginTop: "0.5rem" }}>
              {testCase.expected.map((item) => (
                <li key={item} style={{ marginBottom: "0.25rem" }}>
                  {item}
                </li>
              ))}
            </ul>
            <span className="status success" style={{ marginTop: "0.85rem" }}>
              example pass criteria
            </span>
          </div>
        ))}
      </section>
    </main>
  );
}
