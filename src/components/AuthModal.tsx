import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, UserPlus, X } from "lucide-react";

interface Props {
  onSignIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  onSignUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  onClose: () => void;
}

export function AuthModal({ onSignIn, onSignUp, onClose }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const fn = mode === "signin" ? onSignIn : onSignUp;
    const { error } = await fn(email, password);

    if (error) {
      setError(error.message);
    } else if (mode === "signup") {
      setSuccess("Check your email to confirm your account!");
    } else {
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">{mode === "signin" ? "Sign In" : "Create Account"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-secondary rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-secondary rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />

          {error && <p className="text-destructive text-sm">{error}</p>}
          {success && <p className="text-primary text-sm">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-medium hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {mode === "signin" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {loading ? "Loading..." : mode === "signin" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setSuccess(""); }} className="text-primary hover:underline">
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
