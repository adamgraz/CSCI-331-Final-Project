import Link from "next/link";
import { notFound } from "next/navigation";
import { getApplications, getProjects, getSkill } from "@/lib/data";
import {
  addToApplication,
  linkProject,
  removeFromApplication,
  saveSkill,
  unlinkProject,
} from "../actions";

// Skill detail page (Section A). Shows one skill, the jobs that need it and the
// projects that prove it, and lets you write a plan, link projects and fix which
// jobs ask for it.
export default async function SkillDetail({ params }) {
  const { id } = await params;
  const skill = await getSkill(Number(id));
  if (!skill) notFound();

  // Jobs and projects not linked yet, for the "add" dropdowns.
  const linkedJobs = new Set(skill.applications.map((a) => a.id));
  const linkedProjects = new Set(skill.projects.map((p) => p.id));
  const otherJobs = (await getApplications()).filter((a) => !linkedJobs.has(a.id));
  const otherProjects = (await getProjects()).filter((p) => !linkedProjects.has(p.id));

  return (
    <>
      <p>
        <Link href="/skills">All skills</Link>
      </p>
      <h1>{skill.name}</h1>
      <p>
        {skill.have ? "You have this skill." : "You're missing this skill."} Needed by{" "}
        {skill.applications.length} job{skill.applications.length === 1 ? "" : "s"}.
      </p>

      <h2>Details</h2>
      <form action={saveSkill}>
        <input type="hidden" name="skillId" value={skill.id} />
        <p>
          <label>
            <input type="checkbox" name="have" defaultChecked={skill.have} /> I have this skill
          </label>
        </p>
        <p>
          <label htmlFor="aliases">Other names, separated by commas</label>
          <br />
          <input id="aliases" name="aliases" defaultValue={skill.aliases} maxLength={200} />
        </p>
        <p>
          <label htmlFor="plan">Plan to learn or prove it</label>
          <br />
          <textarea id="plan" name="plan" defaultValue={skill.plan} rows={4} cols={50} maxLength={2000} />
        </p>
        <button type="submit">Save</button>
      </form>

      <h2>Projects that prove it</h2>
      {skill.projects.length === 0 ? (
        <p>No project shows this skill yet.</p>
      ) : (
        <ul>
          {skill.projects.map((p) => (
            <li key={p.id}>
              {p.name}{" "}
              <form action={unlinkProject} style={{ display: "inline" }}>
                <input type="hidden" name="skillId" value={skill.id} />
                <input type="hidden" name="projectId" value={p.id} />
                <button type="submit">Unlink</button>
              </form>
            </li>
          ))}
        </ul>
      )}
      {otherProjects.length > 0 && (
        <form action={linkProject}>
          <input type="hidden" name="skillId" value={skill.id} />
          <label htmlFor="projectId">Link a project </label>
          <select id="projectId" name="projectId" required>
            {otherProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>{" "}
          <button type="submit">Link</button>
        </form>
      )}

      <h2>Jobs that need it</h2>
      {skill.applications.length === 0 ? (
        <p>No job asks for this skill yet.</p>
      ) : (
        <ul>
          {skill.applications.map((a) => (
            <li key={a.id}>
              <Link href={`/applications/${a.id}`}>
                {a.role} at {a.company}
              </Link>{" "}
              ({a.stage}){" "}
              <form action={removeFromApplication} style={{ display: "inline" }}>
                <input type="hidden" name="skillId" value={skill.id} />
                <input type="hidden" name="applicationId" value={a.id} />
                <button type="submit">Remove</button>
              </form>
            </li>
          ))}
        </ul>
      )}
      {otherJobs.length > 0 && (
        <form action={addToApplication}>
          <input type="hidden" name="skillId" value={skill.id} />
          <label htmlFor="applicationId">Add to a job </label>
          <select id="applicationId" name="applicationId" required>
            {otherJobs.map((a) => (
              <option key={a.id} value={a.id}>
                {a.role} at {a.company}
              </option>
            ))}
          </select>{" "}
          <button type="submit">Add</button>
        </form>
      )}
    </>
  );
}
