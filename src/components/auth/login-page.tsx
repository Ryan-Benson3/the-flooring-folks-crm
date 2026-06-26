"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setError("Check your email for a confirmation link.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = "/";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-wood-400 to-sage-400 text-lg font-black text-ink-950 shadow-lg">
            FF
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-ink-100">
            The Flooring Folks
          </h1>
          <p className="mt-1 text-sm text-ink-400">
            {mode === "signin" ? "Sign in to your cockpit" : "Create your account"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-white/[0.06] bg-ink-900/80 p-6 shadow-xl backdrop-blur"
        >
          {error && (
            <div className="rounded-lg border border-red-400/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
              {error}
            </div>
          )}

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-3.5 py-2.5 text-sm text-ink-100 placeholder:text-ink-600 focus:border-wood-400/40 focus:outline-none focus:ring-2 focus:ring-wood-400/20"
              placeholder="ryan@theflooringfolks.com"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-3.5 py-2.5 text-sm text-ink-100 placeholder:text-ink-600 focus:border-wood-400/40 focus:outline-none focus:ring-2 focus:ring-wood-400/20"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-wood-400 to-wood-500 px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:from-wood-300 hover:to-wood-400 disabled:opacity-50"
          >
            {loading ? "Loading…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>

          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-xs text-ink-500 transition hover:text-ink-300"
            >
              {mode === "signin"
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-ink-600">
          The Flooring Folks CRM
        </p>
      </div>
    </div>
  );
}
