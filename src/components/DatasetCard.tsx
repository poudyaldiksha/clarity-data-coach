import { motion } from "framer-motion";
import { FileSpreadsheet, AlertTriangle, BarChart3, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface ColumnInfo {
  name: string;
  type: string;
  missing: number;
  missingPct: string;
  [key: string]: unknown;
}

interface Props {
  summary: {
    filename: string;
    rowCount: number;
    columnCount: number;
    columns: ColumnInfo[];
    totalMissing: number;
  };
  cleaningSuggestions: string[];
  aiSuggestions: string;
}

export function DatasetCard({ summary, cleaningSuggestions, aiSuggestions }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-semibold text-sm">{summary.filename}</h3>
            <p className="text-xs text-muted-foreground">
              {summary.rowCount.toLocaleString()} rows × {summary.columnCount} columns
              {summary.totalMissing > 0 && (
                <span className="text-destructive ml-2">• {summary.totalMissing} missing values</span>
              )}
            </p>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="border-t border-border">
          {/* Column Info */}
          <div className="px-5 py-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Columns</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {summary.columns.map((col) => (
                <div key={col.name} className="flex items-center gap-2 text-xs py-1">
                  <span className="px-1.5 py-0.5 rounded bg-secondary text-primary font-mono text-[10px]">{col.type}</span>
                  <span className="text-secondary-foreground truncate">{col.name}</span>
                  {col.missing > 0 && (
                    <span className="text-destructive ml-auto flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {col.missingPct}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cleaning Suggestions */}
          {cleaningSuggestions.length > 0 && (
            <div className="px-5 py-3 border-t border-border">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Cleaning Suggestions
              </h4>
              <ul className="space-y-1">
                {cleaningSuggestions.map((s, i) => (
                  <li key={i} className="text-xs text-secondary-foreground">{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Suggestions */}
          {aiSuggestions && (
            <div className="px-5 py-3 border-t border-border">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Analysis
              </h4>
              <p className="text-xs text-secondary-foreground whitespace-pre-wrap">{aiSuggestions}</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
