import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { ResponseCard } from "./ResponseCard";
import { PromptSuggestions } from "./PromptSuggestions";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  structured?: {
    understanding: string;
    steps: string[];
    example: string;
    insight: string;
  };
}

const generateResponse = (query: string): Message["structured"] => {
  const q = query.toLowerCase();

  if (q.includes("clean") || q.includes("missing") || q.includes("null")) {
    return {
      understanding: "You need to handle missing or messy data before analysis — a critical first step in any data pipeline.",
      steps: [
        "Identify missing values using df.isnull().sum() to get counts per column",
        "Decide strategy: drop rows (df.dropna()), fill with mean/median (df.fillna(df.mean())), or forward-fill for time series",
        "Check for duplicates with df.duplicated().sum() and remove with df.drop_duplicates()",
        "Validate data types with df.dtypes and convert as needed using pd.to_numeric() or pd.to_datetime()",
      ],
      example: `import pandas as pd\n\ndf = pd.read_csv('data.csv')\nprint(df.isnull().sum())\n\n# Fill numeric cols with median\ndf.fillna(df.median(numeric_only=True), inplace=True)\n\n# Drop remaining rows with nulls\ndf.dropna(inplace=True)\nprint(f"Clean rows: {len(df)}")`,
      insight: "Always clean data before analysis. ~80% of a data analyst's time goes into data preparation — doing it well prevents misleading results downstream.",
    };
  }

  if (q.includes("visualiz") || q.includes("chart") || q.includes("plot") || q.includes("graph")) {
    return {
      understanding: "You want to create effective visualizations to communicate data patterns and insights.",
      steps: [
        "Choose the right chart type: bar for comparisons, line for trends, scatter for relationships, histogram for distributions",
        "Use matplotlib or seaborn for static charts, plotly for interactive ones",
        "Always label axes, add a title, and include units",
        "Use color intentionally — highlight the key insight, not everything",
      ],
      example: `import matplotlib.pyplot as plt\nimport seaborn as sns\n\n# Distribution plot\nfig, axes = plt.subplots(1, 2, figsize=(12, 5))\n\nsns.histplot(df['revenue'], kde=True, ax=axes[0])\naxes[0].set_title('Revenue Distribution')\n\nsns.scatterplot(x='spend', y='revenue', data=df, ax=axes[1])\naxes[1].set_title('Spend vs Revenue')\n\nplt.tight_layout()\nplt.savefig('analysis.png', dpi=150)`,
      insight: "The best visualization tells a story at a glance. If someone needs more than 5 seconds to understand your chart, simplify it.",
    };
  }

  if (q.includes("sql") || q.includes("query") || q.includes("database")) {
    return {
      understanding: "You're working with a database and need to extract or analyze data using SQL.",
      steps: [
        "Start with SELECT to identify which columns you need",
        "Use WHERE to filter rows, JOIN to combine tables",
        "Aggregate with GROUP BY + aggregate functions (SUM, AVG, COUNT)",
        "Order results with ORDER BY and limit with LIMIT for exploration",
      ],
      example: `-- Top 10 customers by total spend\nSELECT \n  c.customer_name,\n  COUNT(o.order_id) AS total_orders,\n  SUM(o.amount) AS total_spend,\n  AVG(o.amount) AS avg_order_value\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nWHERE o.order_date >= '2024-01-01'\nGROUP BY c.customer_name\nORDER BY total_spend DESC\nLIMIT 10;`,
      insight: "Write queries incrementally — start simple, verify results, then add complexity. This prevents debugging nightmares with multi-join queries.",
    };
  }

  if (q.includes("excel") || q.includes("spreadsheet") || q.includes("pivot")) {
    return {
      understanding: "You need to analyze data using Excel — still one of the most powerful tools for quick analysis.",
      steps: [
        "Structure your data as a proper table (Ctrl+T) with headers in row 1",
        "Use pivot tables (Insert > PivotTable) for aggregation and cross-tabulation",
        "Apply VLOOKUP/XLOOKUP to combine data from multiple sheets",
        "Use conditional formatting to highlight outliers and trends",
      ],
      example: `Key Formulas:\n=XLOOKUP(A2, Sheet2!A:A, Sheet2!B:B)\n=SUMIFS(Sales, Region, "East", Year, 2024)\n=AVERAGEIF(Category, "Electronics", Revenue)\n=IF(ISBLANK(A2), "Missing", A2)\n\nPivot Table Setup:\n  Rows: Product Category\n  Columns: Quarter\n  Values: SUM of Revenue`,
      insight: "Pivot tables are the single most valuable Excel feature for analysts. Master them and you can answer 80% of business questions in under a minute.",
    };
  }

  return {
    understanding: `You're asking about: "${query}". Let me break this down into an actionable analysis approach.`,
    steps: [
      "Define the question clearly — what metric or pattern are you investigating?",
      "Identify and gather the relevant data sources",
      "Clean and prepare the data (handle missing values, correct types, remove duplicates)",
      "Perform exploratory analysis: summary statistics, distributions, correlations",
      "Draw conclusions and communicate findings with clear visualizations",
    ],
    example: `import pandas as pd\n\ndf = pd.read_csv('your_data.csv')\n\n# Quick exploration\nprint(df.shape)\nprint(df.describe())\nprint(df.info())\n\n# Check correlations\nprint(df.corr(numeric_only=True))`,
    insight: "Every analysis starts with a clear question. Before touching the data, write down exactly what you're trying to find out — it keeps you focused and prevents analysis paralysis.",
  };
};

export function AnalystChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (text?: string) => {
    const query = text || input.trim();
    if (!query) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const structured = generateResponse(query);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        structured,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full gap-8 pt-12"
          >
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Data Analysis Mentor
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">What data challenge are you solving?</h2>
              <p className="text-muted-foreground max-w-lg">
                Ask about data cleaning, SQL queries, visualizations, Excel, or any analysis problem.
              </p>
            </div>
            <PromptSuggestions onSelect={handleSend} />
          </motion.div>
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
                msg.structured && <ResponseCard data={msg.structured} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-muted-foreground text-sm pl-2">
            <span className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: "0.3s" }} />
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: "0.6s" }} />
            </span>
            Analyzing...
          </motion.div>
        )}
      </div>

      <div className="border-t border-border bg-card/50 backdrop-blur-sm px-4 md:px-8 py-4">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-3 max-w-3xl mx-auto"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about data cleaning, SQL, charts, Excel..."
            className="flex-1 bg-secondary border-none rounded-xl px-5 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-primary text-primary-foreground rounded-xl px-5 py-3 font-medium hover:brightness-110 disabled:opacity-40 transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
