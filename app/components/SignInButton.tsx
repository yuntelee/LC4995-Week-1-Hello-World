"use client";

import { createClient } from "@/utils/supabase/client";

const GOOGLE_CLIENT_ID =
  "388960353527-fh4grc6mla425lg0e3g1hh67omtrdihd.apps.googleusercontent.com";

export default function SignInButton() {
  async function handleSignIn() {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          client_id: GOOGLE_CLIENT_ID,
        },
      },
    });
  }

  return (
    <button
      onClick={handleSignIn}
      className="rounded-md bg-foreground px-4 py-2 text-background transition-opacity hover:opacity-90"
    >
      Sign in with Google
    </button>
  );
}
