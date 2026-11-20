"use client";

import { useActionState } from "react";

export default function AuthForm({ action, submitLabel, passwordAutoComplete }) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="auth-form">
      <label>
        Username
        <input name="username" required autoComplete="username" />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete={passwordAutoComplete}
        />
      </label>
      {state?.error && <p role="alert">{state.error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? "Working..." : submitLabel}
      </button>
    </form>
  );
}