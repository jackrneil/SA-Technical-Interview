"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { LoadingCard } from "@/components/LoadingCard";
import { primaryGoals } from "@/lib/types";

const initialForm = {
  fullName: "",
  linkedinUrl: "",
  primaryGoal: primaryGoals[0] as (typeof primaryGoals)[number],
  details: "",
};

export function LeadForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to process lead.");
      }

      sessionStorage.setItem("coursepilot:lastResult", JSON.stringify(payload));
      router.push("/result");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to process lead.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingCard message="Enriching profile and starting the workflow" />;
  }

  return (
    <form className="content-card form lead-form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="fullName">Your name</label>
        <input
          id="fullName"
          required
          placeholder="Jane Doe"
          value={form.fullName}
          onChange={(event) => setForm({ ...form, fullName: event.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="linkedinUrl">LinkedIn profile URL</label>
        <input
          id="linkedinUrl"
          type="url"
          required
          placeholder="https://www.linkedin.com/in/yourhandle"
          value={form.linkedinUrl}
          onChange={(event) => setForm({ ...form, linkedinUrl: event.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="primaryGoal">What brings you to CoursePilot?</label>
        <select
          id="primaryGoal"
          required
          value={form.primaryGoal}
          onChange={(event) => setForm({ ...form, primaryGoal: event.target.value as typeof form.primaryGoal })}
        >
          {primaryGoals.map((goal) => (
            <option key={goal} value={goal}>
              {goal}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="details">Anything else we should know? (optional)</label>
        <textarea
          id="details"
          rows={4}
          maxLength={2000}
          placeholder="Tell us a bit about your team, students, or what success looks like."
          value={form.details}
          onChange={(event) => setForm({ ...form, details: event.target.value })}
        />
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <button className="btn btn-primary btn-arrow lead-form-submit" type="submit">
        <span>Start the workflow</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      </button>
      <p className="lead-form-hint">
        We enrich your LinkedIn profile via Apify, draft a personalized outreach email with the Vercel AI SDK, and run the durable Workflow SDK
        pipeline.
      </p>
    </form>
  );
}
