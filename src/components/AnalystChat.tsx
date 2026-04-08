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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full gap-8 pt-12"
          >
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI Data Analysis Mentor
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">What data challenge are you solving?</h2>
              <p className="text-muted-foreground max-w-lg">
                Upload a dataset or ask about data cleaning, SQL, visualizations, Excel, or any analysis problem.
              </p>
            </div>

            <FileUpload userId={userId} onDatasetReady={handleDatasetReady} />
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
                  <div className="bg-primary text-primary-foreground px-5 py-3 rounded-2xl rounded-br-md max-w-md font-medium">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-muted-foreground text-sm pl-2">
            <span className="flex gap-1">
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

      <div className="border-t border-border bg-card/50 backdrop-blur-sm px-4 md:px-8 py-4">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-3 max-w-3xl mx-auto"
        >
          <button
            type="button"
            onClick={() => setShowUpload(!showUpload)}
            className="bg-secondary rounded-xl px-3 py-3 text-muted-foreground hover:text-primary transition-colors"
            title="Upload dataset"
          >
            <Upload className="w-5 h-5" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={dataset ? `Ask about ${dataset.summary.filename}...` : "Ask about data cleaning, SQL, charts, Excel..."}
            className="flex-1 bg-secondary border-none rounded-xl px-5 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-primary text-primary-foreground rounded-xl px-5 py-3 font-medium hover:brightness-110 disabled:opacity-40 transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
