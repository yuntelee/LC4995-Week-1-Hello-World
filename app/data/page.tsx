"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface DataItem {
  [key: string]: any;
}

interface Attempt {
  table: string;
  err: any;
  rows?: number;
  sample?: any;
}

export default function DataList() {
  const [items, setItems] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableInfo, setTableInfo] = useState<{ name: string; columns: string[] }>({
    name: "",
    columns: [],
  });
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [authUser, setAuthUser] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      // Check auth state
      try {
        const { data: userData } = await supabase.auth.getUser();
        setAuthUser(userData?.user ?? null);
        console.log("Auth user:", userData?.user ?? null);
      } catch (authErr) {
        console.warn("Failed to read auth state", authErr);
      }

      // Try to fetch from common table names
      const tablesToTry = ["posts", "users", "products", "items", "tasks", "notes"];
      let data = null;
      let tableName = "";
      let columns: string[] = [];
      const localAttempts: Attempt[] = [];

      for (const table of tablesToTry) {
        const { data: result, error: err } = await supabase
          .from(table)
          .select("*")
          .limit(100);

        const rows = Array.isArray(result) ? result.length : undefined;
        const sample = Array.isArray(result) && result.length > 0 ? result[0] : undefined;

        // Record attempt for debugging
        localAttempts.push({ table, err, rows, sample });
        console.log("Trying table:", table, { err, rows, sample });

        // If we successfully got rows, use it
        if (!err && result && Array.isArray(result) && result.length > 0) {
          data = result;
          tableName = table;
          columns = Object.keys(result[0]);
          break;
        }
      }

      setAttempts(localAttempts);

      if (data && tableName) {
        setItems(data);
        setTableInfo({ name: tableName, columns });
      } else {
        // Provide a helpful error message that suggests RLS as likely cause
        const suspectRLS = localAttempts.some((a) => a.err == null && a.rows === 0);
        if (suspectRLS) {
          setError(
            "No rows returned. This often indicates Row Level Security (RLS) is enabled without a SELECT policy for anon users. Check table RLS policies or authenticate the user."
          );
        } else {
          setError("No data found in available tables");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-white text-center text-xl">Loading data...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
          <Link href="/">
            <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
              Back to Home
            </button>
          </Link>
        </div>
      </main>
    );
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

        {error ? (
          <>
            <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
              {error}
            </div>
            <div className="bg-slate-800 border border-slate-700 text-gray-200 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-4 text-white">Debug Info</h3>

              <div className="mb-4">
                <p className="text-sm text-gray-300 mb-2 font-semibold">Authentication:</p>
                <pre className="bg-slate-900 p-3 rounded text-xs overflow-auto text-gray-200">
                  {JSON.stringify(
                    {
                      authenticated: authUser ? "yes" : "no",
                      user_id: authUser?.id ?? null,
                      email: authUser?.email ?? null,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              <div>
                <p className="text-sm text-gray-300 mb-2 font-semibold">Table Attempts (console log each):</p>
                <div className="space-y-2">
                  {attempts.map((a) => (
                    <div key={a.table} className="p-3 rounded bg-slate-900 border border-slate-700">
                      <div className="text-sm text-gray-300 mb-1">
                        <strong>{a.table}</strong> — {a.rows === 0 && a.err === null ? "⚠️ RLS likely" : a.err ? "❌ error" : "✓ ok"}
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        <div>error: {a.err ? String(a.err.message || a.err) : "null"}</div>
                        <div>rows: {a.rows ?? "—"}</div>
                        {a.sample && (
                          <div>sample: {JSON.stringify(a.sample).substring(0, 100)}...</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}

        {!error && (
          <>
            <h1 className="text-4xl font-bold text-white mb-2 capitalize">
              {tableInfo.name} Data
            </h1>
            <p className="text-gray-300 mb-8">
              Showing {items.length} records from the {tableInfo.name} table
            </p>

            {items.length === 0 ? (
              <div className="text-gray-300 text-center py-12">
                No data available
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-800 border border-purple-500 rounded-lg p-6 hover:border-purple-400 transition"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tableInfo.columns.map((column) => (
                        <div key={column}>
                          <p className="text-gray-400 text-sm capitalize">{column}</p>
                          <p className="text-white font-semibold break-words">
                            {String(item[column] ?? "—")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
