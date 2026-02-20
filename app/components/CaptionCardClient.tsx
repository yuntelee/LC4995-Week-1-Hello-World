"use client";

import { useState } from "react";
import { submitVote } from "@/app/actions/votes";

type CaptionCardProps = {
  captionId: string;
  content: string | null;
  imageUrl: string | null;
  likeCount: number;
  isLoggedIn: boolean;
  initialVote: "upvote" | "downvote" | null;
};

export function CaptionCardClient({
  captionId,
  content,
  imageUrl,
  likeCount,
  isLoggedIn,
  initialVote,
}: CaptionCardProps) {
  const [vote, setVote] = useState<"upvote" | "downvote" | null>(initialVote);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleVote(voteType: "upvote" | "downvote") {
    if (!isLoggedIn || isSubmitting) return;

    setIsSubmitting(true);
    setMessage(null);

    const result = await submitVote({ captionId, voteType });

    if (result.success) {
      setVote(voteType);
      setMessage("Vote saved.");
    } else {
      setMessage(result.error ?? "Could not save vote.");
    }

    setIsSubmitting(false);
  }

  return (
    <li className="rounded-lg border border-black/10 p-4 dark:border-white/20">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={content ?? "caption image"}
          className="mb-3 h-48 w-full rounded-md object-cover"
        />
      ) : null}

      <p className="mb-2 text-base">{content ?? "(no caption content)"}</p>
      <p className="mb-3 text-sm text-foreground/70">Current likes: {likeCount}</p>

      <div className="mb-2 flex gap-2">
        <button
          onClick={() => handleVote("upvote")}
          disabled={!isLoggedIn || isSubmitting}
          className={`rounded-md px-3 py-2 text-sm ${
            vote === "upvote" ? "bg-green-600 text-white" : "border border-foreground/30"
          } disabled:opacity-50`}
        >
          Upvote
        </button>
        <button
          onClick={() => handleVote("downvote")}
          disabled
          className={`rounded-md px-3 py-2 text-sm ${
            vote === "downvote" ? "bg-red-600 text-white" : "border border-foreground/30"
          } disabled:opacity-50`}
        >
          Downvote (N/A)
        </button>
      </div>

      {!isLoggedIn ? <p className="text-xs text-foreground/70">Sign in to vote.</p> : null}
      <p className="text-xs text-foreground/70">Current schema supports upvotes in caption_likes only.</p>
      {message ? <p className="text-xs text-foreground/70">{message}</p> : null}
      <p className="mt-2 text-xs text-foreground/60">Caption ID: {captionId}</p>
    </li>
  );
}
