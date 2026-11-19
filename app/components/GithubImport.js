"use client";

import { useActionState } from "react";
import { githubImport } from "@/app/projects/github-actions";

// GitHub import form (Section A), shown on the Projects page.
// Step 1 finds a user's public repos. Step 2 imports the ones that are checked.
// Both forms call the same Server Action, and state holds whatever it returned last.
export default function GithubImport() {
  const [state, action, pending] = useActionState(githubImport, {});

  return (
    <section>
      <h2>Import from GitHub</h2>

      <form action={action}>
        <input type="hidden" name="step" value="find" />
        <label htmlFor="github-username">GitHub username </label>
        <input id="github-username" name="username" defaultValue={state.username} required />
        <button type="submit" disabled={pending}>
          Find repos
        </button>
      </form>

      {pending && <p>Talking to GitHub...</p>}
      {state.error && <p role="alert">{state.error}</p>}
      {state.message && <p>{state.message}</p>}

      {state.repos && state.repos.length === 0 && <p>This user has no public repos.</p>}
      {state.repos && state.repos.length > 0 && (
        <form action={action}>
          <input type="hidden" name="step" value="import" />
          <input type="hidden" name="username" value={state.username} />
          <ul>
            {state.repos.map((r) => (
              <li key={r.fullName}>
                <label>
                  <input type="checkbox" name="repo" value={r.fullName} /> {r.name}
                  {r.fork && " (fork)"}
                  {r.imported && " (already imported, importing again updates it)"}
                </label>
                {r.description && <span>. {r.description}</span>}
              </li>
            ))}
          </ul>
          <button type="submit" disabled={pending}>
            Import checked repos
          </button>
        </form>
      )}
    </section>
  );
}
