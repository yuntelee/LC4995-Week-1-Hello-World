import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    // No code means user arrived manually or error
    return NextResponse.redirect(new URL("/", requestUrl.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback exchange error:", error.message);
    return NextResponse.redirect(new URL("/", requestUrl.origin));
  }

  // Session established, redirect to voting page
  return NextResponse.redirect(new URL("/data", requestUrl.origin));
}
