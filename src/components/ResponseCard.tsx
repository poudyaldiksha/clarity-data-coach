import { motion } from "framer-motion";
import { Brain, ListOrdered, Code2, Lightbulb } from "lucide-react";

interface Props {
  data: {
    understanding: string;
    steps: string[];
    example: string;
    insight: string;
  };
}

export function ResponseCard({ data }: Props) {
  return (
    <div className="space-y-4 max-w-3xl">
      {/* Problem Understanding */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-5"
      >
        <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-2">
          <Brain className="w-4 h-4" />
          Problem Understanding
        </div>
        <p className="text-secondary-foreground leading-relaxed">{data.understanding}</p>
      </motion.div>

      {/* Steps */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-xl p-5"
      >
        <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-3">
          <ListOrdered className="w-4 h-4" />
          Step-by-Step Solution
        </div>
        <ol className="space-y-2">
          {data.steps.map((step, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary text-step-number text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="text-secondary-foreground leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </motion.div>

      {/* Example */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-xl p-5"
      >
        <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-3">
          <Code2 className="w-4 h-4" />
          Example
        </div>
        <pre className="bg-code-bg rounded-lg p-4 overflow-x-auto text-sm font-mono text-secondary-foreground leading-relaxed">
          <code>{data.example}</code>
        </pre>
      </motion.div>

      {/* Insight */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl p-5 bg-primary/10 border border-primary/20"
      >
        <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-2">
          <Lightbulb className="w-4 h-4" />
          Final Insight
        </div>
        <p className="text-foreground leading-relaxed">{data.insight}</p>
      </motion.div>
    </div>
  );
}
