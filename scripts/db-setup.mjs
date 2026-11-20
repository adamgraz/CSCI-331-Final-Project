// Builds the SQLite database from db/schema.sql and db/seed.sql.
//   npm run db:setup   creates it only if it doesn't exist yet (safe to run anytime)
//   npm run db:reset   deletes it and rebuilds it, losing all data in it
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { hashPassword } from "../lib/password.mjs";

const file = process.env.DB_PATH ?? path.join("data", "app.db");
const reset = process.argv.includes("--reset");

if (fs.existsSync(file) && !reset) {
  console.log(`${file} already exists, leaving it alone. Use npm run db:reset to rebuild it.`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(file), { recursive: true });
try {
  for (const suffix of ["", "-wal", "-shm"]) {
    fs.rmSync(file + suffix, { force: true });
  }
} catch (error) {
  // Windows won't delete a file another program has open.
  if (error.code === "EPERM" || error.code === "EBUSY") {
    console.error(`Can't replace ${file} while the app is using it. Stop npm run dev (Ctrl+C), then try again.`);
    process.exit(1);
  }
  throw error;
}

const db = new DatabaseSync(file);
db.exec("PRAGMA foreign_keys = ON");
db.exec(fs.readFileSync("db/schema.sql", "utf8"));

// The seed can't hash a password in plain SQL, so the demo account is created here.
const demoPassword = process.env.DEMO_PASSWORD ?? "demo-password";
db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run(
  "demo",
  hashPassword(demoPassword)
);

db.exec(fs.readFileSync("db/seed.sql", "utf8"));
db.close();

console.log(`Built ${file} with the sample data. Demo login: demo / ${demoPassword}`);