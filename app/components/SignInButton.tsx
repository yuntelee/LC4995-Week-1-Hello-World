"use client";

import { supabase } from "@/lib/supabase";

export default function SignInButton() {
  async function handleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          client_id:
            "388960353527-fh4grc6mla425lg0e3g1hh67omtrdihd.apps.googleusercontent.com",
        },
      },
    });
  }

  return (
    <button
      onClick={handleSignIn}
      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/50 hover:scale-105"
    >
      Sign in with Google
    </button>
  );
}
