import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoursePilot Activation Agent",
  description: "AI-powered lead enrichment, outreach drafting, evaluation, and email sending for education technology teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="brand" href="/">
            <span>CoursePilot</span>
            <strong>Activation Agent</strong>
          </Link>
          <nav>
            <Link href="/">Intake</Link>
            <Link href="/architecture">Architecture</Link>
            <Link href="/evals">Evals</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
