import Link from "next/link";
import { getSkills } from "@/lib/data";
import { addSkill } from "./actions";

// Skills page (Section A). Every skill, whether you have it, how many jobs need it
// and how many projects prove it. Missing skills that jobs ask for are the gaps.
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
              <td>
                <Link href={`/skills/${s.id}`}>{s.name}</Link>
              </td>
              <td>{s.have ? "Yes" : s.job_count > 0 ? "No, a gap" : "No"}</td>
              <td>{s.job_count}</td>
              <td>{s.project_count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Add a skill</h2>
      <p>Saved job postings are checked for the new skill right away.</p>
      <form action={addSkill}>
        <label htmlFor="name">Name </label>
        <input id="name" name="name" required maxLength={50} />{" "}
        <label htmlFor="new-aliases">Other names </label>
        <input id="new-aliases" name="aliases" placeholder="k8s, kube" maxLength={200} />{" "}
        <button type="submit">Add</button>
      </form>
    </>
  );
}
