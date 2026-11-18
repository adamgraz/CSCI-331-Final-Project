import Link from "next/link";

// Skills gap for one job (Section A). Shown on the job detail page.
// application comes from getApplication(id), where each skill has a have flag
// and the projects that prove it.
export default function SkillsGap({ application }) {
  const have = application.skills.filter((s) => s.have);
  const missing = application.skills.filter((s) => !s.have);

  if (application.skills.length === 0) {
    return (
      <section>
        <h2>Skills gap</h2>
        <p>No skills found in this posting yet.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Skills gap</h2>
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
    </section>
  );
}
