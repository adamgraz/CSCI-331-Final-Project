import { notFound } from "next/navigation";
import { getApplication } from "@/lib/data";
import SkillsGap from "@/app/components/SkillsGap";

// Job detail page (Section B). The skills gap section belongs to Section A.
export default async function ApplicationDetail({ params }) {
  const { id } = await params;
  const application = await getApplication(Number(id));
  if (!application) notFound();

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

      <SkillsGap application={application} />
    </>
  );
}
