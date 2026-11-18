import { getSkills } from "@/lib/data";

// Skills page (Section A). Starter version that lists every skill.
export default async function Skills() {
  const skills = await getSkills();

  return (
    <>
      <h1>Skills</h1>
      <table>
        <thead>
          <tr>
            <th>Skill</th>
            <th>Have it</th>
            <th>Jobs that need it</th>
            <th>Projects that show it</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.have ? "Yes" : "No"}</td>
              <td>{s.job_count}</td>
              <td>{s.project_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
