import { useState } from "react";
import { AnalystChat } from "@/components/AnalystChat";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { BarChart3, LogIn, LogOut, Loader2 } from "lucide-react";
import heroPattern from "@/assets/hero-pattern.jpg";

const Index = () => {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="relative border-b border-border overflow-hidden">
        <img src={heroPattern} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" width={1920} height={600} />
        <div className="relative z-10 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">DataMentor</h1>
              <p className="text-xs text-muted-foreground">AI Data Analysis Guide</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground hidden sm:block">{user.email}</span>
                <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors" title="Sign out">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:brightness-110 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {user ? (
          <AnalystChat userId={user.id} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
            <div className="text-center space-y-3 max-w-md">
              <BarChart3 className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-2xl font-bold">Welcome to DataMentor</h2>
              <p className="text-muted-foreground">
                Sign in to upload datasets, get AI-powered analysis, auto-generated charts, and step-by-step data guidance.
              </p>
            </div>
            <button
              onClick={() => setShowAuth(true)}
              className="bg-primary text-primary-foreground rounded-xl px-6 py-3 font-medium hover:brightness-110 transition-all flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Get Started
            </button>
          </div>
        )}
      </main>

      {showAuth && (
        <AuthModal onSignIn={signIn} onSignUp={signUp} onClose={() => setShowAuth(false)} />
      )}
    </div>
  );
};

export default Index;
