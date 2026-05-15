import { sql } from "@vercel/postgres";

// ─── Schema ────────────────────────────────────────────────────────────────────
// CREATE TABLE is run automatically on first use. Safe to call repeatedly
// (IF NOT EXISTS). In production this would be a versioned migration.

export async function ensureLeadsTable(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      -- Contact info from form + enrichment
      first_name      TEXT,
      last_name       TEXT,
      email           TEXT,
      linkedin_url    TEXT,
      company_name    TEXT,
      job_title       TEXT,
      industry        TEXT,
      company_size    TEXT,
      location        TEXT,

      -- What they told us
      purpose         TEXT,
      details         TEXT,

      -- Workflow outcome
      email_subject   TEXT,
      email_sent      BOOLEAN NOT NULL DEFAULT FALSE,
      email_mode      TEXT,   -- 'real' | 'mock'
      image_url       TEXT,
      enrichment_source TEXT, -- 'apify' | 'fallback'

      -- Eval
      eval_score      INTEGER,
      eval_pass       BOOLEAN,
      hallucination_flags TEXT[],

      -- AI-generated metadata
      fit_summary     TEXT,
      possibilities   JSONB,

      -- Internal
      workflow_run_id TEXT
    )
  `;
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface LeadRow {
  id: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  linkedin_url: string | null;
  company_name: string | null;
  job_title: string | null;
  industry: string | null;
  company_size: string | null;
  location: string | null;
  purpose: string | null;
  details: string | null;
  email_subject: string | null;
  email_sent: boolean;
  email_mode: string | null;
  image_url: string | null;
  enrichment_source: string | null;
  eval_score: number | null;
  eval_pass: boolean | null;
  hallucination_flags: string[] | null;
  fit_summary: string | null;
  possibilities: Array<{ title: string; body: string }> | null;
  workflow_run_id: string | null;
}

export interface InsertLeadInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  linkedinUrl?: string;
  companyName?: string;
  jobTitle?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  purpose?: string;
  details?: string;
  emailSubject?: string;
  emailSent: boolean;
  emailMode?: string;
  imageUrl?: string | null;
  enrichmentSource?: string;
  evalScore?: number;
  evalPass?: boolean;
  hallucinationFlags?: string[];
  fitSummary?: string;
  possibilities?: Array<{ title: string; body: string }>;
  workflowRunId?: string;
}

// ─── Write ─────────────────────────────────────────────────────────────────────

export async function insertLead(input: InsertLeadInput): Promise<string> {
  await ensureLeadsTable();

  const result = await sql<{ id: string }>`
    INSERT INTO leads (
      first_name, last_name, email, linkedin_url,
      company_name, job_title, industry, company_size, location,
      purpose, details,
      email_subject, email_sent, email_mode, image_url, enrichment_source,
      eval_score, eval_pass, hallucination_flags,
      fit_summary, possibilities,
      workflow_run_id
    ) VALUES (
      ${input.firstName ?? null},
      ${input.lastName ?? null},
      ${input.email ?? null},
      ${input.linkedinUrl ?? null},
      ${input.companyName ?? null},
      ${input.jobTitle ?? null},
      ${input.industry ?? null},
      ${input.companySize ?? null},
      ${input.location ?? null},
      ${input.purpose ?? null},
      ${input.details ?? null},
      ${input.emailSubject ?? null},
      ${input.emailSent},
      ${input.emailMode ?? null},
      ${input.imageUrl ?? null},
      ${input.enrichmentSource ?? null},
      ${input.evalScore ?? null},
      ${input.evalPass ?? null},
      ${input.hallucinationFlags ? JSON.stringify(input.hallucinationFlags) : null},
      ${input.fitSummary ?? null},
      ${input.possibilities ? JSON.stringify(input.possibilities) : null},
      ${input.workflowRunId ?? null}
    )
    RETURNING id
  `;

  return result.rows[0].id;
}

// ─── Read ──────────────────────────────────────────────────────────────────────

export async function getLeads(limit = 50): Promise<LeadRow[]> {
  await ensureLeadsTable();

  const result = await sql<LeadRow>`
    SELECT * FROM leads
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

  return result.rows;
}

export async function getLeadById(id: string): Promise<LeadRow | null> {
  await ensureLeadsTable();

  const result = await sql<LeadRow>`
    SELECT * FROM leads WHERE id = ${id} LIMIT 1
  `;

  return result.rows[0] ?? null;
}

// ─── Check if DB is configured ─────────────────────────────────────────────────
// Returns false if POSTGRES_URL is not set so callers can degrade gracefully.

export function isDbConfigured(): boolean {
  return !!process.env.POSTGRES_URL;
}
