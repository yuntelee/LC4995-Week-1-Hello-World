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

    // Get the current user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to vote",
      };
    }

    const userId = session.user.id;

    // Insert a new vote row (mutating data)
    const { error: insertError } = await supabase.from("caption_votes").insert({
      caption_id: captionId,
      user_id: userId,
      vote_type: voteType,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      // Common case: table enforces one-vote-per-user-per-caption via unique constraint
      if (insertError.code === "23505") {
        return {
          success: false,
          error: "You already voted on this caption",
        };
      }

      throw insertError;
    }

    return {
      success: true,
      message: "Vote submitted",
    };
  } catch (error) {
    console.error("Error submitting vote:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
