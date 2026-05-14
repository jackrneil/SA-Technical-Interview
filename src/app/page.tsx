import Link from "next/link";

function Sparkle() {
  return (
    <svg className="sparkle" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.8 4.6L18.4 8 13.8 9.4 12 14l-1.8-4.6L5.6 8l4.6-1.4L12 2z" />
      <path d="M19 13l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9L19 13z" opacity=".6" />
    </svg>
  );
}

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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14" />
      <path d="M6 17h12" />
      <path d="M8 7h8M8 11h8" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 4 4 5-7" />
    </svg>
  );
}

function IconLayers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m12 2 9 5-9 5-9-5 9-5z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function IconSchool() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 9 12 4l9 5-9 5-9-5z" />
      <path d="M7 11v5a5 5 0 0 0 10 0v-5" />
    </svg>
  );
}

function StatTrend() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 17 9 11l4 4 8-9" />
      <path d="M14 6h7v7" />
    </svg>
  );
}

const trustLogos = ["udemy", "Kajabi", "thinkific", "ACE", "BYJU'S", "coursera", "edX"];

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
          <span className="brand-mark">F</span>
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
              <h4>Welcome back, Alex 👋</h4>
              <p>Here&apos;s what&apos;s happening with your school.</p>
            </div>
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
                <polyline fill="none" stroke="#2563eb" strokeWidth="2" points="0,55 30,48 60,42 90,36 120,30 150,24 180,18 210,12 240,8" />
                <polyline fill="none" stroke="#16a34a" strokeWidth="2" points="0,60 30,55 60,52 90,48 120,42 150,38 180,32 210,28 240,22" />
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
                  <div style={{ height: "26px", background: "linear-gradient(135deg,#dbeafe,#bfdbfe)", borderRadius: "4px", marginBottom: "0.25rem" }} />
                  AI for Educators
                  <div style={{ color: "var(--success)", fontSize: "0.58rem" }}>Published</div>
                </div>
                <div style={{ background: "var(--surface)", borderRadius: "6px", padding: "0.4rem", fontSize: "0.66rem" }}>
                  <div style={{ height: "26px", background: "linear-gradient(135deg,#fde68a,#fbbf24)", borderRadius: "4px", marginBottom: "0.25rem" }} />
                  Design Foundations
                  <div style={{ color: "var(--warning)", fontSize: "0.58rem" }}>Draft</div>
                </div>
              </div>
            </div>
            <div className="dashboard-panel">
              <h5>Enrollment Funnel - Last 30 days</h5>
              {funnel.map((row) => (
                <div className="funnel-row" key={row.label}>
                  <span>{row.label}</span>
                  <span className="bar">
                    <span style={{ width: row.width }} />
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

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div>
          <span className="eyebrow-pill">
            <Sparkle /> AI-Powered Education Platform
          </span>
          <h1 className="hero-heading">
            Create courses faster.
            <span className="accent">Engage students smarter.</span>
          </h1>
          <p className="hero-sub">
            CoursePilot helps creators, schools, and education teams launch high-impact course experiences, automate follow up, personalize learning
            journeys, and boost enrollment and engagement with AI.
          </p>
          <div className="hero-ctas">
            <Link href="/intake" className="btn btn-primary btn-arrow">
              Get Started <Arrow />
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
            <span key={logo}>{logo}</span>
          ))}
        </div>
      </section>

      <section className="features-grid">
        <div className="feature-card">
          <span className="icon icon-blue">
            <IconBook />
          </span>
          <h3>AI Course Builder</h3>
          <p>Create structured, engaging courses in minutes with AI. Generate outlines, lessons, quizzes, and more.</p>
          <span className="learn">Learn more</span>
        </div>
        <div className="feature-card">
          <span className="icon icon-green">
            <IconSend />
          </span>
          <h3>Student Outreach Automation</h3>
          <p>Automate personalized follow-ups, reminders, and nudges that re-engage learners and drive completions.</p>
          <span className="learn">Learn more</span>
        </div>
        <div className="feature-card">
          <span className="icon icon-purple">
            <IconChart />
          </span>
          <h3>Enrollment Insights</h3>
          <p>Track performance, conversion funnels, and revenue in real-time with powerful analytics and reports.</p>
          <span className="learn">Learn more</span>
        </div>
        <div className="feature-card">
          <span className="icon icon-orange">
            <IconLayers />
          </span>
          <h3>Creator &amp; School Dashboards</h3>
          <p>Manage courses, students, and teams with role-based dashboards built for creators and institutions.</p>
          <span className="learn">Learn more</span>
        </div>
      </section>

      <section className="cta-band">
        <div>
          <h2>Built for Creators. Loved by Schools.</h2>
          <div className="cta-sub-cards">
            <div className="cta-sub-card">
              <h4>
                <span className="icon-square">
                  <IconUser />
                </span>
                For Creators
              </h4>
              <p>Monetize your knowledge, grow your audience, and deliver exceptional learning experiences.</p>
            </div>
            <div className="cta-sub-card">
              <h4>
                <span className="icon-square">
                  <IconSchool />
                </span>
                For Schools &amp; Teams
              </h4>
              <p>Engage students, scale programs, and streamline operations with AI and automation.</p>
            </div>
          </div>
        </div>
        <div>
          <div className="cta-stats">
            <div className="cta-stat">
              <span className="num">
                <StatTrend /> 150K+
              </span>
              <span className="label">Active Learners</span>
            </div>
            <div className="cta-stat">
              <span className="num">
                <IconBook /> 12K+
              </span>
              <span className="label">Courses Created</span>
            </div>
            <div className="cta-stat">
              <span className="num">
                <Check /> 98%
              </span>
              <span className="label">Customer Satisfaction</span>
            </div>
            <div className="cta-stat">
              <span className="num">
                <StatTrend /> $50M+
              </span>
              <span className="label">Revenue Generated</span>
            </div>
          </div>
          <div className="testimonial">
            <span className="avatar" />
            <div>
              <blockquote>
                &ldquo;CoursePilot has transformed how we create and deliver learning. Our engagement is up 3x and our team saves hours every week
                with AI.&rdquo;
              </blockquote>
              <span className="author">- Dr. Maya Brooks, Head of Learning, Future Ed Institute</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
