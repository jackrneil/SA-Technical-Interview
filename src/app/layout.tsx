import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const body = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CoursePilot - AI for education teams",
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
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <header className="site-header">
          <div className="site-header-inner">
            <Link href="/" className="brand-logo" aria-label="CoursePilot home">
              <Image
                src="/logo-full.png"
                alt="CoursePilot"
                width={1159}
                height={319}
                priority
                className="brand-logo-image"
              />
            </Link>
            <nav className="primary-nav" aria-label="Primary">
              <Link href="#features">Platform</Link>
              <Link href="#how-it-works">How it works</Link>
              <Link href="#faq">FAQ</Link>
            </nav>
            <div className="header-actions">
              <Link href="/intake" className="btn btn-primary btn-arrow">
                <span>Get Started</span>
                <ArrowIcon />
              </Link>
            </div>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="site-footer-inner">
            <div className="footer-brand">
              <Image
                src="/logo-full.png"
                alt="CoursePilot"
                width={1159}
                height={319}
                className="brand-logo-image"
              />
              <p>The activation agent for modern education teams.</p>
            </div>
            <div className="footer-columns">
              <div>
                <h5>Product</h5>
                <Link href="#features">Features</Link>
                <Link href="#how-it-works">How it works</Link>
                <Link href="/architecture">Architecture</Link>
                <Link href="/evals">Evaluations</Link>
              </div>
              <div>
                <h5>Get started</h5>
                <Link href="/intake">Submit a lead</Link>
                <Link href="/result">View results</Link>
                <Link href="/evals">Eval rubric</Link>
              </div>
            </div>
          </div>
          <div className="site-footer-bottom">
            <span>© {new Date().getFullYear()} CoursePilot. All rights reserved.</span>
            <span>Built on Vercel with the AI SDK + Workflow SDK.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
