import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type TableRow = {
  id: string | number;
  [key: string]: unknown;
};

async function getRows(): Promise<TableRow[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("data")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Supabase query failed: ${error.message}`);
  }

  return (data ?? []) as TableRow[];
}

export default async function ListPage() {
  const rows = await getRows();

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-semibold">Supabase Table Rows</h1>

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
