import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type TableRow = {
  id: string | number;
  [key: string]: unknown;
};

type RowsResult = {
  rows: TableRow[];
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
    .from("data")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return {
      rows: [],
      error: `Supabase query failed: ${error.message}`,
    };
  }

  return {
    rows: (data ?? []) as TableRow[],
    error: null,
  };
}

export default async function ListPage() {
  const { rows, error } = await getRows();

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-semibold">Supabase Table Rows</h1>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {rows.length === 0 ? (
        <p className="text-foreground/80">No rows found in table: data</p>
      ) : (
        <pre className="overflow-auto rounded-lg border border-black/10 p-4 text-sm dark:border-white/20">
          {JSON.stringify(rows, null, 2)}
        </pre>
      )}
    </main>
  );
}
