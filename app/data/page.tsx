import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Caption {
  id: string;
  content: string | null;
  like_count: number;
  created_datetime_utc: string;
  image_id: string | null;
  image: { url: string | null }[] | null; // <-- array
}

function CaptionCard({ caption }: { caption: Caption }) {
  const imageUrl = caption.image?.[0]?.url ?? null; // <-- first row
  const formattedDate = new Date(caption.created_datetime_utc).toLocaleDateString();

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-purple-500 transition shadow-lg">
      {imageUrl ? (
        <div className="relative w-full h-48 bg-slate-900 overflow-hidden">
          <img
            src={imageUrl}
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
  const supabase = await createClient();

  const { data: captions, error } = await supabase
    .from("captions") // change to "caption" if that's your real name
    .select(
      `
      id,
      content,
      like_count,
      created_datetime_utc,
      image_id,
      image:images(url)
    `
    )
    .order("like_count", { ascending: false })
    .limit(50);

  if (error) throw error;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Captions & Images</h1>
            <p className="text-slate-300">Showing {captions?.length ?? 0} captions</p>
          </div>
          <Link href="/">
            <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
              ← Back
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(captions ?? []).map((caption) => (
            <CaptionCard key={caption.id} caption={caption as Caption} />
          ))}
        </div>
      </div>
    </main>
  );
}
