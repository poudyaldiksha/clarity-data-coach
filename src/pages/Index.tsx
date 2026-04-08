import { AnalystChat } from "@/components/AnalystChat";
import { BarChart3 } from "lucide-react";
import heroPattern from "@/assets/hero-pattern.jpg";

const Index = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="relative border-b border-border overflow-hidden">
        <img
          src={heroPattern}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          width={1920}
          height={600}
        />
        <div className="relative z-10 px-4 md:px-8 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">DataMentor</h1>
            <p className="text-xs text-muted-foreground">Your AI Data Analysis Guide</p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-hidden">
        <AnalystChat />
      </main>
    </div>
  );
};

export default Index;
