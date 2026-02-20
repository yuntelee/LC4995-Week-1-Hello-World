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
      const { error } = await supabase
        .from("caption_likes")
        .delete()
        .eq("caption_id", captionId)
        .eq("profile_id", user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, currentVote: null, message: "Downvote applied." };
    }

    const { error } = await supabase.from("caption_likes").insert({
      caption_id: captionId,
      profile_id: user.id,
    });

    if (error) {
      if (error.code === "23505") {
        return {
          success: true,
          currentVote: "upvote",
          message: "You already upvoted this caption.",
        };
      }

      return { success: false, error: error.message };
    }

    return { success: true, currentVote: "upvote", message: "Upvote saved." };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error",
    };
  }
}
