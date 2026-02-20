import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function ListPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("captions")
    .select("id, content")
    .order("id", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <main className="min-h-screen p-8">
        <Link href="/" className="underline">
          ← Home
        </Link>
        <h1 className="text-2xl font-bold mt-6">/list</h1>
        <p className="mt-4 text-red-600">Failed to load rows: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">/list</h1>
          <Link href="/" className="underline">
            Home
          </Link>
        </div>

        <p className="mt-2 text-slate-500">Showing {(data ?? []).length} rows from `captions`</p>

        {(() => {
          const captions = data ?? [];
          const captionIds = captions.map((c) => c.id);
          return (
            <CaptionList captionIds={captionIds} captions={captions} />
          );
        })()}
      </div>
    </main>
  );
}

async function CaptionList({
  captionIds,
  captions,
}: {
  captionIds: string[];
  captions: Array<{ id: string; content: string | null }>;
}) {
  const supabase = await createClient();

  const { data: imagesData } = await supabase
    .from("images")
    .select("id, url")
    .in("id", captionIds);

  const imageMap = new Map<string, string | null>(
    (imagesData ?? []).map((i) => [i.id, i.url])
  );

  return (
    <ul className="mt-6 space-y-3">
      {captions.map((row) => (
        <li key={row.id} className="rounded-md border p-4 flex gap-4">
          {imageMap.get(row.id) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageMap.get(row.id) ?? undefined}
              alt={row.content ?? "caption image"}
              className="w-20 h-20 object-cover rounded"
            />
          ) : (
            <div className="w-20 h-20 rounded bg-slate-200" />
          )}
          <div>
            <div className="text-xs text-slate-500">{row.id}</div>
            <div className="mt-1 font-medium">{row.content ?? "(null)"}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
