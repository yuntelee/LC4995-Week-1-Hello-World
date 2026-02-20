import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import SignInButton from "@/app/components/SignInButton";
import SignOutButton from "@/app/components/SignOutButton";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoggedIn = !!user;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-5xl font-bold tracking-tight">Hello World</h1>
      <p className="text-lg text-foreground/80">
        Week 3 + Week 4 app: Google OAuth, protected route, and vote mutation.
      </p>

      {isLoggedIn ? (
        <p className="text-sm text-foreground/70">Signed in as {user.email ?? user.id}</p>
      ) : (
        <p className="text-sm text-foreground/70">You must sign in to access /gated.</p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {isLoggedIn ? <SignOutButton /> : <SignInButton />}
        <Link href="/data" className="rounded-md border border-foreground/30 px-4 py-2">
          Open Voting Page
        </Link>
      </div>
    </main>
  );
}
