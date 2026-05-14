import Image from "next/image";
import Link from "next/link";

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function Play() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function IconBook() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14" />
      <path d="M6 17h12" />
      <path d="M8 7h8M8 11h8" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 4 4 5-7" />
    </svg>
  );
}

function IconLayers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m12 2 9 5-9 5-9-5 9-5z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
    </svg>
  );
}

function IconWand() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m15 4 5 5L9 20l-5-5L15 4z" />
      <path d="m13 6 5 5" />
      <path d="M3 9h.01M9 3h.01M21 15h.01M18 21h.01" />
    </svg>
  );
}

function IconRocket() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

const trustLogos = [
  { name: "Coursera", slug: "coursera", color: "0056D2" },
  { name: "Udemy", slug: "udemy", color: "A435F0" },
  { name: "Khan Academy", slug: "khanacademy", color: "14BF96" },
  { name: "Duolingo", slug: "duolingo", color: "58CC02" },
  { name: "edX", slug: "edx", color: "02262B" },
  { name: "Udacity", slug: "udacity", color: "02B3E4" },
  { name: "Skillshare", slug: "skillshare", color: "002333" },
];

// Each polyline keyframe is 9 y-values spaced across x=0..240.
// SMIL animates between them for a slow, alive feel.
const enrollmentKeyframes = [
  "0,55 30,48 60,42 90,36 120,30 150,24 180,18 210,12 240,8",
  "0,58 30,52 60,46 90,38 120,32 150,26 180,20 210,15 240,10",
  "0,52 30,44 60,40 90,34 120,28 150,22 180,16 210,11 240,7",
  "0,56 30,49 60,43 90,37 120,31 150,25 180,19 210,13 240,9",
  "0,55 30,48 60,42 90,36 120,30 150,24 180,18 210,12 240,8",
].join(";");

const completionKeyframes = [
  "0,60 30,55 60,52 90,48 120,42 150,38 180,32 210,28 240,22",
  "0,62 30,57 60,53 90,49 120,44 150,40 180,35 210,30 240,24",
  "0,58 30,52 60,50 90,46 120,40 150,36 180,30 210,26 240,20",
  "0,61 30,56 60,52 90,47 120,43 150,39 180,33 210,29 240,23",
  "0,60 30,55 60,52 90,48 120,42 150,38 180,32 210,28 240,22",
].join(";");

