import Link from "next/link";
import { getApplications } from "@/lib/data";

// Applications list (Section B). Starter version without search, sort, or filters.
export default async function Applications() {
  const applications = await getApplications();

  return (
    <>
      <h1>Applications</h1>
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Role</th>
            <th>Stage</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((a) => (
            <tr key={a.id}>
              <td>
                <Link href={`/applications/${a.id}`}>{a.company}</Link>
              </td>
              <td>{a.role}</td>
              <td>{a.stage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
