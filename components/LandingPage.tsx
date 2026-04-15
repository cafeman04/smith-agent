"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type View = "pick" | "customer" | "salesperson";

export function LandingPage() {
  const [view, setView] = useState<View>("pick");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    const res = await fetch("/api/auth/session");
    const session = await res.json();
    if (["SALESPERSON", "MANAGER", "ADMIN"].includes(session?.user?.role)) {
      router.push("/salesperson/dashboard");
    } else {
      router.push("/customer/chat");
    }
  };

  const reset = () => {
    setView("pick");
    setEmail("");
    setPassword("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center font-bold text-blue-900 text-sm shadow-md">
          SM
        </div>
        <span className="text-white font-bold text-2xl tracking-tight">Smith Motors</span>
      </div>

      {/* Role picker */}
      {view === "pick" && (
        <div className="w-full max-w-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-2">Welcome back</h1>
          <p className="text-blue-300 text-sm text-center mb-8">Sign in as a customer or salesperson</p>

          <div className="space-y-4">
            <button
              onClick={() => setView("customer")}
              className="w-full bg-white text-blue-900 rounded-2xl p-5 flex items-center gap-4 hover:bg-blue-50 transition-colors shadow-sm text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
                🚗
              </div>
              <div>
                <p className="font-semibold text-base">I&apos;m a Customer</p>
                <p className="text-sm text-gray-500 mt-0.5">Browse vehicles and chat with our AI assistant</p>
              </div>
              <svg className="ml-auto text-gray-400 flex-shrink-0" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => setView("salesperson")}
              className="w-full bg-white/10 backdrop-blur border border-white/20 text-white rounded-2xl p-5 flex items-center gap-4 hover:bg-white/20 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                👔
              </div>
              <div>
                <p className="font-semibold text-base">I&apos;m a Salesperson</p>
                <p className="text-sm text-blue-300 mt-0.5">Manage customers and view your dashboard</p>
              </div>
              <svg className="ml-auto text-blue-300 flex-shrink-0" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Customer sign-in */}
      {view === "customer" && (
        <div className="w-full max-w-sm">
          <button onClick={reset} className="flex items-center gap-1 text-blue-300 hover:text-white text-sm mb-6 transition-colors">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl">🚗</div>
              <div>
                <h2 className="font-bold text-lg text-gray-900">Customer Sign In</h2>
                <p className="text-xs text-gray-500">Chat with Alex, our AI assistant</p>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-xs text-center text-gray-500 mt-4">
              New customer?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Salesperson sign-in */}
      {view === "salesperson" && (
        <div className="w-full max-w-sm">
          <button onClick={reset} className="flex items-center gap-1 text-blue-300 hover:text-white text-sm mb-6 transition-colors">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl">👔</div>
              <div>
                <h2 className="font-bold text-lg text-gray-900">Salesperson Sign In</h2>
                <p className="text-xs text-gray-500">Access your customer dashboard</p>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@smithmotors.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-xs text-center text-gray-500 mt-4">
              New to the team?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Create a salesperson account
              </Link>
            </p>
          </div>
        </div>
      )}

      <p className="text-blue-400 text-xs mt-8">© 2024 Smith Motors</p>
    </div>
  );
}
