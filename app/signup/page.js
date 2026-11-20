import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "@/app/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";
import { signup } from "../login/actions";

export default async function Signup() {
  if (await getCurrentUser()) redirect("/");

  return (
    <>
      <h1>Sign up</h1>
      <AuthForm action={signup} submitLabel="Create account" passwordAutoComplete="new-password" />
      <p>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </>
  );
}