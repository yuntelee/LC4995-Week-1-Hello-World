"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      try {
        const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });

        if (error) {
          console.error("Auth callback error:", error);
          router.replace("/");
          return;
        }

        // Successful sign-in, send user to gated page
        router.replace("/gated");
      } catch (err) {
        console.error(err);
        router.replace("/");
      }
    }

    handleCallback();
  }, [router]);

  return <div className="p-8">Signing you in…</div>;
}
