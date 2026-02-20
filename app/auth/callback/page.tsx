"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) {
          router.replace("/");
          return;
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("Auth callback error:", error);
          router.replace("/");
          return;
        }

        // Successful sign-in, send user to assignment page
        router.replace("/data");
      } catch (err) {
        console.error(err);
        router.replace("/");
      }
    }

    handleCallback();
  }, [router]);

  return <div className="p-8">Signing you in…</div>;
}
