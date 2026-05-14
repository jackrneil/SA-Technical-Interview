import { AIResult, CompanyContext, LeadInput, LinkedInProfile } from "@/lib/types";

export function AccountBrief({
  lead,
  linkedinProfile,
  companyContext,
  aiResult,
}: {
  lead: LeadInput;
  linkedinProfile: LinkedInProfile;
  companyContext: CompanyContext;
  aiResult: AIResult;
}) {
  return (
    <div className="card">
      <p className="eyebrow">Internal brief</p>
      <h2>{lead.companyName}</h2>
      <div className="stack">
        <section>
          <h3>Lead summary</h3>
          <p>{aiResult.leadSummary}</p>
        </section>
        <section>
          <h3>Company summary</h3>
          <p>{aiResult.companySummary}</p>
        </section>
        <section>
          <h3>Likely pain points</h3>
          <ul>
            {aiResult.likelyPainPoints.map((painPoint) => (
              <li key={painPoint}>{painPoint}</li>
            ))}
          </ul>
        </section>
        <section>
          <h3>Internal notes</h3>
          <p>{aiResult.internalAccountNotes}</p>
        </section>
        <div className="pill-row">
          <span className="pill">LinkedIn: {linkedinProfile.source}</span>
          <span className="pill">Website: {companyContext.source}</span>
          <span className="pill">Confidence: {aiResult.confidenceScore}/100</span>
        </div>
      </div>
    </div>
  );
}
