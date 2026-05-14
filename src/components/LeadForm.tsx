"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { LoadingCard } from "@/components/LoadingCard";
import { primaryGoals } from "@/lib/types";

const initialForm = {
  fullName: "Jordan Ellis",
  email: "jordan@northstarlearning.com",
  linkedinUrl: "https://www.linkedin.com/in/jordanellis",
  role: "Director of Online Learning",
  companyName: "Northstar Learning",
  companyWebsite: "https://example.com",
  primaryGoal: "Increase student enrollment",
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
    return <LoadingCard message="Building activation brief" />;
  }

  return (
    <form className="content-card form" onSubmit={onSubmit}>
      <h2 className="section-title" style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>
        Generate an activation brief
      </h2>
      <div className="field">
        <label htmlFor="fullName">Full name</label>
        <input id="fullName" required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="email">Work email</label>
        <input id="email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="linkedinUrl">LinkedIn profile URL</label>
        <input
          id="linkedinUrl"
          type="url"
          required
          value={form.linkedinUrl}
          onChange={(event) => setForm({ ...form, linkedinUrl: event.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="role">Role</label>
        <input id="role" required value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="companyName">Company name</label>
        <input id="companyName" required value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="companyWebsite">Company website</label>
        <input
          id="companyWebsite"
          type="url"
          value={form.companyWebsite}
          onChange={(event) => setForm({ ...form, companyWebsite: event.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="primaryGoal">Primary goal</label>
        <select id="primaryGoal" required value={form.primaryGoal} onChange={(event) => setForm({ ...form, primaryGoal: event.target.value })}>
          {primaryGoals.map((goal) => (
            <option key={goal} value={goal}>
              {goal}
            </option>
          ))}
        </select>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      <button className="btn btn-primary" type="submit">
        Generate brief
      </button>
    </form>
  );
}
