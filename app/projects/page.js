import { getProjects } from "@/lib/data";
import GithubImport from "@/app/components/GithubImport";

// Projects page (Section C). The GitHub import belongs to Section A.
export default async function Projects() {
  const projects = await getProjects();

  return (
    <>
      <h1>Projects</h1>
      <GithubImport />
      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            <strong>{p.name}</strong>. {p.description} Skills:{" "}
            {p.skills.map((s) => s.name).join(", ") || "none"}
          </li>
        ))}
      </ul>
    </>
  );
}
