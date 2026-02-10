"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface DataItem {
  [key: string]: any;
}

export default function DataList() {
  const [items, setItems] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableInfo, setTableInfo] = useState<{ name: string; columns: string[] }>({
    name: "",
    columns: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from common table names
      const tablesToTry = ["posts", "users", "products", "items", "tasks", "notes"];
      let data = null;
      let tableName = "";
      let columns: string[] = [];

      for (const table of tablesToTry) {
        const { data: result, error: err } = await supabase
          .from(table)
          .select("*")
          .limit(100);

        if (!err && result && result.length > 0) {
          data = result;
          tableName = table;
          columns = Object.keys(result[0]);
          break;
        }
      }

      if (data && tableName) {
        setItems(data);
        setTableInfo({ name: tableName, columns });
      } else {
        setError("No data found in available tables");
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
      </div>
    </main>
  );
}
