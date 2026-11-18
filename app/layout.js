import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "Application and Project Tracker",
  description: "Track job applications, projects, and the skills that connect them",
};

// Shared layout and navigation (Section C).
// Pages read the database on every request. app/loading.js shows while a page's
// data loads, both on the first visit and when moving between pages.
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
        <main>{children}</main>
      </body>
    </html>
  );
}
