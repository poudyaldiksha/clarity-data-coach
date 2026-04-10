import { AnalystChat } from "@/components/AnalystChat";
import { BarChart3 } from "lucide-react";

const ANON_USER_ID = "00000000-0000-0000-0000-000000000000";

const Index = () => {
  return (
    <div className="flex flex-col h-screen relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-orb" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-accent/5 blur-3xl animate-orb" style={{ animationDelay: "-4s" }} />
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-primary/3 blur-3xl animate-orb" style={{ animationDelay: "-8s" }} />
      </div>

      <header className="relative z-10 border-b border-border/50 glass-strong">
        <div className="px-4 md:px-8 py-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center glow-primary">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text tracking-tight">DataCoach</h1>
            <p className="text-[11px] text-muted-foreground tracking-wide uppercase">AI Data Analysis Guide</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative z-10">
        <AnalystChat userId={ANON_USER_ID} />
      </main>
    </div>
  );
};

export default Index;
