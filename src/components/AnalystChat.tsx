import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Upload } from "lucide-react";
import { PromptSuggestions } from "./PromptSuggestions";
import { MarkdownMessage } from "./MarkdownMessage";
import { FileUpload } from "./FileUpload";
import { DatasetCard } from "./DatasetCard";
import { streamChat } from "@/lib/streaming";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface DatasetInfo {
  id: string;
  summary: {
    filename: string;
    rowCount: number;
    columnCount: number;
    columns: Array<{ name: string; type: string; missing: number; missingPct: string; [key: string]: unknown }>;
    totalMissing: number;
  };
  cleaningSuggestions: string[];
  aiSuggestions: string;
}

interface Props {
  userId: string;
}

export function AnalystChat({ userId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [dataset, setDataset] = useState<DatasetInfo | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const query = text || input.trim();
    if (!query || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const controller = new AbortController();
    abortRef.current = controller;

    const allMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    try {
      await streamChat({
        messages: allMessages,
        datasetContext: dataset ? dataset.summary : null,
        onDelta: (chunk) => {
          assistantSoFar += chunk;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
            }
            return [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: assistantSoFar }];
          });
        },
        onDone: () => setIsLoading(false),
        signal: controller.signal,
      });
    } catch (err: unknown) {
      setIsLoading(false);
      if (err instanceof Error && err.name !== "AbortError") {
        toast.error(err.message);
      }
    }
  };

  const handleDatasetReady = (id: string, summary: DatasetInfo["summary"], cleaningSuggestions: string[], aiSuggestions: string) => {
    setDataset({ id, summary, cleaningSuggestions, aiSuggestions });
    setShowUpload(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        {messages.length === 0 && !dataset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center h-full gap-8 pt-12"
          >
            <div className="text-center space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-primary text-sm font-medium"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                AI Data Coach
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold tracking-tight"
              >
                What data challenge are
                <br />
                <span className="gradient-text">you solving?</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-muted-foreground max-w-lg text-base"
              >
                Upload a dataset or ask about data cleaning, SQL, visualizations, Excel, or any analysis problem.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              <FileUpload userId={userId} onDatasetReady={handleDatasetReady} />
            </motion.div>
            <PromptSuggestions onSelect={handleSend} />
          </motion.div>
        )}

        {dataset && (
          <DatasetCard
            summary={dataset.summary}
            cleaningSuggestions={dataset.cleaningSuggestions}
            aiSuggestions={dataset.aiSuggestions}
          />
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {msg.role === "user" ? (
                <div className="flex justify-end">
                  <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-5 py-3 rounded-2xl rounded-br-md max-w-md font-medium shadow-lg shadow-primary/10">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl">
                  <MarkdownMessage content={msg.content} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-muted-foreground text-sm pl-2">
            <span className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: "0.3s" }} />
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: "0.6s" }} />
            </span>
            Analyzing...
          </motion.div>
        )}

        {showUpload && messages.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <FileUpload userId={userId} onDatasetReady={handleDatasetReady} />
          </motion.div>
        )}
      </div>

      {/* Input bar */}
      <div className="border-t border-border/50 glass-strong px-4 md:px-8 py-4">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-3 max-w-3xl mx-auto"
        >
          <button
            type="button"
            onClick={() => setShowUpload(!showUpload)}
            className="glass rounded-xl px-3 py-3 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-300"
            title="Upload dataset"
          >
            <Upload className="w-5 h-5" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={dataset ? `Ask about ${dataset.summary.filename}...` : "Ask about data cleaning, SQL, charts, Excel..."}
            className="flex-1 glass rounded-xl px-5 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all duration-300"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl px-5 py-3 font-medium hover:shadow-lg hover:shadow-primary/20 disabled:opacity-40 transition-all duration-300 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
