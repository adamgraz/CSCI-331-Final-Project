"use client";

import { useActionState } from "react";

export default function ApplicationForm({ action, submitLabel, initialValues }) {
  const [state, formAction, pending] = useActionState(action, null);
  const values = state?.values ?? initialValues ?? {};

  return (
    <form action={formAction} className="app-form">
      <label>
        Company
        <input name="company" required maxLength={200} defaultValue={values.company ?? ""} />
      </label>
      <label>
        Role
        <input name="role" required maxLength={200} defaultValue={values.role ?? ""} />
      </label>
      <label>
        Posting link (optional)
        <input
          name="postingUrl"
          type="url"
          placeholder="https://"
          defaultValue={values.postingUrl ?? ""}
        />
      </label>
      <label>
        Posting text
        <textarea
          name="postingText"
          rows={10}
          maxLength={20000}
          defaultValue={values.postingText ?? ""}
        />
      </label>
      {state?.error && <p role="alert">{state.error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}