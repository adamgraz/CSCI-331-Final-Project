import { notFound } from "next/navigation";
import { getApplication } from "@/lib/data";

// Job detail page (Section B). The skills gap section belongs to Section A.
export default async function ApplicationDetail({ params }) {
  const { id } = await params;
  const application = await getApplication(Number(id));
  if (!application) notFound();

  const have = application.skills.filter((s) => s.have);
  const missing = application.skills.filter((s) => !s.have);

  return (
    <>
      <h1>
        {application.role} at {application.company}
      </h1>
      <p>Stage: {application.stage}</p>
      {application.notes && <p>{application.notes}</p>}

      <h2>Stage history</h2>
      <ul>
        {application.stageChanges.map((c) => (
          <li key={`${c.stage}-${c.changed_at}`}>
            {c.stage} on {c.changed_at}
          </li>
        ))}
      </ul>

      <h2>Skills gap</h2>
      <p>
        You have {have.length} of {application.skills.length} skills for this job.
      </p>
      <p>Have: {have.map((s) => s.name).join(", ") || "none"}</p>
      <p>Missing: {missing.map((s) => s.name).join(", ") || "none"}</p>
    </>
  );
}
