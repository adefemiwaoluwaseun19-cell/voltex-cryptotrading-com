import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Voltex" },
      { name: "description", content: "Sign in or create your Voltex account to trade crypto with live prices." },
      { property: "og:title", content: "Sign in — Voltex" },
      { property: "og:description", content: "Sign in or create your Voltex account to trade crypto with live prices." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const afterSession = () => navigate({ to: "/", replace: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice("Check your inbox — click the confirmation link to activate your account, then sign in.");
          return;
        }
        afterSession();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        afterSession();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    if (busy) return;
    setError(null);
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(result.error.message);
      setBusy(false);
      return;
    }
    if (result.redirected) return; // browser navigates to Google
    afterSession();
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-5 py-10">
      <div className="app-grid pointer-events-none absolute inset-x-0 top-0 h-72" />
      <div className="glow-orb pointer-events-none absolute -left-16 top-10 size-48 rounded-full bg-brand/15 blur-3xl" />
      <div className="glow-orb pointer-events-none absolute -right-16 bottom-0 size-64 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-sm animate-fade-in">
        <div className="mb-7 flex flex-col items-center gap-3 text-center">
          <div className="orbit-ring">
            <div className="grid size-12 place-items-center rounded-xl bg-gradient-brand font-display text-lg font-bold text-primary-foreground shadow-brand">
              V
            </div>
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to your Voltex trading account"
                : "Start with $10,000 in demo cash — no card needed"}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-gradient-card p-4 shadow-coin">
          <div className="grid grid-cols-2 gap-1 rounded-md bg-secondary p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                  setNotice(null);
                }}
                className={`pressable rounded-md py-2 text-sm font-semibold transition-all ${
                  mode === m ? "bg-brand text-brand-foreground shadow-brand" : "text-muted-foreground"
                }`}
              >
                {m === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-md border border-border bg-secondary px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
              />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Password</span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="num mt-1 w-full rounded-md border border-border bg-secondary px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
              />
            </label>

            <button
              type="submit"
              disabled={busy}
              className="action-button flex h-12 w-full items-center justify-center rounded-md bg-gradient-brand text-sm font-bold text-primary-foreground shadow-brand disabled:opacity-40"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="pressable flex h-12 w-full items-center justify-center gap-2.5 rounded-md border border-border bg-secondary text-sm font-semibold text-secondary-foreground"
          >
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
              <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
            </svg>
            Continue with Google
          </button>

          {error && (
            <p className="animate-scale-in mt-3 rounded-md bg-down/15 px-3 py-2 text-center text-xs font-semibold text-down">
              {error}
            </p>
          )}
          {notice && (
            <p className="animate-scale-in mt-3 rounded-md bg-up/15 px-3 py-2 text-center text-xs font-semibold text-up">
              {notice}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
