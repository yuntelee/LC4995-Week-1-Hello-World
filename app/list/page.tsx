import { getSupabaseServerClient } from "@/lib/supabase/server";
import Image from "next/image";

export const dynamic = "force-dynamic";

type CaptionRow = {
  id: string;
  content: string | null;
  like_count: number;
  is_public: boolean;
  created_datetime_utc: string;
  image: { url: string | null } | Array<{ url: string | null }> | null;
};

type RowsResult = {
  rows: CaptionRow[];
  error: string | null;
};

async function getRows(): Promise<RowsResult> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return {
      rows: [],
      error:
        "Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.",
    };
  }

  const { data, error } = await supabase
    .from("captions")
    .select(
      "id, content, like_count, is_public, created_datetime_utc, image:images!captions_image_id_fkey(url)"
    )
    .eq("is_public", true)
    .order("like_count", { ascending: false })
    .limit(50);

  if (error) {
    return {
      rows: [],
      error: `Supabase query failed: ${error.message}`,
    };
  }

  return {
    rows: (data ?? []) as CaptionRow[],
    error: null,
  };
}

function getImageUrl(row: CaptionRow): string | null {
  if (!row.image) {
    return null;
  }

  if (Array.isArray(row.image)) {
    return row.image[0]?.url ?? null;
  }

  return row.image.url;
}

export default async function ListPage() {
  const { rows, error } = await getRows();

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl p-8">
      <h1 className="mb-2 text-3xl font-semibold">Public Captions</h1>
      <p className="mb-6 text-sm text-foreground/70">Table: captions (joined with images)</p>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {rows.length === 0 ? (
        <p className="text-foreground/80">No rows found in table: captions</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((row) => {
            const imageUrl = getImageUrl(row);

            return (
            <li
              key={row.id}
              className="rounded-lg border border-black/10 p-4 dark:border-white/20"
            >
              <div className="mb-2 text-xs text-foreground/60">{row.id}</div>
              <p className="mb-3 text-base">{row.content ?? "(no caption content)"}</p>
              <div className="mb-3 text-sm text-foreground/70">
                Likes: {row.like_count} · {new Date(row.created_datetime_utc).toLocaleString()}
              </div>
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={row.content ?? "caption image"}
                  width={1200}
                  height={480}
                  unoptimized
                  className="h-48 w-full rounded-md object-cover"
                />
              ) : null}
            </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
