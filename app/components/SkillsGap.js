import Link from "next/link";
import { getSkills } from "@/lib/data";
import { addToApplication } from "@/app/skills/actions";

// Skills gap for one job (Section A). Shown on the job detail page.
// application comes from getApplication(id), where each skill has a have flag
// and the projects that prove it. The dropdown at the bottom adds a skill the
// posting didn't mention, so the job page doesn't need its own skills code.
export default async function SkillsGap({ application }) {
  const have = application.skills.filter((s) => s.have);
  const missing = application.skills.filter((s) => !s.have);
  const linked = new Set(application.skills.map((s) => s.id));
  const otherSkills = (await getSkills()).filter((s) => !linked.has(s.id));

  return (
    <section>
      <h2>Skills gap</h2>
      {application.skills.length === 0 ? (
        <p>No skills found in this posting yet.</p>
      ) : (
        <>
          <p>
            You have {have.length} of {application.skills.length} skills for this job.
          </p>

          <h3>Have</h3>
          {have.length === 0 ? (
            <p>None yet.</p>
          ) : (
            <ul>
              {have.map((s) => (
                <li key={s.id}>
                  <Link href={`/skills/${s.id}`}>{s.name}</Link>
                  {s.projects.length > 0
                    ? `, shown by ${s.projects.map((p) => p.name).join(", ")}`
                    : ", no project shows it yet"}
                </li>
              ))}
            </ul>
          )}

          <h3>Missing</h3>
          {missing.length === 0 ? (
            <p>Nothing missing.</p>
          ) : (
            <ul>
              {missing.map((s) => (
                <li key={s.id}>
                  <Link href={`/skills/${s.id}`}>{s.name}</Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {otherSkills.length > 0 && (
        <form action={addToApplication}>
          <input type="hidden" name="applicationId" value={application.id} />
          <label htmlFor="skillId">Add a skill this job needs </label>
          <select id="skillId" name="skillId" required>
            {otherSkills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>{" "}
          <button type="submit">Add</button>
        </form>
      )}
    </section>
  );
}
