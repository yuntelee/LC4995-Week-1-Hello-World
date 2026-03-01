import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const API_BASE_URL = "https://api.almostcrackd.ai";

export const SUPPORTED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
]);

type ErrorResponse = {
  error: string;
  details?: string;
};

function toErrorResponse(message: string, details?: string, status = 400) {
  return NextResponse.json<ErrorResponse>({ error: message, details }, { status });
}

export async function getAccessToken() {
  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    return {
      token: null,
      response: toErrorResponse("Unable to validate auth session.", error.message, 401),
    };
  }

  if (!session?.access_token) {
    return {
      token: null,
      response: toErrorResponse("You must be signed in to use the caption pipeline.", undefined, 401),
    };
  }

  return { token: session.access_token, response: null };
}

export async function postToPipeline<TBody extends object>(
  path: string,
  token: string,
  body: TBody
) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await response.text();

  if (!text) {
    if (response.ok) {
      return { data: null, response: null };
    }

    return {
      data: null,
      response: toErrorResponse("Pipeline request failed.", `HTTP ${response.status}`, response.status),
    };
  }

  try {
    const data = JSON.parse(text);

    if (!response.ok) {
      const details =
        typeof data?.error === "string"
          ? data.error
          : typeof data?.message === "string"
            ? data.message
            : text;

      return {
        data: null,
        response: toErrorResponse("Pipeline request failed.", details, response.status),
      };
    }

    return { data, response: null };
  } catch {
    if (!response.ok) {
      return {
        data: null,
        response: toErrorResponse("Pipeline request failed.", text, response.status),
      };
    }

    return { data: text, response: null };
  }
}

export function badRequest(message: string) {
  return toErrorResponse(message, undefined, 400);
}
