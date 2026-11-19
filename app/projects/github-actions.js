"use server";

import { refresh } from "next/cache";
import { getLanguages, getRepos, GitHubError, isValidUsername } from "@/lib/github";
import { getProjectRepoUrls, importGithubProjects } from "@/lib/data";

// Most repos one import can save. Each one costs a GitHub request, out of 60 an hour.
const MAX_REPOS = 20;

// Server Action behind the GitHub import form (Section A). One action handles both
// steps so the form keeps a single state:
//   step "find"    looks up the user's public repos and returns them as a checklist
//   step "import"  saves the checked repos as projects, with their languages as skills
// It returns { username, repos, message, error } for the form to show.
export async function githubImport(previous, formData) {
  const username = String(formData.get("username") ?? "").trim();
  const step = formData.get("step");
  if (!isValidUsername(username)) {
    return { username, error: "Enter a valid GitHub username." };
  }

  try {
    // The repo list is fetched again on import instead of trusting what the browser
    // sent back, so only this user's real public repos can be saved.
    const repos = await getRepos(username);

    let message;
    if (step === "import") {
      const picked = new Set(formData.getAll("repo"));
      const chosen = repos.filter((r) => picked.has(r.fullName));
      if (chosen.length === 0) return { ...previous, error: "Pick at least one repo." };
      if (chosen.length > MAX_REPOS) {
        return { ...previous, error: `Pick ${MAX_REPOS} repos or fewer at a time.` };
      }

      for (const repo of chosen) repo.languages = await getLanguages(repo.fullName);
      const skills = await importGithubProjects(chosen);
      refresh();
      message =
        `Imported ${chosen.length} repo${chosen.length === 1 ? "" : "s"}. ` +
        (skills.length ? `Skills added: ${skills.join(", ")}.` : "No matching skills found.");
    }

    const saved = new Set(await getProjectRepoUrls());
    return {
      username,
      message,
      repos: repos.map((r) => ({ ...r, imported: saved.has(r.url) })),
    };
  } catch (error) {
    if (!(error instanceof GitHubError)) {
      console.error(error);
      error = new Error("Something went wrong saving the import. Nothing was saved.");
    }
    // A failed lookup clears the list. A failed import keeps it so the user can retry.
    return step === "import"
      ? { ...previous, message: undefined, error: error.message }
      : { username, error: error.message };
  }
}
