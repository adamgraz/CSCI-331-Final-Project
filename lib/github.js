// Reads public repos from the GitHub REST API. No key is needed, but GitHub allows
// only 60 requests an hour per IP address, so this is only called when the user
// clicks a button on the Projects page.
//
// Problems with GitHub throw a GitHubError, whose message is safe to show the user.

export class GitHubError extends Error {}

const API = "https://api.github.com";

// GitHub usernames are letters, digits and single hyphens, up to 39 characters.
const USERNAME = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export function isValidUsername(username) {
  return USERNAME.test(username);
}

async function get(path) {
  let response;
  try {
    response = await fetch(API + path, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "csci331-tracker" },
    });
  } catch {
    throw new GitHubError("Couldn't reach GitHub. Check your connection and try again.");
  }

  if (response.status === 404) throw new GitHubError("GitHub has no user with that name.");
  if (response.status === 403 || response.status === 429) {
    throw new GitHubError("GitHub's limit of 60 lookups an hour was reached. Try again later.");
  }
  if (!response.ok) throw new GitHubError(`GitHub returned an error (${response.status}).`);
  return response.json();
}

// The user's public repos, most recently updated first.
// ponytail: only the first 100 repos, add paging if someone has more.
export async function getRepos(username) {
  const repos = await get(`/users/${username}/repos?per_page=100&sort=updated`);
  return repos.map((r) => ({
    fullName: r.full_name,
    name: r.name,
    description: r.description ?? "",
    url: r.html_url,
    updatedAt: r.pushed_at ?? r.updated_at,
    fork: r.fork,
  }));
}

// The languages GitHub detected in a repo, like ["JavaScript", "CSS"].
export async function getLanguages(fullName) {
  return Object.keys(await get(`/repos/${fullName}/languages`));
}
