import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { CaptionCard } from "@/app/components/CaptionCardClient";
import SignInButton from "@/app/components/SignInButton";

export const dynamic = "force-dynamic";

type CaptionRow = {
  id: string;
  content: string | null;
  like_count: number;
  created_datetime_utc: string;
};

type ImageRow = { id: string; url: string | null };

type CaptionWithImage = CaptionRow & { imageUrl: string | null };

export default async function DataPage() {
  const supabase = await createClient();

  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isLoggedIn = !!session?.user;
  const userId = session?.user?.id;

  const { data: captionsData, error: captionsError } = await supabase
    .from("captions")
    .select("id, content, like_count, created_datetime_utc")
    .order("like_count", { ascending: false })
    .limit(50);

  if (captionsError) throw captionsError;

  const captions = (captionsData ?? []) as CaptionRow[];
  const captionIds = captions.map((c) => c.id);

  const { data: imagesData, error: imagesError } = await supabase
    .from("images")
    .select("id, url")
    .in("id", captionIds);

  if (imagesError) throw imagesError;

  // Fetch user votes if logged in
  const userVotesMap = new Map<string, "upvote" | "downvote">();
  if (isLoggedIn && userId) {
    const { data: votesData } = await supabase
      .from("caption_votes")
      .select("caption_id, vote_type")
      .eq("user_id", userId)
      .in("caption_id", captionIds);

    (votesData ?? []).forEach((v) => {
      if (
        v?.caption_id &&
        (v?.vote_type === "upvote" || v?.vote_type === "downvote")
      ) {
        userVotesMap.set(v.caption_id, v.vote_type);
      }
    });
  }

  const images = (imagesData ?? []) as ImageRow[];

  const imageMap = new Map<string, string | null>(images.map((i) => [i.id, i.url]));
  const captionsWithImages: CaptionWithImage[] = captions.map((c) => ({
    ...c,
    imageUrl: imageMap.get(c.id) ?? null,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Captions & Images</h1>
            <p className="text-slate-300">
              Showing {captionsWithImages.length} captions
              {isLoggedIn && " • Logged in"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isLoggedIn ? <SignInButton /> : null}
            <Link href="/">
              <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
                ← Back
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {captionsWithImages.map((caption) => (
            <CaptionCard
              key={caption.id}
              caption={caption}
              isLoggedIn={isLoggedIn}
              userVote={userVotesMap.get(caption.id) ?? null}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
