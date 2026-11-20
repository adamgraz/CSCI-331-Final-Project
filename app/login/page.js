import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "@/app/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";
import { login } from "./actions";

export default async function Login() {
  if (await getCurrentUser()) redirect("/");

  return (
    <>
      <h1>Log in</h1>
      <AuthForm action={login} submitLabel="Log in" passwordAutoComplete="current-password" />
      <p>
        No account? <Link href="/signup">Sign up</Link>
      </p>
    </>
  );
}