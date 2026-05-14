import { AIResult } from "@/lib/types";

export function EmailPreview({ aiResult }: { aiResult: AIResult }) {
  return (
    <div className="content-card">
      <span className="eyebrow-pill">Personalized email</span>
      <h2 style={{ marginTop: "0.85rem", fontSize: "1.3rem", fontWeight: 800 }}>{aiResult.emailSubject}</h2>
      <p className="preview">{aiResult.emailBody}</p>
      <div className="pill-row">
        <span className="pill">CTA: {aiResult.meetingCTA}</span>
      </div>
    </div>
  );
}
