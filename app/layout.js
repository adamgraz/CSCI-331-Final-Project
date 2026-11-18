import { Suspense } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "Application and Project Tracker",
  description: "Track job applications, projects, and the skills that connect them",
};

// Shared layout and navigation (Section C).
// Pages read the database on every request, so they render inside Suspense, which
// shows the fallback while their data loads.
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/">Dashboard</Link>
          <Link href="/applications">Applications</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/skills">Skills</Link>
        </nav>
        <main>
          <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
        </main>
      </body>
    </html>
  );
}
