import { getStageCounts } from "@/lib/data";

// Dashboard (Section C). Starter version that lists how many jobs are at each stage.
export default async function Dashboard() {
  const counts = await getStageCounts();

  return (
    <>
      <h1>Dashboard</h1>
      <ul>
        {counts.map((c) => (
          <li key={c.stage}>
            {c.stage}: {c.count}
          </li>
        ))}
      </ul>
    </>
  );
}
