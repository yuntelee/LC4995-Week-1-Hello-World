"use client";

import { useState } from "react";
import { submitVote } from "@/app/actions/votes";

type CaptionWithImage = {
  id: string;
  content: string | null;
  like_count: number;
  created_datetime_utc: string;
  imageUrl: string | null;
};

type UserVote = "upvote" | "downvote" | null;

export function CaptionCard({
  caption,
  isLoggedIn,
  userVote: initialUserVote,
}: {
  caption: CaptionWithImage;
  isLoggedIn: boolean;
  userVote: UserVote;
}) {
  const [userVote, setUserVote] = useState<UserVote>(initialUserVote);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formattedDate = new Date(caption.created_datetime_utc).toLocaleDateString();

  async function handleVote(voteType: "upvote" | "downvote") {
    if (!isLoggedIn) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitVote({
        captionId: caption.id,
        voteType,
      });

      if (result.success) {
        setUserVote(voteType);
      } else {
        alert(result.error || "Failed to submit vote");
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      alert("An error occurred while submitting your vote");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-purple-500 transition shadow-lg flex flex-col h-full">
      {caption.imageUrl ? (
        <div className="relative w-full h-48 bg-slate-900 overflow-hidden">
          <img
            src={caption.imageUrl}
            alt={caption.content || "Caption image"}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
          <span className="text-slate-500">No image</span>
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col justify-between">
        <p className="text-white text-lg font-semibold mb-3 line-clamp-3">
          {caption.content || "No caption"}
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">{formattedDate}</span>
            <div className="flex items-center gap-1 bg-purple-900/30 px-3 py-1 rounded-full">
              <span className="text-purple-300">♥</span>
              <span className="text-purple-300 font-semibold">{caption.like_count}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleVote("upvote")}
              disabled={!isLoggedIn || isSubmitting}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all ${
                userVote === "upvote"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              👍 Upvote
            </button>
            <button
              onClick={() => handleVote("downvote")}
              disabled={!isLoggedIn || isSubmitting}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all ${
                userVote === "downvote"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              👎 Downvote
            </button>
          </div>

          {!isLoggedIn ? (
            <p className="text-xs text-slate-400">Sign in to rate captions.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
