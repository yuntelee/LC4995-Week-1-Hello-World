import { createClient } from "@/utils/supabase/server";
import { CaptionCardClient } from "@/app/components/CaptionCardClient";

export const dynamic = "force-dynamic";

type CaptionRow = {
  id: string;
  content: string | null;
  like_count: number;
  image: { url: string | null } | Array<{ url: string | null }> | null;
};

type VoteRow = {
  caption_id: string;
};

function getImageUrl(row: CaptionRow): string | null {
  if (!row.image) return null;
  if (Array.isArray(row.image)) return row.image[0]?.url ?? null;
  return row.image.url;
}

export default async function DataPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoggedIn = !!user;

  const { data: captionsData, error: captionsError } = await supabase
    .from("captions")
    .select("id, content, like_count, image:images!captions_image_id_fkey(url)")
    .eq("is_public", true)
    .order("like_count", { ascending: false })
    .limit(30);

  if (captionsError) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-4xl p-8">
        <h1 className="mb-4 text-3xl font-semibold">Caption Voting</h1>
        <p className="text-red-600">Failed to load captions: {captionsError.message}</p>
      </main>
    );
  }

  const captions = (captionsData ?? []) as CaptionRow[];
  const captionIds = captions.map((caption) => caption.id);

  const voteMap = new Map<string, "upvote" | "downvote">();

  if (isLoggedIn && captionIds.length > 0) {
    const { data: votesData } = await supabase
      .from("caption_likes")
      .select("caption_id")
      .eq("profile_id", user.id)
      .in("caption_id", captionIds);

    ((votesData ?? []) as VoteRow[]).forEach((vote) => {
      voteMap.set(vote.caption_id, "upvote");
    });
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl p-8">
      <h1 className="mb-2 text-3xl font-semibold">Caption Voting</h1>
      <p className="mb-6 text-sm text-foreground/70">
        {isLoggedIn
          ? "You are logged in. You can submit one vote per caption."
          : "You are not logged in. Voting is disabled."}
      </p>

      <ul className="space-y-4">
        {captions.map((caption) => (
          <CaptionCardClient
            key={caption.id}
            captionId={caption.id}
            content={caption.content}
            imageUrl={getImageUrl(caption)}
            likeCount={caption.like_count}
            isLoggedIn={isLoggedIn}
            initialVote={voteMap.get(caption.id) ?? null}
          />
        ))}
      </ul>
    </main>
  );
}
