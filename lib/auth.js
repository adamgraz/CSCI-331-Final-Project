// TEMPORARY: always the demo user (id 1). Step 2 replaces this with a real
// session lookup that reads the session cookie and returns the user's id,
// or null when nobody is logged in.
export async function getCurrentUserId() {
  return 1;
}