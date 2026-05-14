# CoursePilot Activation Agent

CoursePilot Activation Agent is a small AI-powered product that turns an inbound education technology lead into an enriched customer brief, personalized outreach email, meeting CTA, evaluation result, and optional email send.

CoursePilot is a fictional education technology company that helps creators, small schools, and education companies launch online courses, collect student interest, and personalize follow-up messages using AI.

## Problem

Inbound leads usually arrive with limited context. A sales or solutions team still has to research the person, understand the company, write a personalized message, and prepare internal notes before booking a meeting.

This app automates the first pass while keeping a human review step before sending.

## Stack

- Next.js App Router with TypeScript
- Vercel server route handlers
- Vercel Workflow SDK (`workflow`) for the durable outreach pipeline
- Vercel AI SDK through the `ai` package
- Apify LinkedIn profile enrichment
- Resend email sending with mock fallback mode
- Lightweight evaluation rubric and hallucination checks

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The app works without API keys by using fallback profile data, fallback company context, a safe template email, and mock email send mode.

To test AI Gateway locally, pull Vercel environment variables and run the smoke test:

```bash
vc env pull .env.local
node --env-file=.env.local index.mjs
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure the values you want to test.

```bash
AI_MODEL=openai/gpt-5.5
APIFY_TOKEN=
APIFY_LINKEDIN_ACTOR_ID=
RESEND_API_KEY=
FROM_EMAIL=CoursePilot <hello@yourverifieddomain.com>
```

`AI_MODEL` controls the AI Gateway model and defaults to `openai/gpt-5.5`. For local development, `vc env pull .env.local` pulls `VERCEL_OIDC_TOKEN`, so no AI Gateway API key needs to be stored in the project. `APIFY_TOKEN` and `APIFY_LINKEDIN_ACTOR_ID` enable LinkedIn enrichment. `RESEND_API_KEY` and `FROM_EMAIL` enable real email delivery.

## Workflow

1. The landing page collects lead name, email, LinkedIn URL, role, company, company website, and primary goal.
2. `/api/intake` validates input and rejects unsafe URLs.
3. The server calls Apify for LinkedIn enrichment when configured.
4. The server fetches the company homepage when a safe public website URL is provided.
5. The AI SDK generates a structured account brief, personalized email, CTA, confidence score, fallback notes, and missing context questions.
6. A lightweight rubric checks personalization, accuracy, business value, safety, CTA quality, and hallucination flags.
7. `/result` displays the generated output for human review before sending.
8. `/api/send-email` sends through Resend when configured, otherwise returns mock success.

## AI SDK Usage

The AI call lives in `src/lib/ai.ts`. The system prompt positions the model as a CoursePilot Solutions Architect assistant and instructs it not to invent facts. The user prompt sends only selected lead, LinkedIn, and company context and asks for strict JSON output.

For this use case, a lower-cost model is usually enough because the output is structured business communication. For complex enterprise account briefs, the same app could route through AI Gateway to a stronger model or fallback policy.

Cost and latency choices:

- Use structured JSON output to reduce retries.
- Keep prompts short by sending only relevant context.
- Retry once with a shorter prompt if parsing fails.
- Use safe fallback templates when AI generation fails.
- Cache company context in production to reduce repeated enrichment cost.

## Tool Use

Apify is used as a server-only enrichment tool in `src/lib/apify.ts`. The app only enriches a LinkedIn URL submitted by the user and falls back to submitted form data when credentials are missing, the actor fails, or no profile data is returned.

Company website context is fetched in `src/lib/companyContext.ts`. It only accepts public HTTP or HTTPS URLs and blocks localhost and private IP ranges before fetching.

## Fallback Behavior

- If Apify is missing or fails, the app uses submitted full name, role, company, and LinkedIn URL.
- If the company website is unavailable, the company summary uses company name and primary goal.
- If AI generation fails or returns invalid JSON twice, the app returns a safe template email with confidence score 35.
- If Resend is unavailable, the app returns mock sent state and preserves the email preview.
- If confidence is low, the output includes fallback notes and missing context questions.

## Evaluation

The evaluation utilities live in `src/lib/evals`.

The rubric checks:

- Personalization
- Accuracy
- Business value
- Safety
- CTA quality

Hallucination regression checks flag unsupported claims such as hiring, fundraising, migration, private details, or overconfident claims that are not present in the provided context.

The `/evals` page displays the test cases and rubric categories.

## Safety and Privacy

- API keys are read only from server-side environment variables.
- The frontend never calls Apify, Resend, or model providers directly.
- Generated email is shown before sending.
- The app does not persist scraped LinkedIn data in a database.
- Company website fetching validates URLs and blocks localhost or private IP ranges.
- Production rate limiting and audit logging hooks are noted in server routes.

## Outreach Workflow

The lead outreach workflow mirrors the n8n pipeline (Webhook -> Apify -> AI Agent -> Pixel -> Inject Pixel -> Send -> Log) using the Vercel Workflow SDK.

Trigger the workflow with the same flat-key JSON shape the n8n webhook used:

```bash
curl -X POST http://localhost:3000/api/workflow/outreach \
  -H "content-type: application/json" \
  -d '{
    "LinkedIn URL": "https://www.linkedin.com/in/example",
    "First Name": "Alexandra",
    "Last Name": "Scaccia",
    "Title": "Director of Online Learning",
    "Company Name": "UW Health",
    "Business Email": "alex@example.com",
    "Industry": "Education",
    "Captured URL": "https://www.coursepilot.example/"
  }'
