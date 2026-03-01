"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
];

type PipelineResult = {
  cdnUrl: string;
  imageId: string;
  captionsPayload: unknown;
};

type CaptionPipelineClientProps = {
  isLoggedIn: boolean;
};

function extractCaptions(payload: unknown): string[] {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    const values = payload.flatMap((item) => extractCaptions(item));
    return [...new Set(values)];
  }

  if (typeof payload === "string") {
    return [payload];
  }

  if (typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    const directKeys = ["caption", "content", "text"];
    const listKeys = ["captions", "results", "items", "data"];

    const directValues = directKeys
      .map((key) => obj[key])
      .filter((value): value is string => typeof value === "string");

    const nestedValues = listKeys.flatMap((key) => extractCaptions(obj[key]));
    return [...new Set([...directValues, ...nestedValues])];
  }

  return [];
}

async function postJson<TResponse>(url: string, body: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => null)) as
    | (TResponse & { error?: string; details?: string })
    | null;

  if (!response.ok) {
    const message = data?.details ?? data?.error ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (!data) {
    throw new Error("API response was empty.");
  }

  return data;
}

export function CaptionPipelineClient({ isLoggedIn }: CaptionPipelineClientProps) {
  const [file, setFile] = useState<File | null>(null);
  const [stepMessage, setStepMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);

  const captions = useMemo(() => extractCaptions(result?.captionsPayload), [result?.captionsPayload]);

  async function handleRunPipeline() {
    if (!file || isRunning || !isLoggedIn) return;

    const normalizedType = file.type.toLowerCase();

    if (!ACCEPTED_TYPES.includes(normalizedType)) {
      setError(`Unsupported file type: ${file.type || "unknown"}`);
      return;
    }

    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      setStepMessage("Step 1/4: Generating presigned upload URL...");
      const presigned = await postJson<{ presignedUrl: string; cdnUrl: string }>(
        "/api/pipeline/generate-presigned-url",
        {
          contentType: normalizedType,
        }
      );

      if (!presigned.presignedUrl || !presigned.cdnUrl) {
        throw new Error("Missing presignedUrl or cdnUrl from pipeline.");
      }

      setStepMessage("Step 2/4: Uploading image bytes to presigned URL...");
      const uploadResponse = await fetch(presigned.presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": normalizedType,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Image upload failed with status ${uploadResponse.status}`);
      }

      setStepMessage("Step 3/4: Registering uploaded image in pipeline...");
      const registerResponse = await postJson<{ imageId: string }>(
        "/api/pipeline/upload-image-from-url",
        {
          imageUrl: presigned.cdnUrl,
          isCommonUse: false,
        }
      );

      if (!registerResponse.imageId) {
        throw new Error("Missing imageId from upload-image-from-url response.");
      }

      setStepMessage("Step 4/4: Generating captions...");
      const captionsPayload = await postJson<unknown>(
        "/api/pipeline/generate-captions",
        {
          imageId: registerResponse.imageId,
        }
      );

      setResult({
        cdnUrl: presigned.cdnUrl,
        imageId: registerResponse.imageId,
        captionsPayload,
      });
      setStepMessage("Done: captions generated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error during caption generation.");
      setStepMessage(null);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <section className="mb-8 rounded-lg border border-black/10 p-4 dark:border-white/20">
      <h2 className="mb-2 text-xl font-semibold">Upload Image and Generate Captions</h2>
      <p className="mb-4 text-sm text-foreground/70">
        This runs: presigned URL → upload bytes → register image URL → generate captions.
      </p>

      <div className="flex flex-col gap-3">
        <input
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          disabled={!isLoggedIn || isRunning}
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="block w-full text-sm"
        />

        <button
          onClick={handleRunPipeline}
          disabled={!isLoggedIn || !file || isRunning}
          className="w-fit rounded-md border border-foreground/30 px-4 py-2 text-sm disabled:opacity-50"
        >
          {isRunning ? "Running pipeline..." : "Generate Captions"}
        </button>
      </div>

      {!isLoggedIn ? <p className="mt-3 text-sm text-foreground/70">Sign in to use this feature.</p> : null}
      {stepMessage ? <p className="mt-3 text-sm text-foreground/80">{stepMessage}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {result ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-foreground/80">Image ID: {result.imageId}</p>
          <Image
            src={result.cdnUrl}
            alt="Uploaded image"
            width={1200}
            height={560}
            unoptimized
            className="h-56 w-full rounded-md object-cover"
          />

          {captions.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {captions.map((caption, index) => (
                <li key={`${caption}-${index}`}>{caption}</li>
              ))}
            </ul>
          ) : (
            <pre className="overflow-auto rounded-md border border-foreground/20 p-3 text-xs">
              {JSON.stringify(result.captionsPayload, null, 2)}
            </pre>
          )}
        </div>
      ) : null}
    </section>
  );
}
