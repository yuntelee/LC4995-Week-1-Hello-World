"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DataList() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("posts") // change table name if needed
      .select("*")
      .then(({ data }) => setData(data ?? []));
  }, []);

  return (
    <pre>{JSON.stringify(data, null, 2)}</pre>
  );
}