```

Node-by-node mapping:

| n8n node | Workflow step | File |
|---|---|---|
| Webhook8 | `POST /api/workflow/outreach` | `src/app/api/workflow/outreach/route.ts` |
| Run an Actor and get dataset7 | `runApifyLinkedInActor` | `src/workflows/lead-outreach.ts` |
| AI Agent Ashley Hotfix2 | `generateOutreachEmail` (Vercel AI SDK) | `src/workflows/lead-outreach.ts` |
| Generate Pixel URL2 | `buildTrackingPixelUrl` | `src/workflows/lead-outreach.ts` |
| Code in JavaScript6 | `injectTrackingPixel` | `src/workflows/lead-outreach.ts` |
| Gmail - Send Personalized Email7 | `sendOutreachEmail` (Resend with mock fallback) | `src/workflows/lead-outreach.ts` |
| Sheets - Log Email Sent4 | `logOutreachRecord` (structured log line) | `src/workflows/lead-outreach.ts` |

The tracking pixel served by `/api/track-open` returns a 1x1 GIF and logs an `outreach-open` event. Inspect runs and steps locally with:

```bash
npx workflow web
# or
npx workflow inspect runs
```

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import it in Vercel as a Next.js project.
3. Add environment variables in Vercel Project Settings.
4. Deploy.

Vercel provides serverless route handlers, environment variable management, preview deployments, logs for workflow debugging, and a natural path to AI Gateway model access.

## Enterprise Implementation Path

For an enterprise customer, this would become a secure customer activation workflow that integrates with CRM, uses approved enrichment sources, centralizes model access through AI Gateway, logs every AI-generated message, requires human approval before sending, and measures conversion impact.

Likely additions:

- Authentication and role-based access
- CRM integration
- Audit logs
- Rate limiting
- Queued background jobs
- Approved data sources
- Persistent lead history
- Analytics on reply and meeting conversion

## Demo Script

CoursePilot is a fictional education technology company that helps creators and schools launch online courses and personalize student follow-up. This app turns a basic inbound lead into a personalized email, internal account brief, and evaluation result.

The workflow collects lead context, calls an external enrichment tool, uses the AI SDK to generate structured outreach, runs a lightweight evaluation check, and gives the human a reviewable email before sending. If Apify, AI, or Resend is not configured, the workflow degrades gracefully instead of failing.
