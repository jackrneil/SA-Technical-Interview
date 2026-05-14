import { AIResult } from "@/lib/types";

export function EmailPreview({ aiResult }: { aiResult: AIResult }) {
  return (
    <div className="card">
      <p className="eyebrow">Personalized email</p>
      <h2>{aiResult.emailSubject}</h2>
      <p className="preview">{aiResult.emailBody}</p>
      <div className="pill-row">
        <span className="pill">CTA: {aiResult.meetingCTA}</span>
      </div>
    </div>
  );
}
