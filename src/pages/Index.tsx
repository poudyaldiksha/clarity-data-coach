import { AnalystChat } from "@/components/AnalystChat";
import { BarChart3 } from "lucide-react";

const ANON_USER_ID = "anonymous";

const Index = () => {
  return (
    <div className="flex flex-col h-screen">
      <header className="border-b border-border">
        <div className="px-4 md:px-8 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">DataMentor</h1>
            <p className="text-xs text-muted-foreground">AI Data Analysis Guide</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <AnalystChat userId={ANON_USER_ID} />
      </main>
    </div>
  );
};

export default Index;
