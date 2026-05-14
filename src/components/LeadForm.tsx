"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { LoadingCard } from "@/components/LoadingCard";
import { primaryGoals } from "@/lib/types";

const initialForm = {
  fullName: "",
  email: "",
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
        throw new Error(payload.error ?? "Something went wrong. Please try again.");
      }

      router.push(`/confirmation?runId=${encodeURIComponent(payload.runId ?? "")}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingCard message="Sending your request" />;
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
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="email">Work email</label>
        <input
          id="email"
          type="email"
          required
          placeholder="jane@yourcompany.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
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
          onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="primaryGoal">What brings you to CoursePilot?</label>
        <select
          id="primaryGoal"
          required
          value={form.primaryGoal}
          onChange={(e) => setForm({ ...form, primaryGoal: e.target.value as typeof form.primaryGoal })}
        >
          {primaryGoals.map((goal) => (
            <option key={goal} value={goal}>
              {goal}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="details">Anything else? (optional)</label>
        <textarea
          id="details"
          rows={3}
          maxLength={2000}
          placeholder="Tell us about your team, students, or what success looks like."
          value={form.details}
          onChange={(e) => setForm({ ...form, details: e.target.value })}
        />
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <button className="btn btn-primary btn-arrow lead-form-submit" type="submit">
        <span>Get started</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      </button>
    </form>
  );
}
