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

    const { error } = await supabase.from("caption_votes").insert({
      caption_id: captionId,
      profile_id: user.id,
      vote_type: voteType,
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
