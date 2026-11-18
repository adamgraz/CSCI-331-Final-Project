-- Tables for the application and project tracker.
-- Build the database with `npm run db:setup`, or wipe and rebuild it with `npm run db:reset`.

CREATE TABLE applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  posting_url TEXT,
  posting_text TEXT NOT NULL DEFAULT '',
  stage TEXT NOT NULL DEFAULT 'Saved'
    CHECK (stage IN ('Saved', 'Applied', 'Interview', 'Offer', 'Rejected')),
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- One row each time an application's stage changes, so the history keeps its dates.
CREATE TABLE stage_changes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  repo_url TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'github')),
  updated_at TEXT
);

-- have is 1 when the user has the skill, 0 when it's missing.
CREATE TABLE skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  have INTEGER NOT NULL DEFAULT 0 CHECK (have IN (0, 1)),
  plan TEXT NOT NULL DEFAULT ''
);

-- Which skills each job asks for.
CREATE TABLE application_skills (
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (application_id, skill_id)
);

-- Which skills each project shows.
CREATE TABLE project_skills (
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, skill_id)
);
