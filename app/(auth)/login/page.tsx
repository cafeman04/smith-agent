"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/components/ui/cn";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      // Redirect based on role — fetch session to check
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      if (["SALESPERSON", "MANAGER"].includes(session?.user?.role)) {
        router.push("/salesperson/dashboard");
      } else {
        router.push("/customer/dashboard");
      }
    }
  };

  const handleGuest = async () => {
    setGuestLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/guest", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create guest session");
      const { email: gEmail, password: gPassword } = await res.json();
      const result = await signIn("credentials", { email: gEmail, password: gPassword, redirect: false });
      if (result?.error) throw new Error("Sign-in failed");
      router.push("/customer/dashboard");
    } catch {
      setError("Could not start guest session. Please try again.");
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4FB] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-navy text-white font-bold text-sm tracking-tight mb-4">
            SM
          </div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Sign in</h1>
          <p className="text-sm text-slate-500 mt-1">Smith Motors Customer Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-[0.08em] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-shadow"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-[0.08em] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-shadow"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy text-white rounded-md py-2.5 text-sm font-semibold hover:bg-navy-hover disabled:opacity-50 transition-colors tracking-wide"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 uppercase tracking-[0.08em]">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <button
          onClick={handleGuest}
          disabled={guestLoading || loading}
          className={cn(
            "mt-4 w-full border border-slate-300 rounded-md py-2.5 text-sm font-semibold text-slate-700",
            "hover:bg-slate-50 disabled:opacity-50 transition-colors tracking-wide"
          )}
        >
          {guestLoading ? "Starting…" : "Continue as Guest"}
        </button>

        <p className="text-xs text-center text-slate-500 mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-700 font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
