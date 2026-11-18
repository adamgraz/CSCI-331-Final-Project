import { connection } from "next/server";
import { db } from "./db";
import { findSkills } from "./skills";

// Every page and server route reads and writes data through these functions.
// They are async on purpose. node:sqlite answers immediately, but if we switch to
// MariaDB later its driver is async, and only this file would need to change.
//
// await connection() tells Next.js the result depends on the current request, so
// pages show fresh data instead of what existed when the app was built.

export const STAGES = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

// node:sqlite rows have no prototype, which React can't pass to client components.
// Copying them into plain objects avoids that, and turns have (0/1) into true/false.
function plain(row) {
  const copy = { ...row };
  if ("have" in copy) copy.have = copy.have === 1;
  return copy;
}

export async function getApplications() {
  await connection();
  return db
    .prepare(
      `SELECT id, company, role, stage, created_at
       FROM applications
       ORDER BY created_at DESC, id DESC`
    )
    .all()
    .map(plain);
}

// Returns null when no application has this id.
export async function getApplication(id) {
  await connection();
  const row = db.prepare("SELECT * FROM applications WHERE id = ?").get(id);
  if (!row) return null;

  const application = plain(row);
  application.stageChanges = db
    .prepare(
      `SELECT stage, changed_at FROM stage_changes
       WHERE application_id = ? ORDER BY changed_at, id`
    )
    .all(id)
    .map(plain);
  application.skills = db
    .prepare(
      `SELECT s.id, s.name, s.have FROM skills s
       JOIN application_skills a ON a.skill_id = s.id
       WHERE a.application_id = ? ORDER BY s.name`
    )
    .all(id)
    .map(plain);
  return application;
}

export async function getProjects() {
  await connection();
  const projects = db
    .prepare("SELECT * FROM projects ORDER BY updated_at DESC, id DESC")
    .all()
    .map(plain);
  const skillsFor = db.prepare(
    `SELECT s.id, s.name FROM skills s
     JOIN project_skills p ON p.skill_id = s.id
     WHERE p.project_id = ? ORDER BY s.name`
  );
  for (const project of projects) {
    project.skills = skillsFor.all(project.id).map(plain);
  }
  return projects;
}

// Each skill with how many jobs need it and how many projects show it.
export async function getSkills() {
  await connection();
  return db
    .prepare(
      `SELECT s.id, s.name, s.aliases, s.have, s.plan,
         (SELECT COUNT(*) FROM application_skills a WHERE a.skill_id = s.id) AS job_count,
         (SELECT COUNT(*) FROM project_skills p WHERE p.skill_id = s.id) AS project_count
       FROM skills s
       ORDER BY s.name`
    )
    .all()
    .map(plain);
}

// Every stage with its count, including stages that have no jobs yet.
export async function getStageCounts() {
  await connection();
  const rows = db
    .prepare("SELECT stage, COUNT(*) AS count FROM applications GROUP BY stage")
    .all();
  const counts = Object.fromEntries(rows.map((r) => [r.stage, r.count]));
  return STAGES.map((stage) => ({ stage, count: counts[stage] ?? 0 }));
}

// Finds the skills mentioned in a job's posting text and links them to that job.
// Section B calls this right after saving a new job, or after editing its posting text.
// Skills already linked stay linked, so ones added by hand aren't lost.
// Returns the skills it found.
//
// Writes like this one run from Server Actions, not while a page renders, so they
// don't need await connection().
export async function matchApplicationSkills(applicationId, postingText) {
  const skills = db.prepare("SELECT id, name, aliases FROM skills").all().map(plain);
  const found = findSkills(postingText, skills);
  const link = db.prepare(
    "INSERT OR IGNORE INTO application_skills (application_id, skill_id) VALUES (?, ?)"
  );
  for (const skill of found) link.run(applicationId, skill.id);
  return found;
}
