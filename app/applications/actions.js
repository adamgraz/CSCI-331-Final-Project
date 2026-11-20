"use server";

import { redirect } from "next/navigation";
import { createApplication } from "@/lib/data";
// After Adam's skills-matching branch is merged, also import matchApplicationSkills
// from "@/lib/data" and uncomment the call below.

function isWebUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function addApplication(previousState, formData) {
  const values = {
    company: String(formData.get("company") ?? "").trim(),
    role: String(formData.get("role") ?? "").trim(),
    postingUrl: String(formData.get("postingUrl") ?? "").trim(),
    postingText: String(formData.get("postingText") ?? "").trim(),
  };

  // Returning the values lets the form keep what the user typed.
  const fail = (error) => ({ error, values });

  if (!values.company) return fail("Company is required.");
  if (!values.role) return fail("Role is required.");
  if (values.company.length > 200 || values.role.length > 200) {
    return fail("Company and role must be 200 characters or fewer.");
  }
  if (values.postingUrl && !isWebUrl(values.postingUrl)) {
    return fail("The link must start with http:// or https://.");
  }
  if (values.postingText.length > 20000) {
    return fail("The posting text is too long (20,000 characters max).");
  }

  const id = await createApplication({
    company: values.company,
    role: values.role,
    postingUrl: values.postingUrl || null,
    postingText: values.postingText,
  });

  // await matchApplicationSkills(id, values.postingText);

  // The detail page is rendered fresh after the redirect, so refresh() isn't needed here.
  redirect(`/applications/${id}`);
}