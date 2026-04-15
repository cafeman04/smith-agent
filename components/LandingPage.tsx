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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sm-root {
          display: flex;
          height: 100vh;
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
        }

        /* ── Panels ── */
        .sm-panel {
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: flex 0.75s cubic-bezier(0.77, 0, 0.175, 1);
        }

        .sm-panel-left  { flex: 1; background: #080808; }
        .sm-panel-right { flex: 1; background: #0D1424; }

        /* Customer selected: left expands */
        .sm-root.view-customer .sm-panel-left  { flex: 1.5; }
        .sm-root.view-customer .sm-panel-right { flex: 0.001; pointer-events: none; }
        .sm-root.view-customer .sm-panel-right .sm-panel-inner { opacity: 0; }

        /* Salesperson selected: right expands */
        .sm-root.view-salesperson .sm-panel-right { flex: 1.5; }
        .sm-root.view-salesperson .sm-panel-left  { flex: 0.001; pointer-events: none; }
        .sm-root.view-salesperson .sm-panel-left .sm-panel-inner { opacity: 0; }

        .sm-panel-inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: opacity 0.35s ease;
        }

        /* ── Glow orbs ── */
        .sm-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
        }
        .sm-orb-left  { width: 500px; height: 500px; top: -100px; left: -150px; background: rgba(196, 18, 48, 0.12); }
        .sm-orb-right { width: 500px; height: 500px; bottom: -100px; right: -150px; background: rgba(185, 151, 43, 0.1); }

        /* ── Divider ── */
        .sm-divider {
          width: 1px;
          flex-shrink: 0;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(255,255,255,0.08) 20%,
            rgba(255,255,255,0.12) 50%,
            rgba(255,255,255,0.08) 80%,
            transparent 100%
          );
          transition: opacity 0.5s ease;
          z-index: 10;
        }
        .sm-root.view-customer .sm-divider,
        .sm-root.view-salesperson .sm-divider { opacity: 0; }

        /* ── Header ── */
        .sm-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 36px 52px;
        }
        .sm-logo-mark {
          width: 30px;
          height: 30px;
          border: 1px solid rgba(255,255,255,0.25);
          position: relative;
          flex-shrink: 0;
        }
        .sm-logo-mark::after {
          content: '';
          position: absolute;
          inset: 6px;
          background: rgba(255,255,255,0.15);
        }
        .sm-logo-text {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          font-size: 12px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          white-space: nowrap;
        }

        /* ── Body content ── */
        .sm-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 52px 72px;
        }

        /* ── Selection state ── */
        .sm-selection {
          cursor: pointer;
          max-width: 380px;
          user-select: none;
        }

        .sm-accent-bar {
          height: 1px;
          width: 40px;
          margin-bottom: 36px;
          transform-origin: left;
          transition: width 0.35s ease;
        }
        .sm-selection:hover .sm-accent-bar { width: 72px; }

        .sm-portal-label {
          font-size: 10px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 18px;
        }
        .sm-portal-label-red  { color: #C41230; }
        .sm-portal-label-gold { color: #B8972B; }

        .sm-headline {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(52px, 5.5vw, 84px);
          color: white;
          line-height: 0.92;
          letter-spacing: -0.02em;
          margin-bottom: 28px;
        }

        .sm-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.38);
          line-height: 1.65;
          margin-bottom: 44px;
          font-weight: 300;
          max-width: 240px;
        }

        .sm-cta {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          color: rgba(255,255,255,0.6);
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          font-weight: 500;
          transition: color 0.25s;
        }
        .sm-cta-line {
          width: 28px; height: 1px;
          background: currentColor;
          transition: width 0.3s ease;
        }
        .sm-selection:hover .sm-cta { color: rgba(255,255,255,0.9); }
        .sm-selection:hover .sm-cta-line { width: 48px; }

        /* ── Form state ── */
        .sm-form-wrap {
          max-width: 340px;
          animation: smFadeUp 0.55s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }

        @keyframes smFadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .sm-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.3);
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 0;
          margin-bottom: 52px;
          transition: color 0.2s;
        }
        .sm-back-btn:hover { color: rgba(255,255,255,0.65); }

        .sm-form-label {
          font-size: 10px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 14px;
        }
        .sm-form-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 38px;
          color: white;
          letter-spacing: -0.01em;
          margin-bottom: 40px;
          line-height: 1;
        }

        .sm-field { display: flex; flex-direction: column; gap: 8px; }
        .sm-field-label {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          font-weight: 500;
        }
        .sm-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 300;
          padding: 13px 16px;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          width: 100%;
        }
        .sm-input:focus {
          border-color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.07);
        }
        .sm-input::placeholder { color: rgba(255,255,255,0.2); }

        .sm-submit-red, .sm-submit-gold {
          border: none;
          color: white;
          padding: 14px 24px;
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          font-weight: 500;
          cursor: pointer;
          width: 100%;
          transition: opacity 0.2s, filter 0.2s;
          margin-top: 8px;
        }
        .sm-submit-red  { background: #C41230; }
        .sm-submit-gold { background: #B8972B; }
        .sm-submit-red:hover  { filter: brightness(1.12); }
        .sm-submit-gold:hover { filter: brightness(1.12); }
        .sm-submit-red:disabled,
        .sm-submit-gold:disabled { opacity: 0.5; cursor: not-allowed; filter: none; }

        .sm-error {
          font-size: 12px;
          color: #f87171;
          letter-spacing: 0.05em;
        }

        .sm-foot-text {
          font-size: 12px;
          color: rgba(255,255,255,0.25);
          margin-top: 24px;
          letter-spacing: 0.04em;
          line-height: 1.5;
        }
        .sm-foot-text a {
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          transition: color 0.2s;
        }
        .sm-foot-text a:hover { color: rgba(255,255,255,0.8); }

        /* ── Footer ── */
        .sm-panel-footer {
          padding: 24px 52px;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.15);
          font-weight: 400;
        }

        /* ── Hover panel highlight ── */
        .sm-panel-left .sm-hover-overlay,
        .sm-panel-right .sm-hover-overlay {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }
        .sm-panel-left .sm-hover-overlay  { background: rgba(196, 18, 48, 0.04); }
        .sm-panel-right .sm-hover-overlay { background: rgba(185, 151, 43, 0.04); }

        .sm-root.view-pick .sm-panel-left:hover .sm-hover-overlay,
        .sm-root.view-pick .sm-panel-right:hover .sm-hover-overlay { opacity: 1; }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .sm-root { flex-direction: column; height: auto; min-height: 100vh; }
          .sm-divider { width: 100%; height: 1px; }
          .sm-root.view-customer .sm-panel-left  { flex: 1; }
          .sm-root.view-customer .sm-panel-right { flex: 0; height: 0; }
          .sm-root.view-salesperson .sm-panel-right { flex: 1; }
          .sm-root.view-salesperson .sm-panel-left  { flex: 0; height: 0; }
          .sm-panel-left, .sm-panel-right { min-height: 50vh; }
          .sm-root.view-pick .sm-panel-left,
          .sm-root.view-pick .sm-panel-right { min-height: 50vh; }
          .sm-header { padding: 28px 32px; }
          .sm-body { padding: 24px 32px 48px; }
          .sm-panel-footer { padding: 20px 32px; }
        }
      `}</style>

      <div className={`sm-root view-${view}`}>

        {/* ── LEFT PANEL — Customer ── */}
        <div className="sm-panel sm-panel-left">
          <div className="sm-orb sm-orb-left" />
          <div className="sm-hover-overlay" />

          <div className="sm-panel-inner">
            {/* Header */}
            <div className="sm-header">
              <div className="sm-logo-mark" />
              <span className="sm-logo-text">Smith Motors</span>
            </div>

            {/* Body */}
            <div className="sm-body">
              {view !== "customer" ? (
                <div className="sm-selection" onClick={() => setView("customer")}>
                  <div className="sm-accent-bar" style={{ background: "#C41230" }} />
                  <p className="sm-portal-label sm-portal-label-red">Customer Portal</p>
                  <h2 className="sm-headline">
                    Browse<br />& Buy
                  </h2>
                  <p className="sm-sub">
                    Chat with Alex, our AI assistant, and explore our full inventory.
                  </p>
                  <div className="sm-cta">
                    <span>Enter Portal</span>
                    <span className="sm-cta-line" />
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="sm-form-wrap">
                  <button className="sm-back-btn" onClick={reset}>
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>

                  <p className="sm-form-label sm-portal-label-red">Customer Sign In</p>
                  <h2 className="sm-form-title">Welcome back</h2>

                  <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div className="sm-field">
                      <label className="sm-field-label">Email</label>
                      <input
                        className="sm-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="sm-field">
                      <label className="sm-field-label">Password</label>
                      <input
                        className="sm-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                      />
                    </div>

                    {error && <p className="sm-error">{error}</p>}

                    <button type="submit" disabled={loading} className="sm-submit-red">
                      {loading ? "Signing In..." : "Sign In"}
                    </button>
                  </form>

                  <p className="sm-foot-text">
                    New customer?{" "}
                    <Link href="/register">Create an account</Link>
                  </p>
                </div>
              )}
            </div>

            <div className="sm-panel-footer">© 2025 Smith Motors</div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="sm-divider" />

        {/* ── RIGHT PANEL — Employee ── */}
        <div className="sm-panel sm-panel-right">
          <div className="sm-orb sm-orb-right" />
          <div className="sm-hover-overlay" />

          <div className="sm-panel-inner">
            {/* Header — show logo when in form state */}
            {view === "salesperson" ? (
              <div className="sm-header">
                <div className="sm-logo-mark" />
                <span className="sm-logo-text">Smith Motors</span>
              </div>
            ) : (
              <div style={{ padding: "36px 52px" }} />
            )}

            {/* Body */}
            <div className="sm-body">
              {view !== "salesperson" ? (
                <div className="sm-selection" onClick={() => setView("salesperson")}>
                  <div className="sm-accent-bar" style={{ background: "#B8972B" }} />
                  <p className="sm-portal-label sm-portal-label-gold">Employee Portal</p>
                  <h2 className="sm-headline">
                    Manage<br />& Close
                  </h2>
                  <p className="sm-sub">
                    Access your dashboard, leads, and dealership metrics.
                  </p>
                  <div className="sm-cta">
                    <span>Enter Portal</span>
                    <span className="sm-cta-line" />
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="sm-form-wrap">
                  <button className="sm-back-btn" onClick={reset}>
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>

                  <p className="sm-form-label sm-portal-label-gold">Employee Sign In</p>
                  <h2 className="sm-form-title">Welcome back</h2>

                  <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div className="sm-field">
                      <label className="sm-field-label">Email</label>
                      <input
                        className="sm-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                        placeholder="you@smithmotors.com"
                      />
                    </div>
                    <div className="sm-field">
                      <label className="sm-field-label">Password</label>
                      <input
                        className="sm-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                      />
                    </div>

                    {error && <p className="sm-error">{error}</p>}

                    <button type="submit" disabled={loading} className="sm-submit-gold">
                      {loading ? "Signing In..." : "Sign In"}
                    </button>
                  </form>

                  <p className="sm-foot-text">
                    New to the team?{" "}
                    <Link href="/register">Create an account</Link>
                  </p>
                </div>
              )}
            </div>

            <div className="sm-panel-footer" />
          </div>
        </div>

      </div>
    </>
  );
}
