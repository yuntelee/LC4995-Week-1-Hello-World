import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function GatedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl p-8">
      <h1 className="mb-4 text-3xl font-semibold">Protected Route</h1>
      <p className="text-foreground/80">You are authenticated and can access this page.</p>
      <p className="mt-3 text-sm text-foreground/70">Signed in as: {user.email ?? user.id}</p>
    </main>
  );
}
