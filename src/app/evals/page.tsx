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
      <section className="card hero">
        <p className="eyebrow">Lightweight evaluation</p>
        <h1>Rubric checks for outreach quality and hallucination risk.</h1>
        <p className="lead">
          The app evaluates every generated email for personalization, accuracy, business value, safety, CTA quality, and obvious unsupported claims.
        </p>
      </section>
      <section className="section grid-3">
        {rubric.map(([title, description]) => (
          <div className="card" key={title}>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        ))}
      </section>
      <section className="card section">
        <h2>Hallucination regression checks</h2>
        <ul>
          {hallucinationChecks.map((check) => (
            <li key={check}>{check}</li>
          ))}
        </ul>
      </section>
      <section className="section grid-3">
        {evaluationTestCases.map((testCase) => (
          <div className="card" key={testCase.id}>
            <p className="eyebrow">{testCase.id}</p>
            <h3>
              {testCase.input.fullName}, {testCase.input.companyName}
            </h3>
            <p>{testCase.input.primaryGoal}</p>
            <ul>
              {testCase.expected.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <span className="status success">example pass criteria</span>
          </div>
        ))}
      </section>
    </main>
  );
}
