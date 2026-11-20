import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { db } from "./db";
import { hashPassword, verifyPassword } from "./password.mjs";

const COOKIE = "session";
const SESSION_DAYS = 7;

// Compared against when the username doesn't exist, so a failed login takes the
// same time whether or not the account is real.
const DUMMY_HASH = hashPassword("not-a-real-password");

// Same format as the datetime('now') values in the database (UTC).
function toSqlDate(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

// Returns the new user's id, or null if the username is taken.
export async function createUser(username, password) {
  const taken = db.prepare("SELECT 1 FROM users WHERE username = ?").get(username);
  if (taken) return null;
  const result = db
    .prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)")
    .run(username, hashPassword(password));
  return Number(result.lastInsertRowid);
}

// Returns the user's id if the credentials are right, otherwise null.
export async function checkLogin(username, password) {
  const user = db
    .prepare("SELECT id, password_hash FROM users WHERE username = ?")
    .get(username);
  const ok = verifyPassword(password, user?.password_hash ?? DUMMY_HASH);
  return user && ok ? user.id : null;
}

// Call from a Server Action only. Cookies can't be set while rendering a page.
export async function startSession(userId) {
  db.prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')").run();

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  db.prepare(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)"
  ).run(token, userId, toSqlDate(expires));

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Secure cookies are dropped over plain http, so this is opt-in. Set
    // COOKIE_SECURE=true on the server only if it's served over https.
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    expires,
  });
}

// Call from a Server Action only.
export async function endSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
  jar.delete(COOKIE);
}

// The logged-in user as { id, username }, or null.
export async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT u.id, u.username
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > datetime('now')`
    )
    .get(token);
  return row ? { id: row.id, username: row.username } : null;
}

// For data functions: the user's id, or send the visitor to the login page.
export async function requireUserId() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user.id;
}