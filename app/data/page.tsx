import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

interface DataItem {
  [key: string]: any;
}

interface TableResult {
  tableName: string;
  data: DataItem[];
  columns: string[];
}

async function fetchTableData(supabase: any, tableName: string): Promise<TableResult | null> {
  try {
    const { data, error } = await supabase.from(tableName).select("*").limit(100);

    if (error) {
      console.log(`Table ${tableName}: error:`, error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log(`Table ${tableName}: no data (possible RLS)`);
      return null;
    }

    const columns = Object.keys(data[0]);
    console.log(`Table ${tableName}: success - ${data.length} rows`);

    return {
      tableName,
      data,
      columns,
    };
  } catch (err) {
    console.error(`Table ${tableName}: exception:`, err);
    return null;
  }
}

export default async function DataListPage() {
  const supabase = await createClient();
  // Prioritize tables with actual data from your Supabase database
  const tablesToTry = [
    "captions",
    "profiles", 
    "llm_model_responses",
    "humor_flavor_steps",
    "llm_prompt_chains",
    "sidechat_posts",
    "caption_requests",
    "images",
    "humor_flavors",
  ];

  let result: TableResult | null = null;

  // Try each table in sequence until we find one with data
  for (const table of tablesToTry) {
    const tableResult = await fetchTableData(supabase, table);
    if (tableResult) {
      result = tableResult;
      break;
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
              ← Back to Home
            </button>
          </Link>
        </div>

        {!result ? (
          <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2">No Data Found</h2>
            <p className="text-sm mb-4">
              Could not find any data in the available tables (checked captions, profiles, llm_model_responses, humor_flavor_steps, llm_prompt_chains, sidechat_posts, caption_requests, images, humor_flavors)
            </p>
            <p className="text-sm text-red-100">
              <strong>Possible causes:</strong>
            </p>
            <ul className="text-sm text-red-100 list-disc ml-5 mt-2">
              <li>Tables don't exist or are empty</li>
              <li>Row Level Security (RLS) is enabled without SELECT policies</li>
              <li>Service role key needed (currently using anon key)</li>
            </ul>
            <p className="text-sm text-red-100 mt-4">
              <strong>Next step:</strong> Create a table and add test data, or check RLS policies in Supabase dashboard.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-white mb-2 capitalize">
              {result.tableName} Data
            </h1>
            <p className="text-gray-300 mb-8">
              Showing {result.data.length} records from the {result.tableName} table
            </p>

            <div className="grid grid-cols-1 gap-4">
              {result.data.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-800 border border-purple-500 rounded-lg p-6 hover:border-purple-400 transition"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.columns.map((column) => (
                      <div key={column}>
                        <p className="text-gray-400 text-sm capitalize font-semibold">{column}</p>
                        <p className="text-white break-words">
                          {String(item[column] ?? "—")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
