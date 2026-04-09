import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split("\n");
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map(line => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === "," && !inQuotes) { values.push(current.trim()); current = ""; }
      else { current += char; }
    }
    values.push(current.trim());
    return values;
  });
  return { headers, rows };
}

function analyzeColumn(values: string[]) {
  const nonEmpty = values.filter(v => v !== "" && v !== "null" && v !== "NULL" && v !== "NA" && v !== "N/A");
  const missing = values.length - nonEmpty.length;
  const missingPct = ((missing / values.length) * 100).toFixed(1);
  
  const numbers = nonEmpty.map(Number).filter(n => !isNaN(n));
  const isNumeric = numbers.length > nonEmpty.length * 0.8;
  
  if (isNumeric && numbers.length > 0) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / numbers.length;
    const std = Math.sqrt(numbers.reduce((s, n) => s + (n - mean) ** 2, 0) / numbers.length);
    return {
      type: "numeric",
      missing, missingPct: `${missingPct}%`,
      count: numbers.length,
      mean: +mean.toFixed(2),
      std: +std.toFixed(2),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: sorted[Math.floor(sorted.length / 2)],
    };
  }
  
  const uniqueValues = new Set(nonEmpty);
  return {
    type: uniqueValues.size <= 20 ? "categorical" : "text",
    missing, missingPct: `${missingPct}%`,
    count: nonEmpty.length,
    unique: uniqueValues.size,
    topValues: Object.entries(
      nonEmpty.reduce((acc: Record<string, number>, v) => { acc[v] = (acc[v] || 0) + 1; return acc; }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([value, count]) => ({ value, count })),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { fileUrl, filename, datasetId } = await req.json();
    
    // Download file content
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) throw new Error("Failed to download file");
    
    const ext = filename.split(".").pop()?.toLowerCase();
    let headers: string[];
    let rows: string[][];
    
    if (ext === "xlsx" || ext === "xls") {
      const buffer = await fileResponse.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      headers = (jsonData[0] || []).map(String);
      rows = jsonData.slice(1).map(row => row.map(String));
    } else {
      const content = await fileResponse.text();
      ({ headers, rows } = parseCSV(content));
    }
    
    // Analyze each column
    const columnInfo = headers.map((header, i) => {
      const values = rows.map(row => row[i] || "");
      return { name: header, ...analyzeColumn(values) };
    });

    const summary = {
      filename,
      rowCount: rows.length,
      columnCount: headers.length,
      columns: columnInfo,
      totalMissing: columnInfo.reduce((s, c) => s + c.missing, 0),
    };

    // Generate cleaning suggestions
    const cleaningSuggestions: string[] = [];
    for (const col of columnInfo) {
      if (col.missing > 0) {
        if (col.type === "numeric") {
          cleaningSuggestions.push(`Column "${col.name}": ${col.missing} missing values (${col.missingPct}). Consider filling with median or mean.`);
        } else {
          cleaningSuggestions.push(`Column "${col.name}": ${col.missing} missing values (${col.missingPct}). Consider filling with mode or "Unknown".`);
        }
      }
      if (col.type === "numeric" && "std" in col && "mean" in col) {
        const cv = (col.std as number) / Math.abs(col.mean as number);
        if (cv > 2) {
          cleaningSuggestions.push(`Column "${col.name}": High variability detected (CV=${cv.toFixed(1)}). Check for outliers.`);
        }
      }
    }

    // Update dataset record
    if (datasetId) {
      await supabase.from("datasets").update({
        row_count: rows.length,
        column_info: columnInfo,
        summary_json: summary,
        cleaning_suggestions: cleaningSuggestions,
      }).eq("id", datasetId);
    }

    // Use AI for deeper suggestions
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let aiSuggestions = "";
    if (LOVABLE_API_KEY) {
      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [{
              role: "user",
              content: `Analyze this dataset summary and provide brief, actionable insights:\n${JSON.stringify(summary, null, 2)}\n\nProvide:\n1. Data quality assessment (1-2 sentences)\n2. Top 3 recommended visualizations\n3. Potential analysis questions this data could answer\n\nKeep it concise.`,
            }],
          }),
        });
        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          aiSuggestions = aiData.choices?.[0]?.message?.content || "";
        }
      } catch { /* AI suggestions are optional */ }
    }

    return new Response(JSON.stringify({ summary, cleaningSuggestions, aiSuggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
