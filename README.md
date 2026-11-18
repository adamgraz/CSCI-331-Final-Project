# Application and Project Tracker

CSCI 331 final project. A Next.js app for tracking job applications, portfolio projects, and the skills that connect them. The full spec is in the team's Google Doc (ask Adam for access).

## Setup

Requires Node.js 24 or newer, which includes the SQLite module the app uses. Nothing else needs installing.

```bash
git clone https://github.com/adamgraz/CSCI-331-Final-Project.git
cd CSCI-331-Final-Project
npm install
npm run db:setup
npm run dev
```

Then open http://localhost:3000.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Runs the app locally. Saved changes show up right away. |
| `npm run build` | Builds the production version. Run it before pushing to catch errors. |
| `npm run start` | Runs the built version, which is what the server uses |
| `npm run db:setup` | Creates `data/app.db` with the sample data, only if it doesn't exist yet |
| `npm run db:reset` | Deletes `data/app.db` and rebuilds it from scratch. All local data is lost. Stop the app first. |

## Who owns what

| File or folder | Page | Section |
|---|---|---|
| `app/layout.js`, `app/globals.css` | Navigation and styling on every page | C |
| `app/page.js` | Dashboard (`/`) | C |
| `app/applications/page.js` | Applications list (`/applications`) | B |
| `app/applications/[id]/page.js` | Job detail (`/applications/1`). The skills gap section is A's. | B |
| `app/projects/page.js` | Projects (`/projects`). The GitHub import is A's. | C |
| `app/skills/page.js` | Skills (`/skills`) | A |
| `lib/data.js` | Every data function, shared by all pages | Everyone |
| `lib/db.js`, `db/`, `scripts/` | Database connection, tables, sample data | A |

Put new components in `app/components/`.

## Data

All database access goes through `lib/data.js`. Pages never import `lib/db.js` or write SQL themselves, so the database can be changed later without touching any page.

When you need data that no function provides yet, add a function to `lib/data.js`. Make it `async`, start it with `await connection()` like the others, and return plain objects. If you change a function someone else's page uses, tell them first.

The tables are defined in `db/schema.sql`.

| Table | Holds |
|---|---|
| `applications` | `company`, `role`, `posting_url`, `posting_text`, `stage`, `notes`, `created_at` |
| `stage_changes` | One row per stage change: `application_id`, `stage`, `changed_at` |
| `projects` | `name`, `description`, `repo_url`, `source` (`manual` or `github`), `updated_at` |
| `skills` | `name`, `have` (true or false in JavaScript), `plan` |
| `application_skills` | Which skills each job asks for |
| `project_skills` | Which skills each project shows |

Stages are `Saved`, `Applied`, `Interview`, `Offer` and `Rejected`, also exported as `STAGES` from `lib/data.js`. Dates are stored as text, like `2026-11-18 14:30:00`.

To change a table, edit `db/schema.sql` (and `db/seed.sql` if the sample data needs it), tell the team, and have everyone run `npm run db:reset`.

## Working together

- Work on your own branch, for example `git checkout -b applications-search`. Push it and open a pull request into `main` when a piece works.
- Pull `main` often so your branch doesn't fall behind.
- Commit small pieces from your own GitHub account. Each person's commit history is graded.
- `data/` is in `.gitignore`. Never commit the database file.

## Deploying to the course server

The port is decided once the NextJS homework is graded. On the server, inside tmux:

```bash
git pull
npm install
npm run db:setup
npm run build
PORT=30XX npm run start
```

Use `db:setup`, never `db:reset`, on the server, since reset deletes the live data.
