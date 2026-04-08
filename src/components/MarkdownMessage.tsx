import ReactMarkdown from "react-markdown";
import { ChatChart } from "./ChatChart";
import { useMemo } from "react";

interface Props {
  content: string;
}

function extractChartConfigs(text: string) {
  const chartRegex = /```chart-config\n([\s\S]*?)```/g;
  const charts: Array<{ type: string; title: string; xKey: string; yKey: string; data: Record<string, unknown>[] }> = [];
  let cleanText = text;

  let match;
  while ((match = chartRegex.exec(text)) !== null) {
    try {
      const config = JSON.parse(match[1]);
      charts.push(config);
      cleanText = cleanText.replace(match[0], `[CHART_${charts.length - 1}]`);
    } catch { /* ignore invalid JSON */ }
  }

  return { cleanText, charts };
}

export function MarkdownMessage({ content }: Props) {
  const { cleanText, charts } = useMemo(() => extractChartConfigs(content), [content]);

  const parts = cleanText.split(/\[CHART_(\d+)\]/);

  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          const chartIndex = parseInt(part);
          const config = charts[chartIndex];
          if (config) return <ChatChart key={`chart-${i}`} config={config as any} />;
          return null;
        }
        if (!part.trim()) return null;
        return (
          <div key={i} className="prose prose-sm prose-invert max-w-none 
            prose-headings:text-foreground prose-headings:font-display prose-headings:mt-4 prose-headings:mb-2
            prose-p:text-secondary-foreground prose-p:leading-relaxed
            prose-strong:text-foreground
            prose-code:text-primary prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
            prose-pre:bg-code-bg prose-pre:rounded-lg prose-pre:border prose-pre:border-border
            prose-li:text-secondary-foreground
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-ol:space-y-1 prose-ul:space-y-1
          ">
            <ReactMarkdown>{part}</ReactMarkdown>
          </div>
        );
      })}
    </div>
  );
}
