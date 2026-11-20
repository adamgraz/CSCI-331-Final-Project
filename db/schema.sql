-- Tables for the application and project tracker.
-- Build the database with `npm run db:setup`, or wipe and rebuild it with `npm run db:reset`.

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  -- "salt:hash", both hex. See lib/password.mjs.
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

CREATE TABLE applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  posting_url TEXT,
  posting_text TEXT NOT NULL DEFAULT '',
  stage TEXT NOT NULL DEFAULT 'Saved'
    CHECK (stage IN ('Saved', 'Applied', 'Interview', 'Offer', 'Rejected')),
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_applications_user ON applications(user_id);

-- One row each time an application's stage changes, so the history keeps its dates.
-- Ownership comes from the parent application.
CREATE TABLE stage_changes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  repo_url TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'github')),
  updated_at TEXT
);
CREATE INDEX idx_projects_user ON projects(user_id);
-- Re-importing a repo updates it, but two users can each import the same repo.
CREATE UNIQUE INDEX idx_projects_user_repo ON projects(user_id, repo_url)
  WHERE repo_url IS NOT NULL;

-- Shared catalog of skills. Whether someone has a skill lives in user_skills.
CREATE TABLE skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  aliases TEXT NOT NULL DEFAULT ''
);

-- One row per user per skill, created only once the user sets something.
-- No row means the user doesn't have the skill and has no plan.
-- have is 1 when the user has the skill, 0 when it's missing.
CREATE TABLE user_skills (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  have INTEGER NOT NULL DEFAULT 0 CHECK (have IN (0, 1)),
  plan TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (user_id, skill_id)
);

-- Which skills each job asks for. Ownership comes from the application.
CREATE TABLE application_skills (
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (application_id, skill_id)
);

-- Which skills each project shows. Ownership comes from the project.
CREATE TABLE project_skills (
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, skill_id)
);