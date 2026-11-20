"use server";

import { redirect } from "next/navigation";
import { checkLogin, createUser, startSession, endSession } from "@/lib/auth";

const USERNAME_PATTERN = /^[A-Za-z0-9_-]{3,32}$/;

function read(formData) {
  return {
    username: String(formData.get("username") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function signup(previousState, formData) {
  const { username, password } = read(formData);

  if (!USERNAME_PATTERN.test(username)) {
    return { error: "Username must be 3 to 32 letters, numbers, dashes or underscores." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const userId = await createUser(username, password);
  if (userId === null) return { error: "That username is taken." };

  await startSession(userId);
  redirect("/");
}

export async function login(previousState, formData) {
  const { username, password } = read(formData);

  const userId = await checkLogin(username, password);
  if (userId === null) return { error: "Wrong username or password." };

  await startSession(userId);
  redirect("/");
}

export async function logout() {
  await endSession();
  redirect("/login");
}