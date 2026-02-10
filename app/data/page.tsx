import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

type CaptionRow = {
  id: string;
  content: string | null;
  like_count: number;
  created_datetime_utc: string;
};

type ImageRow = {
  id: string;
  url: string | null;
};

type CaptionWithImage = CaptionRow & {
  imageUrl: string | null;
};

function CaptionCard({ caption }: { caption: CaptionWithImage }) {
  const formattedDate = new Date(caption.created_datetime_utc).toLocaleDateString();

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-purple-500 transition shadow-lg">
      {caption.imageUrl ? (
        <div className="relative w-full h-48 bg-slate-900 overflow-hidden">
          <img
            src={caption.imageUrl}
            alt={caption.content || "Caption image"}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
          <span className="text-slate-500">No image</span>
        </div>
      )}

      <div className="p-4">
        <p className="text-white text-lg font-semibold mb-3 line-clamp-3">
          {caption.content || "No caption"}
        </p>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">{formattedDate}</span>
          <div className="flex items-center gap-1 bg-purple-900/30 px-3 py-1 rounded-full">
            <span className="text-purple-300">♥</span>
            <span className="text-purple-300 font-semibold">{caption.like_count}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function DataPage() {
  try {
    const supabase = await createClient();

    const { data: captionsData, error: captionsError } = await supabase
      .from("captions") // change to "caption" if that's the real table name
      .select("id, content, like_count, created_datetime_utc")
      .order("like_count", { ascending: false })
      .limit(50);

    if (captionsError) throw captionsError;

    const captions = (captionsData ?? []) as CaptionRow[];

    if (captions.length === 0) {
      return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
          <div className="max-w-6xl mx-auto">
            <Link href="/">
              <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition mb-6">
                ← Back to Home
              </button>
            </Link>
            <div className="bg-slate-800 border border-slate-700 text-slate-300 p-4 rounded-lg">
              No captions found.
            </div>
          </div>
        </main>
      );
    }

    // images.id == captions.id
    const captionIds = captions.map((c) => c.id);

    const { data: imagesData, error: imagesError } = await supabase
      .from("images")
      .select("id, url")
      .in("id", captionIds);

    if (imagesError) throw imagesError;

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
                Showing {captionsWithImages.length} caption
                {captionsWithImages.length !== 1 ? "s" : ""} with images
              </p>
            </div>
            <Link href="/">
              <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
                ← Back
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {captionsWithImages.map((caption) => (
              <CaptionCard key={caption.id} caption={caption} />
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-700">
            <h2 className="text-sm font-mono text-slate-400 mb-4">Debug: Raw Data</h2>
            <pre className="bg-slate-900 p-4 rounded text-xs text-slate-300 overflow-x-auto">
              {JSON.stringify(captionsWithImages.slice(0, 2), null, 2)}
            </pre>
          </div>
        </div>
      </main>
    );
  } catch (err) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
          <Link href="/">
            <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition mb-6">
              ← Back to Home
            </button>
          </Link>
          <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-lg">
            <p className="font-semibold">Error rendering page:</p>
            <p className="text-sm mt-1">{err instanceof Error ? err.message : String(err)}</p>
          </div>
        </div>
      </main>
    );
  }
}
