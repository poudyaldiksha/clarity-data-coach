import { Database, BarChart3, FileSpreadsheet, Wrench } from "lucide-react";

const suggestions = [
  { icon: Wrench, label: "How do I clean missing data in Python?", color: "text-primary" },
  { icon: BarChart3, label: "Best chart type for trend analysis?", color: "text-accent" },
  { icon: Database, label: "SQL query for top customers by spend", color: "text-primary" },
  { icon: FileSpreadsheet, label: "How to use pivot tables in Excel?", color: "text-accent" },
];

export function PromptSuggestions({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full">
      {suggestions.map((s) => (
        <button
          key={s.label}
          onClick={() => onSelect(s.label)}
          className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3.5 text-left hover:border-primary/40 hover:bg-secondary transition-all group"
        >
          <s.icon className={`w-5 h-5 ${s.color} flex-shrink-0 group-hover:scale-110 transition-transform`} />
          <span className="text-sm text-secondary-foreground">{s.label}</span>
        </button>
      ))}
    </div>
  );
}
