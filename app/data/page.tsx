import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

// Force dynamic rendering because we use cookies() for Supabase auth
export const dynamic = "force-dynamic";

interface Image {
  id: string;
  url: string;
}

interface Caption {
  id: string;
  content: string;
  like_count: number;
  created_datetime_utc: string;
  image_id: string;
  images: Image | null;
}

async function CaptionCard({ caption }: { caption: Caption }) {
  const imageUrl = caption.images?.url;
  const formattedDate = new Date(caption.created_datetime_utc).toLocaleDateString();

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-purple-500 transition shadow-lg">
      {/* Image Section */}
      {imageUrl ? (
        <div className="relative w-full h-48 bg-slate-900 overflow-hidden">
          <img
            src={imageUrl}
            alt={caption.content || "Caption image"}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
          <span className="text-slate-500">No image</span>
        </div>
      )}

      {/* Caption Content Section */}
      <div className="p-4">
        {/* Caption Text */}
        <p className="text-white text-lg font-semibold mb-3 line-clamp-3">
          {caption.content || "No caption"}
        </p>

        {/* Footer Info */}
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
  console.log("Starting DataPage render...");

  try {
    const supabase = await createClient();
    console.log("Supabase client created successfully");

    // Fetch captions with their related images using foreign key expansion
    console.log("Fetching captions with images...");
    const { data: captions, error } = await supabase
      .from("captions")
      .select("id, content, like_count, created_datetime_utc, image_id, images(id, url)")
      .order("like_count", { ascending: false })
      .limit(50);

    console.log("Fetch complete. Error:", error);
    console.log("Captions fetched:", captions?.length);

    if (error) {
      console.error("Supabase error:", error);
      return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
          <div className="max-w-6xl mx-auto">
            <Link href="/">
              <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition mb-6">
                ← Back to Home
              </button>
            </Link>
            <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-lg">
              <p className="font-semibold">Error fetching captions:</p>
              <p className="text-sm mt-1">{error.message}</p>
            </div>
          </div>
        </main>
      );
    }

    if (!captions || captions.length === 0) {
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

    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Captions & Images</h1>
              <p className="text-slate-300">
                Showing {captions.length} caption{captions.length !== 1 ? "s" : ""} with
                images
              </p>
            </div>
            <Link href="/">
              <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
                ← Back
              </button>
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {captions.map((caption: Caption) => (
              <CaptionCard key={caption.id} caption={caption} />
            ))}
          </div>
        </div>
      </main>
    );
  } catch (err) {
    console.error("Exception in DataPage:", err instanceof Error ? err.message : String(err));
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
            <p className="text-sm mt-1">
              {err instanceof Error ? err.message : String(err)}
            </p>
          </div>
        </div>
      </main>
    );
  }
}
