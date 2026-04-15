"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "CUSTOMER" as "CUSTOMER" | "SALESPERSON",
    registrationKey: "",
    marketingOptIn: true,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    // Auto sign-in after registration
    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (form.role === "SALESPERSON") {
      router.push("/salesperson/dashboard");
    } else {
      router.push("/customer/chat");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Logo mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-slate-900 text-white font-bold text-sm tracking-tight mb-4">
            SM
          </div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Create account</h1>
          <p className="text-sm text-slate-500 mt-1">Join Smith Motors</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-[0.08em] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-shadow"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-[0.08em] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-shadow"
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-[0.08em] mb-1.5">
                Account Type
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as "CUSTOMER" | "SALESPERSON" })}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
              >
                <option value="CUSTOMER">Customer</option>
                <option value="SALESPERSON">Salesperson</option>
              </select>
            </div>

            {form.role === "SALESPERSON" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-[0.08em] mb-1.5">
                  Registration Key
                </label>
                <input
                  type="password"
                  value={form.registrationKey}
                  onChange={(e) => setForm({ ...form, registrationKey: e.target.value })}
                  required
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-shadow"
                  placeholder="Provided by your manager"
                />
              </div>
            )}

            {form.role === "CUSTOMER" && (
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.marketingOptIn}
                  onChange={(e) => setForm({ ...form, marketingOptIn: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-blue-700 cursor-pointer"
                />
                <span className="text-xs text-slate-600">
                  Sign me up for deals &amp; price drop alerts from Smith Motors
                </span>
              </label>
            )}

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white rounded-md py-2.5 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors tracking-wide"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-xs text-center text-slate-500 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-700 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
