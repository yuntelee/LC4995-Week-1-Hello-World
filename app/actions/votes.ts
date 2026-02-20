"use server";

import { createClient } from "@/utils/supabase/server";

export async function submitVote({
  captionId,
  voteType,
}: {
  captionId: string;
  voteType: "upvote" | "downvote";
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in to vote." };
    }

    if (voteType === "downvote") {
      return {
        success: false,
        error:
          "Downvote is not supported by the current schema. Only upvote is available in caption_likes.",
      };
    }

    const { error } = await supabase.from("caption_likes").insert({
      caption_id: captionId,
      profile_id: user.id,
    });

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "You already voted on this caption." };
      }

      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error",
    };
  }
}
