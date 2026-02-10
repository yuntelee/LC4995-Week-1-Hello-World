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

// Helper to detect if a value is an image URL
function isImageUrl(value: any): boolean {
  if (!value || typeof value !== "string") return false;
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
  const lowerValue = value.toLowerCase();
  return (
    imageExtensions.some((ext) => lowerValue.includes(ext)) ||
    lowerValue.includes("supabase") ||
    lowerValue.includes("cdn") ||
    lowerValue.includes("storage") ||
    lowerValue.includes("http://") ||
    lowerValue.includes("https://")
  );
}

// Helper to detect if column name suggests image content
function isImageColumn(columnName: string, tableName?: string): boolean {
  const imageKeywords = [
    "image",
    "photo",
    "picture",
    "url",
    "src",
    "thumbnail",
    "avatar",
    "icon",
    "logo",
    "image_url",
    "photo_url",
    "picture_url",
  ];
  // For images table, always treat 'url' column as image
  if (tableName === "images" && columnName === "url") {
    return true;
  }
  return imageKeywords.some((keyword) =>
    columnName.toLowerCase().includes(keyword)
  );
}

async function fetchTableData(supabase: any, tableName: string): Promise<TableResult | null> {
  try {
    // For images table, exclude the embedding column (pgvector type that can't be serialized)
    let query = supabase.from(tableName).select("*");

    if (tableName === "images") {
      query = supabase
        .from(tableName)
        .select("id, created_datetime_utc, modified_datetime_utc, url, is_common_use, profile_id, additional_context, is_public, image_description, celebrity_recognition");
    }

    const { data, error } = await query.limit(100);

    if (error) {
      console.log(`Table ${tableName}: error:`, error.message);
      return null;
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log(`Table ${tableName}: no data (possible RLS)`);
      return null;
    }

    const firstRow = data[0];
    if (!firstRow || typeof firstRow !== "object") {
      console.log(`Table ${tableName}: invalid data format`);
      return null;
    }

    const columns = Object.keys(firstRow)
      .filter((key) => key && typeof key === "string")
      .slice(0, 20); // Limit to first 20 columns to avoid performance issues

    console.log(`Table ${tableName}: success - ${data.length} rows, ${columns.length} columns`);

    // Truncate data to first 50 rows to avoid performance issues
    return {
      tableName,
      data: data.slice(0, 50),
      columns,
    };
  } catch (err) {
    console.error(
      `Table ${tableName}: exception:`,
      err instanceof Error ? err.message : String(err)
    );
    return null;
  }
}

export default async function DataListPage() {
  let result: TableResult | null = null;
  let errorMessage: string | null = null;

  try {
    const supabase = await createClient();
    // Prioritize the images table with url column
    const tablesToTry = [
      "images",
      "captions",
      "profiles", 
      "llm_model_responses",
      "humor_flavor_steps",
      "llm_prompt_chains",
      "sidechat_posts",
      "caption_requests",
      "humor_flavors",
    ];

    // Try each table in sequence until we find one with data
    for (const table of tablesToTry) {
      try {
        const tableResult = await fetchTableData(supabase, table);
        if (tableResult) {
          result = tableResult;
          break;
        }
      } catch (tableErr) {
        console.warn(`Error fetching table ${table}:`, tableErr);
        continue;
      }
    }
  } catch (err) {
    console.error("Failed to initialize Supabase:", err);
    errorMessage = "Failed to connect to database. Check environment variables.";
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

        {errorMessage && (
          <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2">Database Error</h2>
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

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
            <p className="text-gray-300 mb-2">
              Showing {result.data.length} records from the {result.tableName} table
            </p>
            <p className="text-gray-400 text-sm mb-8">
              Columns: {result.columns.join(", ")}
            </p>

            <div className="grid grid-cols-1 gap-4">
              {result.data.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-800 border border-purple-500 rounded-lg p-6 hover:border-purple-400 transition"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.columns.map((column) => {
                      const value = item[column];
                      const isImage = isImageUrl(value) || isImageColumn(column, result.tableName);

                      return (
                        <div key={column} className="break-all">
                          <p className="text-gray-400 text-sm capitalize font-semibold mb-2">
                            {column}
                          </p>
                          {isImage && value ? (
                            <div className="relative w-full h-40 bg-slate-900 rounded border border-slate-600 overflow-hidden flex items-center justify-center">
                              <img
                                src={value}
                                alt={`${column} from ${result.tableName}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.warn(`Failed to load image from ${value}`);
                                }}
                              />
                            </div>
                          ) : (
                            <div className="bg-slate-900 p-2 rounded border border-slate-700 max-h-40 overflow-auto">
                              <p className="text-white text-xs font-mono break-words">
                                {typeof value === "string"
                                  ? String(value).substring(0, 500)
                                  : typeof value === "number"
                                    ? String(value)
                                    : value === null
                                      ? "null"
                                      : value === undefined
                                        ? "undefined"
                                        : "[Object]"}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Debug: Show first row raw JSON */}
            {result.data.length > 0 && (
              <div className="mt-8 p-4 bg-slate-800 border border-slate-700 rounded-lg">
                <p className="text-gray-300 text-sm font-semibold mb-2">Debug: First Row Raw JSON</p>
                <pre className="bg-slate-900 p-3 rounded text-xs overflow-auto text-gray-200 max-h-60">
                  {(() => {
                    try {
                      return JSON.stringify(result.data[0], null, 2).substring(0, 5000);
                    } catch {
                      return "[Unable to serialize data]";
                    }
                  })()}
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
