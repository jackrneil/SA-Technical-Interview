import { runRubric } from "@/lib/evals/rubric";
import { AIResult, EvaluationResult, LeadInput, WorkflowStep } from "@/lib/types";

export function evaluateAIResult(lead: LeadInput, aiResult: AIResult): { evaluation: EvaluationResult; step: WorkflowStep } {
  const evaluation = runRubric(lead, aiResult);

  return {
    evaluation,
    step: {
      name: "Evaluation check",
      status: evaluation.overallPass ? "success" : "warning",
      details: `Rubric score ${evaluation.score}/100 with ${evaluation.hallucinationFlags.length} hallucination flag(s).`,
    },
  };
}
