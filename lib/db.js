import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

// Only lib/data.js should import this. Pages get data through lib/data.js, so the
// database can be swapped later without touching them.
const file = process.env.DB_PATH ?? path.join(process.cwd(), "data", "app.db");

function open() {
  // The ignore comment stops Next.js from bundling the whole project because of this path.
  if (!fs.existsSync(/*turbopackIgnore: true*/ file)) {
    throw new Error(`No database at ${file}. Run npm run db:setup first.`);
  }
  const connection = new DatabaseSync(file);
  connection.exec("PRAGMA foreign_keys = ON");
  return connection;
}

// The dev server reloads modules on every edit, so the connection is kept on
// globalThis instead of opening a new one each time.
export const db = (globalThis.__trackerDb ??= open());
