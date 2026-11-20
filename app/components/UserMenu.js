import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/login/actions";

export default async function UserMenu() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <Link href="/login">Log in</Link>
        <Link href="/signup">Sign up</Link>
      </>
    );
  }

  return (
    <form action={logout}>
      <span>{user.username}</span> <button type="submit">Log out</button>
    </form>
  );
}