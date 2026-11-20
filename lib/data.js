import { connection } from "next/server";
import { db } from "./db";
import { getCurrentUserId } from "./auth";

// Every page and server route reads and writes data through these functions.
// They are async on purpose. node:sqlite answers immediately, but if we switch to
// MariaDB later its driver is async, and only this file would need to change.
//
// await connection() tells Next.js the result depends on the current request, so
// pages show fresh data instead of what existed when the app was built.
//
// Every function is scoped to the logged-in user. A row that belongs to someone
// else looks exactly like a row that doesn't exist.

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
  const userId = await getCurrentUserId();
  return db
    .prepare(
      `SELECT id, company, role, stage, created_at
       FROM applications
       WHERE user_id = ?
       ORDER BY created_at DESC, id DESC`
    )
    .all(userId)
    .map(plain);
}

// Returns null when no application has this id, or it belongs to another user.
export async function getApplication(id) {
  await connection();
  const userId = await getCurrentUserId();
  const row = db
    .prepare("SELECT * FROM applications WHERE id = ? AND user_id = ?")
    .get(id, userId);
  if (!row) return null;

  // The application is confirmed to be this user's, so its child rows are too.
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
      `SELECT s.id, s.name, COALESCE(u.have, 0) AS have
       FROM skills s
       JOIN application_skills a ON a.skill_id = s.id
       LEFT JOIN user_skills u ON u.skill_id = s.id AND u.user_id = ?
       WHERE a.application_id = ?
       ORDER BY s.name`
    )
    .all(userId, id)
    .map(plain);
  return application;
}

export async function getProjects() {
  await connection();
  const userId = await getCurrentUserId();
  const projects = db
    .prepare(
      "SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC, id DESC"
    )
    .all(userId)
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

// Each skill with whether this user has it, how many of their jobs need it, and
// how many of their projects show it.
export async function getSkills() {
  await connection();
  const userId = await getCurrentUserId();
  return db
    .prepare(
      `SELECT s.id, s.name,
         COALESCE(u.have, 0) AS have,
         COALESCE(u.plan, '') AS plan,
         (SELECT COUNT(*) FROM application_skills a
            JOIN applications ap ON ap.id = a.application_id
            WHERE a.skill_id = s.id AND ap.user_id = ?) AS job_count,
         (SELECT COUNT(*) FROM project_skills p
            JOIN projects pr ON pr.id = p.project_id
            WHERE p.skill_id = s.id AND pr.user_id = ?) AS project_count
       FROM skills s
       LEFT JOIN user_skills u ON u.skill_id = s.id AND u.user_id = ?
       ORDER BY s.name`
    )
    .all(userId, userId, userId)
    .map(plain);
}

// Every stage with its count, including stages that have no jobs yet.
export async function getStageCounts() {
  await connection();
  const userId = await getCurrentUserId();
  const rows = db
    .prepare(
      `SELECT stage, COUNT(*) AS count FROM applications
       WHERE user_id = ? GROUP BY stage`
    )
    .all(userId);
  const counts = Object.fromEntries(rows.map((r) => [r.stage, r.count]));
  return STAGES.map((stage) => ({ stage, count: counts[stage] ?? 0 }));
}