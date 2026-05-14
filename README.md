# CoursePilot Activation Agent

A full-stack AI activation pipeline built on Vercel. When a potential customer submits an intake form, the system automatically enriches their LinkedIn profile, generates a personalized outreach email using the Vercel AI SDK, produces a 1:1 AI-generated image placing them in a custom scene, and delivers everything via a durable background workflow — all without blocking the user.

**Live demo:** [coursepilot-kappa.vercel.app](https://coursepilot-kappa.vercel.app)

---

## What it does

1. **Intake form** at `/intake` — collects name, email, LinkedIn URL, purpose, and optional details
2. **Instant confirmation** — user is redirected immediately; the pipeline runs fully in the background
3. **LinkedIn enrichment** — Apify scrapes job title, company, location, and university
4. **Personalized image generation** — `xai/grok-imagine-image` places the lead in a kindergarten classroom: wearing their company's t-shirt, window showing their city's landmark, classroom decorated with their university colors
5. **AI outreach email** — Vercel AI SDK writes a 6-paragraph HTML email tailored to the lead's role, company, purpose, and details
6. **Email delivery** — sent via Gmail SMTP with open-tracking pixel injection
7. **Structured logging** — every run is logged with enrichment source, token usage, send status, and run ID

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Deployment | Vercel |
| Background jobs | Vercel Workflow SDK — durable, step-based pipeline |
| AI text generation | Vercel AI SDK (`ai`) via AI Gateway → `openai/gpt-5.5` |
| AI image generation | Vercel AI SDK (`experimental_generateImage`) via AI Gateway → `xai/grok-imagine-image` |
| LinkedIn enrichment | Apify LinkedIn Profile Scraper |
| Email delivery | Gmail SMTP via Nodemailer |
| Email tracking | Custom 1×1 pixel endpoint (`/api/track-open`) |

---

## Architecture

```
User submits form
      │
      ▼
POST /api/intake
  ├── Validates input
  └── Calls workflow/api start() ──► Returns { ok: true, runId } immediately
                                            │
                          ┌─────────────────▼──────────────────┐
                          │     Vercel Workflow (background)    │
                          │                                     │
                          │  Step 1 │ LinkedIn enrichment       │
                          │         │ (Apify or form fallback)  │
                          │         ▼                           │
                          │  Step 2 │ AI image generation       │
                          │         │ (xai/grok-imagine-image)  │
                          │         ▼                           │
                          │  Step 3 │ AI email draft            │
                          │         │ (openai/gpt-5.5)          │
                          │         ▼                           │
                          │  Step 4 │ Build tracking pixel URL  │
                          │         ▼                           │
                          │  Step 5 │ Wrap in HTML template     │
                          │         │ + embed image + pixel     │
                          │         ▼                           │
                          │  Step 6 │ Send via Gmail SMTP       │
                          │         ▼                           │
                          │  Step 7 │ Structured log record     │
                          └─────────────────────────────────────┘
```

The Workflow SDK makes each step durable — if any step fails mid-run, the workflow resumes from the last completed step rather than restarting from scratch.

---

## Key technical decisions

**Why the Workflow SDK?**
LinkedIn enrichment + image generation + email sending can collectively take 30–90 seconds. Blocking the HTTP response for that long is a bad user experience and risks timeout errors. The Workflow SDK runs the pipeline as a durable background job, returns a run ID to the client instantly, and handles retries at the step level automatically.

**Why AI Gateway?**
Centralizes model access behind a single endpoint. Swapping `openai/gpt-5.5` for a different model — or adding a fallback policy — requires only an env var change, not a code change. Also provides unified token usage logging across both text and image generation steps.

**Graceful degradation**
Every external dependency has a fallback:
- No Apify token → uses submitted form data directly
- Image generation fails → email sends without the image
- AI generation fails → uses a structured template email
- Email send fails → logs the draft and continues

---

## Local setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app runs end-to-end with no credentials — Apify falls back to form data, AI generation uses your gateway key or mocks, and email send logs in mock mode.

### Environment variables

Copy `.env.example` to `.env` and fill in what you want to test:

```bash
# AI Gateway (required for real AI calls)
AI_GATEWAY_API_KEY=          # or pull VERCEL_OIDC_TOKEN via `vc env pull .env.local`
AI_MODEL=openai/gpt-5.5

# LinkedIn enrichment (optional — falls back to form data)
APIFY_TOKEN=
APIFY_LINKEDIN_ACTOR_ID=

# Email delivery (optional — falls back to mock mode)
GMAIL_USER=you@gmail.com
GMAIL_APP_PASSWORD=          # from myaccount.google.com/apppasswords

# Workflow customization
OUTREACH_CALENDLY_URL=https://calendly.com/course-pilot/30min
```

### AI Gateway smoke test

```bash
npm run smoke
```

Streams a response through `openai/gpt-5.5` via AI Gateway and logs token usage and finish reason — mirrors the [official quickstart](https://vercel.com/docs/ai-gateway/getting-started/text-generation).

---

## Deploy to Vercel

```bash
# 1. Push to GitHub
git push origin main

# 2. Import in Vercel — it detects Next.js automatically

# 3. Add environment variables in Project Settings

# 4. Deploy
```

Vercel auto-configures the Workflow SDK endpoints (`/.well-known/workflow/v1/*`) at build time via the `withWorkflow` wrapper in `next.config.ts`. No additional infrastructure setup required.

---

## Outreach email

The AI is prompted to write as a sharp, direct operator — not a marketer. It receives the lead's name, title, company, LinkedIn activity, stated purpose, and freeform details, and produces:

- A subject line specific to their role and goal
- 6 paragraphs: greeting → personal hook → problem → solution → outcome → CTA
- HTML with `<strong>` and `<em>` for emphasis, Calendly CTA linked as "Book time here"
- 130–180 words, no sign-off (handled by the branded template)

The generated body is wrapped in a branded HTML email template with a CoursePilot header, the AI-generated personalized image, and a consistent footer — keeping presentation separate from generation logic.

---

## Repo structure

```
src/
├── app/
│   ├── page.tsx              # Marketing landing page
│   ├── intake/               # Lead intake form
│   ├── confirmation/         # Post-submission confirmation
│   └── api/
│       ├── intake/           # Form handler → starts workflow
│       ├── workflow/outreach/ # Webhook trigger (alternative entry point)
│       └── track-open/       # Email open tracking pixel
├── workflows/
│   ├── lead-outreach.ts      # 7-step durable pipeline
│   └── types.ts              # Workflow-specific types
├── components/
│   └── LeadForm.tsx          # Controlled form with loading state
└── lib/
    ├── ai.ts                 # AI SDK text generation
    ├── apify.ts              # LinkedIn enrichment
    ├── validation.ts         # Input validation
    └── types.ts              # Shared types
```
