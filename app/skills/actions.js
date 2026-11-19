"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import {
  addApplicationSkill,
  createSkill,
  linkProjectSkill,
  removeApplicationSkill,
  unlinkProjectSkill,
  updateSkill,
} from "@/lib/data";

// Server Actions for the skills pages (Section A). Each one is the action of a plain
// <form>, so the pages work without any client-side JavaScript. Ids arrive as text in
// hidden inputs, so they're checked before use.

function id(formData, field) {
  const value = Number(formData.get(field));
  if (!Number.isInteger(value) || value < 1) throw new Error(`Invalid ${field}`);
  return value;
}

// Trimmed text, cut to a maximum length so one form can't fill the database.
function text(formData, field, max) {
  return String(formData.get(field) ?? "").trim().slice(0, max);
}

// Adds a skill, then opens its page. An existing name opens that skill instead.
export async function addSkill(formData) {
  const name = text(formData, "name", 50);
  if (!name) return;
  const skillId = await createSkill(name, text(formData, "aliases", 200));
  redirect(`/skills/${skillId}`);
}

export async function saveSkill(formData) {
  await updateSkill(id(formData, "skillId"), {
    aliases: text(formData, "aliases", 200),
    have: formData.get("have") === "on",
    plan: text(formData, "plan", 2000),
  });
  refresh();
}

export async function linkProject(formData) {
  await linkProjectSkill(id(formData, "projectId"), id(formData, "skillId"));
  refresh();
}

export async function unlinkProject(formData) {
  await unlinkProjectSkill(id(formData, "projectId"), id(formData, "skillId"));
  refresh();
}

export async function addToApplication(formData) {
  await addApplicationSkill(id(formData, "applicationId"), id(formData, "skillId"));
  refresh();
}

export async function removeFromApplication(formData) {
  await removeApplicationSkill(id(formData, "applicationId"), id(formData, "skillId"));
  refresh();
}
