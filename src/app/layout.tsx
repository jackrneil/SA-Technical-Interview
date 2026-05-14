import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoursePilot - AI-Powered Education Platform",
  description:
    "CoursePilot helps creators, schools, and education teams launch high-impact course experiences, automate follow up, personalize learning journeys, and boost enrollment and engagement with AI.",
};

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="site-header-inner">
            <Link href="/" className="brand-logo" aria-label="CoursePilot home">
              <span className="brand-mark">F</span>
              <span>CoursePilot</span>
            </Link>
            <nav className="primary-nav" aria-label="Primary">
              <button type="button">
                Platform <span className="caret" />
              </button>
              <button type="button">
                Solutions <span className="caret" />
              </button>
              <Link href="/architecture">Pricing</Link>
              <button type="button">
                Resources <span className="caret" />
              </button>
            </nav>
            <div className="header-actions">
              <Link href="/evals">Login</Link>
              <Link href="/intake" className="btn btn-primary btn-arrow">
                Get Started <ArrowIcon />
              </Link>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
