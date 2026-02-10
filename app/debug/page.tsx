"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function DebugPage() {
  const [info, setInfo] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function debug() {
      try {
        setLoading(true);
        let output = "=== Supabase Debug Info ===\n\n";

        // Test 1: Check connection
        output += "1. Testing connection...\n";
        const { data: connTest, error: connError } = await supabase
          .from("information_schema.tables")
          .select("*")
          .eq("table_schema", "public")
          .limit(1);

        if (connError) {
          output += `Connection test: Error - ${connError.message}\n\n`;
        } else {
          output += "Connection test: ✓ Success\n\n";
        }

        // Test 2: List all tables
        output += "2. Querying all public tables...\n";
        const { data: tables, error: tablesError } = await supabase
          .from("information_schema.tables")
          .select("table_name")
          .eq("table_schema", "public");

        if (tablesError) {
          output += `Error: ${tablesError.message}\n\n`;
        } else if (tables && tables.length > 0) {
          output += `Found ${tables.length} tables:\n`;
          tables.forEach((t: any) => {
            output += `  - ${t.table_name}\n`;
          });
          output += "\n";

          // Test 3: Try to fetch from each table
          output += "3. Checking data in each table...\n";
          for (const t of tables) {
            const tableName = t.table_name;
            const { data: rowCount, error: countError } = await supabase
              .from(tableName)
              .select("*", { count: "exact", head: true });

            if (countError) {
              output += `  ${tableName}: Error - ${countError.message}\n`;
            } else {
              output += `  ${tableName}: ✓ ${rowCount?.length || 0} rows\n`;
            }
          }
        } else {
          output += "No tables found in public schema\n\n";
        }

        setInfo(output);
      } catch (err) {
        setInfo(`Error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    }

    debug();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/">
          <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition mb-6">
            ← Back to Home
          </button>
        </Link>

        <h1 className="text-3xl font-bold text-white mb-6">Debug: Supabase Tables</h1>

        {loading ? (
          <div className="text-gray-300">Loading database info...</div>
        ) : (
          <pre className="bg-slate-800 border border-purple-500 rounded-lg p-6 text-green-400 text-sm overflow-auto max-h-96">
            {info}
          </pre>
        )}
      </div>
    </main>
  );
}
