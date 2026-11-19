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

  // The projects that prove each skill, so the skills gap can show its evidence.
  const projectsFor = db.prepare(
    `SELECT p.id, p.name FROM projects p
     JOIN project_skills ps ON ps.project_id = p.id
     WHERE ps.skill_id = ? ORDER BY p.name`
  );
  for (const skill of application.skills) {
    skill.projects = projectsFor.all(skill.id).map(plain);
  }
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

// The repo URL of every project that has one, so the import can mark repos already saved.
export async function getProjectRepoUrls() {
  return db
    .prepare("SELECT repo_url FROM projects WHERE repo_url IS NOT NULL")
    .all()
    .map((r) => r.repo_url);
}

// Saves repos from the GitHub import as projects. A repo that was imported before
// is updated instead of added twice. Each repo's languages that match a skill are
// linked to the project, and those skills are marked as ones you have, unless the
// user already set that skill's have by hand.
// repos is a list of { name, description, url, updatedAt, languages }.
// Returns the names of the skills that were linked.
export async function importGithubProjects(repos) {
  const skills = db.prepare("SELECT id, name, aliases FROM skills").all().map(plain);
  const findProject = db.prepare("SELECT id FROM projects WHERE repo_url = ?");
  const insertProject = db.prepare(
    `INSERT INTO projects (name, description, repo_url, source, updated_at)
     VALUES (?, ?, ?, 'github', ?)`
  );
  const updateProject = db.prepare(
    "UPDATE projects SET name = ?, description = ?, updated_at = ? WHERE id = ?"
  );
  const linkSkill = db.prepare(
    "INSERT OR IGNORE INTO project_skills (project_id, skill_id) VALUES (?, ?)"
  );
  // Skills whose have the user set by hand are left alone.
  const markHave = db.prepare("UPDATE skills SET have = 1 WHERE id = ? AND have_set_by_user = 0");
  const linked = new Set();

  // One transaction, so a failure partway through saves none of the repos.
  db.exec("BEGIN");
  try {
    for (const repo of repos) {
      const updatedAt = repo.updatedAt?.slice(0, 10) ?? null;
      const existing = findProject.get(repo.url);
      let projectId;
      if (existing) {
        updateProject.run(repo.name, repo.description, updatedAt, existing.id);
        projectId = existing.id;
      } else {
        const result = insertProject.run(repo.name, repo.description, repo.url, updatedAt);
        projectId = Number(result.lastInsertRowid);
      }

      for (const skill of findSkills(repo.languages.join(", "), skills)) {
        linkSkill.run(projectId, skill.id);
        markHave.run(skill.id);
        linked.add(skill.name);
      }
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return [...linked];
}

// One skill with the jobs that need it and the projects that prove it.
// Returns null when no skill has this id.
export async function getSkill(id) {
  await connection();
  const row = db.prepare("SELECT * FROM skills WHERE id = ?").get(id);
  if (!row) return null;

  const skill = plain(row);
  skill.applications = db
    .prepare(
      `SELECT a.id, a.company, a.role, a.stage FROM applications a
       JOIN application_skills x ON x.application_id = a.id
       WHERE x.skill_id = ? ORDER BY a.created_at DESC`
    )
    .all(id)
    .map(plain);
  skill.projects = db
    .prepare(
      `SELECT p.id, p.name FROM projects p
       JOIN project_skills x ON x.project_id = p.id
       WHERE x.skill_id = ? ORDER BY p.name`
    )
    .all(id)
    .map(plain);
  return skill;
}

// Adds a skill to the list, then checks every saved posting for just that skill, so
// jobs that already mention it pick it up. Other skills aren't re-matched, so ones
// removed from a job by hand stay removed. If a skill with that name exists (ignoring
// capitals), nothing is added. Returns the id of the new or existing skill.
export async function createSkill(name, aliases) {
  const existing = db.prepare("SELECT id FROM skills WHERE name = ? COLLATE NOCASE").get(name);
  if (existing) return existing.id;

  const id = Number(
    db.prepare("INSERT INTO skills (name, aliases) VALUES (?, ?)").run(name, aliases).lastInsertRowid
  );
  const link = db.prepare("INSERT INTO application_skills (application_id, skill_id) VALUES (?, ?)");
  for (const p of db.prepare("SELECT id, posting_text FROM applications").all()) {
    if (findSkills(p.posting_text, [{ name, aliases }]).length) link.run(p.id, id);
  }
  return id;
}

// Saves the parts of a skill the user can edit on its page. Saving also records that
// the user chose have themselves, so imports and project links won't change it later.
export async function updateSkill(id, { aliases, have, plan }) {
  db.prepare(
    "UPDATE skills SET aliases = ?, have = ?, have_set_by_user = 1, plan = ? WHERE id = ?"
  ).run(
    aliases,
    have ? 1 : 0,
    plan,
    id
  );
}

// Links a project as proof of a skill. A project that proves a skill means you have it,
// unless the user already set have themselves on the skill's page.
export async function linkProjectSkill(projectId, skillId) {
  db.prepare("INSERT OR IGNORE INTO project_skills (project_id, skill_id) VALUES (?, ?)").run(
    projectId,
    skillId
  );
  db.prepare("UPDATE skills SET have = 1 WHERE id = ? AND have_set_by_user = 0").run(skillId);
}

export async function unlinkProjectSkill(projectId, skillId) {
  db.prepare("DELETE FROM project_skills WHERE project_id = ? AND skill_id = ?").run(
    projectId,
    skillId
  );
}

// Adds or removes a skill on a job by hand, for when matching missed it or got it wrong.
export async function addApplicationSkill(applicationId, skillId) {
  db.prepare(
    "INSERT OR IGNORE INTO application_skills (application_id, skill_id) VALUES (?, ?)"
  ).run(applicationId, skillId);
}

export async function removeApplicationSkill(applicationId, skillId) {
  db.prepare("DELETE FROM application_skills WHERE application_id = ? AND skill_id = ?").run(
    applicationId,
    skillId
  );
}