function DashboardMock() {
  const sidebar = [
    { label: "Home", active: true },
    { label: "Courses" },
    { label: "Students" },
    { label: "Engagement" },
    { label: "Analytics" },
    { label: "Outreach" },
    { label: "Automation" },
    { label: "Settings" },
  ];

  const stats = [
    { label: "Total Students", value: "12,842", delta: "+18.4% vs last month" },
    { label: "Active Courses", value: "24", delta: "+3 new this week" },
    { label: "Completion Rate", value: "68%", delta: "+7.2% vs last month" },
    { label: "Revenue", value: "$124,560", delta: "+21.3% vs last month" },
  ];

  const funnel = [
    { label: "Visitors", value: "28,450", width: "100%" },
    { label: "Sign-ups", value: "8,820", width: "62%" },
    { label: "Enrollments", value: "3,720", width: "34%" },
  ];

  return (
    <div className="dashboard-card" aria-hidden>
      <div className="dashboard-topbar">
        <div className="dashboard-topbar-left">
          <Image src="/logo-icon.png" alt="" width={903} height={903} className="dashboard-brand-icon" aria-hidden />
          <span>CoursePilot</span>
        </div>
        <div className="dashboard-search">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          Search anything...
        </div>
        <div className="dashboard-topbar-right">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10 21a2 2 0 0 0 4 0" />
          </svg>
          <span className="dashboard-avatar" />
        </div>
      </div>
      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          {sidebar.map((item) => (
            <div className={`item${item.active ? " active" : ""}`} key={item.label}>
              <span className="dot" />
              {item.label}
            </div>
          ))}
          <div className="plan-card">
            <strong>Creator Plan</strong>
            <div className="muted" style={{ fontSize: "0.65rem", marginTop: "0.2rem" }}>
              Pro
            </div>
            <div style={{ color: "var(--primary)", fontWeight: 600, fontSize: "0.65rem", marginTop: "0.25rem" }}>View Plan</div>
          </div>
        </aside>
        <div className="dashboard-main">
          <div className="welcome-banner">
            <div>
              <h4>Welcome back, Alex</h4>
              <p>Here&apos;s what&apos;s happening with your school.</p>
            </div>
            <span className="live-pill">
              <span className="live-dot" /> Live
            </span>
          </div>
          <div className="stats-grid">
            {stats.map((stat) => (
              <div className="stat-card" key={stat.label}>
                <div className="label">{stat.label}</div>
                <div className="value">{stat.value}</div>
                <div className="delta">{stat.delta}</div>
              </div>
            ))}
          </div>
          <div className="dashboard-two-col">
            <div className="dashboard-panel">
              <h5>Performance Overview</h5>
              <div className="legend">
                <span className="swatch blue">Enrollments</span>
                <span className="swatch green">Completions</span>
              </div>
              <svg className="chart-svg" viewBox="0 0 240 64" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="enrollFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#2563eb" stopOpacity="0.25" />
                    <stop offset="1" stopColor="#2563eb" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points="0,55 30,48 60,42 90,36 120,30 150,24 180,18 210,12 240,8">
                  <animate attributeName="points" values={enrollmentKeyframes} dur="8s" repeatCount="indefinite" />
                </polyline>
                <polyline fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points="0,60 30,55 60,52 90,48 120,42 150,38 180,32 210,28 240,22">
                  <animate attributeName="points" values={completionKeyframes} dur="9s" repeatCount="indefinite" />
                </polyline>
                <circle r="2.4" fill="#2563eb">
                  <animateMotion dur="8s" repeatCount="indefinite" rotate="auto" path="M0,55 L30,48 L60,42 L90,36 L120,30 L150,24 L180,18 L210,12 L240,8" />
                </circle>
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                <span>Apr 16</span>
                <span>Apr 23</span>
                <span>Apr 30</span>
                <span>May 7</span>
                <span>May 14</span>
              </div>
            </div>
            <div className="dashboard-panel">
              <h5>AI Follow-up Assistant</h5>
              <div className="assistant-row">
                <strong>Re-engage inactive students</strong>
                <div>342 students haven&apos;t logged in for 7+ days.</div>
                <span className="btn-mini">Send AI Follow-up</span>
              </div>
              <div className="assistant-row">
                <strong>Course completion nudges</strong>
                <div>188 students are close to completing.</div>
                <span className="btn-mini">Send Nudges</span>
              </div>
            </div>
          </div>
          <div className="dashboard-two-col">
            <div className="dashboard-panel">
              <h5>Recent Courses</h5>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                <div style={{ background: "var(--surface)", borderRadius: "6px", padding: "0.4rem", fontSize: "0.66rem" }}>
                  <div style={{ height: "26px", background: "#dbeafe", borderRadius: "4px", marginBottom: "0.25rem" }} />
                  AI for Educators
                  <div style={{ color: "var(--success)", fontSize: "0.58rem" }}>Published</div>
                </div>
                <div style={{ background: "var(--surface)", borderRadius: "6px", padding: "0.4rem", fontSize: "0.66rem" }}>
                  <div style={{ height: "26px", background: "#fde68a", borderRadius: "4px", marginBottom: "0.25rem" }} />
                  Design Foundations
                  <div style={{ color: "var(--warning)", fontSize: "0.58rem" }}>Draft</div>
                </div>
              </div>
            </div>
            <div className="dashboard-panel">
              <h5>Enrollment Funnel - Last 30 days</h5>
              {funnel.map((row, index) => (
                <div className="funnel-row" key={row.label}>
                  <span>{row.label}</span>
                  <span className="bar">
                    <span
                      className={`bar-fill bar-fill-${index}`}
                      style={{ width: row.width }}
                    />
                  </span>
                  <span style={{ textAlign: "right" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const howSteps = [
  {
    title: "Capture every interested lead",
    body:
      "Drop a single webhook into your site, ads, and course pages. CoursePilot ingests every form, page visit, and ad click without copy paste.",
    icon: <IconLink />,
  },
  {
    title: "Enrich and reason with AI",
    body:
      "Each lead is enriched with public LinkedIn and company context, then the AI SDK drafts a brief, an outreach message, and a recommended next step.",
    icon: <IconWand />,
  },
  {
    title: "Send, track, and learn",
    body:
      "Send personalized outreach in one click, track opens and replies, and feed the responses back into the system to improve every send.",
    icon: <IconRocket />,
  },
];

const features = [
  {
    title: "AI Course Builder",
    body: "Generate structured outlines, lessons, quizzes, and assessments in minutes. Edit anything, keep the structure.",
    icon: <IconBook />,
  },
  {
    title: "Student Outreach Automation",
    body: "Personalized follow ups, reminders, and re-engagement nudges based on each student's signal and progress.",
    icon: <IconSend />,
  },
  {
    title: "Enrollment Insights",
    body: "Live funnels, cohort metrics, and revenue dashboards that surface where students drop off and why.",
    icon: <IconChart />,
  },
  {
    title: "Creator & School Dashboards",
    body: "Role based workspaces for solo creators, teaching teams, and full institutions with shared review queues.",
    icon: <IconLayers />,
  },
];

const proof = [
  { value: "150K+", label: "Active learners" },
  { value: "12K+", label: "Courses created" },
  { value: "98%", label: "Customer satisfaction" },
  { value: "$50M+", label: "Revenue generated" },
];

const testimonials = [
  {
    quote:
      "We went from 30 minutes of research per lead to 30 seconds of review. Our reply rate doubled in the first month with no extra headcount.",
    author: "Dr. Maya Brooks",
    role: "Head of Learning, Future Ed Institute",
  },
  {
    quote:
      "CoursePilot replaced six tools and a fragile n8n workflow. The dashboards finally show our team where to spend the next hour.",
    author: "Jordan Patel",
    role: "Director of Programs, Northwind Academy",
  },
  {
    quote:
      "The AI drafts read like a human teammate wrote them. Students get the right nudge at the right time, and we actually feel proud of the messages.",
    author: "Sienna Cole",
    role: "Founder, Frame & Form Studio",
  },
];

const faqs = [
  {
    q: "How long does it take to set up?",
    a: "Most teams ship the intake form, AI brief, and outreach email in under an hour. The Vercel Workflow SDK and AI Gateway handle the durable parts so you focus on copy and routing.",
  },
  {
    q: "Where does the AI run and is my data private?",
    a: "AI calls go through Vercel AI Gateway. We never train on your data, and student records stay inside your Vercel project. Bring your own model or use ours.",
  },
  {
    q: "Can I use my existing CRM, email, and LMS?",
    a: "Yes. The intake webhook accepts the same shape as the n8n workflow it replaces, so you can plug in HubSpot, Salesforce, Resend, Gmail, Canvas, and others without rewrites.",
  },
  {
    q: "What does the AI need to write a good outreach email?",
    a: "A LinkedIn URL, name, role, and company are enough. The agent enriches the rest, blocks unsafe URLs, and falls back to a safe template if any data source is down.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div>
          <h1 className="hero-heading">
            Create courses faster. <span className="accent">Engage students smarter.</span>
          </h1>
          <p className="hero-sub">
            CoursePilot is the activation agent for education teams. Capture every interested lead, brief your team in seconds, and send personalized outreach
            without copy paste or guesswork.
          </p>
          <div className="hero-ctas">
            <Link href="/intake" className="btn btn-primary btn-arrow">
              <span>Get Started</span>
              <Arrow />
            </Link>
            <button type="button" className="btn btn-outline">
              <Play /> Watch Demo
            </button>
          </div>
          <div className="hero-checks">
            <span className="check-item">
              <Check /> No credit card required
            </span>
            <span className="check-item">
              <Check /> Setup in minutes
            </span>
            <span className="check-item">
              <Check /> Cancel anytime
            </span>
          </div>
        </div>
        <DashboardMock />
      </section>

      <section className="trust-strip">
        <div className="label">Trusted by Educators &amp; Creators Worldwide</div>
        <div className="trust-logos">
          {trustLogos.map((logo) => (
            <div className="trust-logo" key={logo.slug} title={logo.name}>
              <Image
                src={`https://cdn.simpleicons.org/${logo.slug}/${logo.color}`}
                alt={logo.name}
                width={120}
                height={36}
                unoptimized
              />
              <span className="trust-logo-name">{logo.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="how">
        <div className="section-head">
          <span className="kicker">How it works</span>
          <h2>From a fresh lead to a personalized outreach in three steps.</h2>
          <p>CoursePilot wires up your intake form, AI brief, and outreach send so a human only has to review and click send.</p>
        </div>
        <div className="how-grid">
          {howSteps.map((step, index) => (
            <div className="how-card" key={step.title}>
              <div className="how-step">Step {index + 1}</div>
              <span className="icon-brand">{step.icon}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="features">
        <div className="section-head">
          <span className="kicker">Platform</span>
          <h2>One workspace for everything education teams used to stitch together.</h2>
          <p>CoursePilot brings course building, outreach, analytics, and team workflows into a single AI-native product.</p>
        </div>
        <div className="features-grid">
          {features.map((feature) => (
            <div className="feature-card" key={feature.title}>
              <span className="icon-brand">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
              <Link href="/intake" className="learn">
                Learn more <Arrow />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="proof-band">
        <div className="proof-head">
          <span className="kicker light">Why CoursePilot</span>
          <h2>Numbers our customers report after switching.</h2>
        </div>
        <div className="proof-grid">
          {proof.map((item) => (
            <div className="proof-stat" key={item.label}>
              <div className="num">{item.value}</div>
              <div className="lbl">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="testimonials">
        <div className="section-head">
          <span className="kicker">Customer stories</span>
          <h2>Education teams choose CoursePilot because it actually ships.</h2>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((t) => (
            <article className="testimonial-card" key={t.author}>
              <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
              <div className="testimonial-author">
                <span className="testimonial-avatar" aria-hidden />
                <div>
                  <strong>{t.author}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="faq">
        <div className="section-head">
          <span className="kicker">FAQ</span>
          <h2>Answers to the questions every education team asks first.</h2>
        </div>
        <div className="faq-list">
          {faqs.map((item) => (
            <details className="faq-item" key={item.q}>
              <summary>
                <span>{item.q}</span>
                <span className="faq-icon" aria-hidden>
                  <IconPlus />
                </span>
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="cta-final">
        <div>
          <span className="kicker light">Ready when you are</span>
          <h2>Start activating leads with CoursePilot today.</h2>
          <p>Drop in a lead, watch the workflow produce a brief, draft, and approved email in seconds.</p>
          <div className="hero-ctas">
            <Link href="/intake" className="btn btn-primary btn-arrow">
              <span>Get Started</span>
              <Arrow />
            </Link>
            <Link href="/architecture" className="btn btn-outline btn-outline-light">
              <IconShield /> See architecture
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
