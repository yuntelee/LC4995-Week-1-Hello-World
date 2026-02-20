import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "@/app/components/SignOutButton";

export default async function GatedPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // redirect to home if not signed in
    redirect("/");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl w-full bg-white/5 p-8 rounded-lg border border-white/10">
        <h1 className="text-3xl font-bold mb-4">Gated Content</h1>
        <p className="mb-4">Welcome, {user?.email ?? user?.id} — you're signed in.</p>
        <div className="mt-6">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
