import { Database, BarChart3, FileSpreadsheet, Wrench } from "lucide-react";
import { motion } from "framer-motion";

const suggestions = [
  { icon: Wrench, label: "How do I clean missing data in Python?", gradient: "from-primary/10 to-primary/5", iconColor: "text-primary", borderHover: "hover:border-primary/40" },
  { icon: BarChart3, label: "Best chart type for trend analysis?", gradient: "from-accent/10 to-accent/5", iconColor: "text-accent", borderHover: "hover:border-accent/40" },
  { icon: Database, label: "SQL query for top customers by spend", gradient: "from-primary/10 to-accent/5", iconColor: "text-primary", borderHover: "hover:border-primary/40" },
  { icon: FileSpreadsheet, label: "How to use pivot tables in Excel?", gradient: "from-accent/10 to-primary/5", iconColor: "text-accent", borderHover: "hover:border-accent/40" },
];

export function PromptSuggestions({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full">
      {suggestions.map((s, i) => (
        <motion.button
          key={s.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
          onClick={() => onSelect(s.label)}
          className={`group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-all duration-300 border border-border/50 bg-gradient-to-br ${s.gradient} ${s.borderHover} hover:shadow-lg hover:shadow-primary/5`}
        >
          <div className="w-9 h-9 rounded-lg bg-card/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <s.icon className={`w-4 h-4 ${s.iconColor}`} />
          </div>
          <span className="text-sm text-secondary-foreground group-hover:text-foreground transition-colors">{s.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
