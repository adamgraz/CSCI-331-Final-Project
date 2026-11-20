import ApplicationForm from "@/app/components/ApplicationForm";
import { addApplication } from "../actions";

export default function NewApplication() {
  return (
    <>
      <h1>Add application</h1>
      <ApplicationForm action={addApplication} submitLabel="Save application" />
    </>
  );
}