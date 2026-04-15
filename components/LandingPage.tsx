"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LandingPage() {
  const [custEmail, setCustEmail] = useState("");
  const [custPassword, setCustPassword] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empPassword, setEmpPassword] = useState("");
  const [custError, setCustError] = useState("");
  const [empError, setEmpError] = useState("");
  const [loading, setLoading] = useState<"customer" | "employee" | null>(null);
  const router = useRouter();

  const handleCustomerSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustError("");
    setLoading("customer");
    const result = await signIn("credentials", { email: custEmail, password: custPassword, redirect: false });
    setLoading(null);
    if (result?.error) { setCustError("Invalid email or password"); return; }
    router.push("/customer/dashboard");
  };

  const handleEmployeeSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmpError("");
    setLoading("employee");
    const result = await signIn("credentials", { email: empEmail, password: empPassword, redirect: false });
    setLoading(null);
    if (result?.error) { setEmpError("Invalid email or password"); return; }
    const res = await fetch("/api/auth/session");
    const session = await res.json();
    if (["SALESPERSON", "MANAGER", "ADMIN"].includes(session?.user?.role)) {
      router.push("/salesperson/dashboard");
    } else {
      setEmpError("This portal is for employees only.");
    }
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #F0F4FB;
        }

        /* ── Top nav ── */
        .lp-nav {
          background: #FFFFFF;
          border-top: 3px solid #1E3D72;
          border-bottom: 1px solid #D8E0EE;
          padding: 0 32px;
          height: 59px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          position: relative;
          z-index: 10;
        }
        .lp-nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .lp-nav-badge {
          width: 30px;
          height: 30px;
          background: #1E3D72;
          border-radius: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: 0.02em;
          flex-shrink: 0;
          font-family: var(--font-barlow-condensed), system-ui, sans-serif;
        }
        .lp-nav-name {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: 0.02em;
          font-family: var(--font-barlow-condensed), system-ui, sans-serif;
          text-transform: uppercase;
        }
        .lp-nav-tagline {
          font-size: 10px;
          color: #8895A7;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .lp-nav-right {
          font-size: 12px;
          color: #64748B;
          font-weight: 500;
        }
        .lp-nav-right a {
          color: #1E3D72;
          font-weight: 700;
          text-decoration: none;
        }
        .lp-nav-right a:hover { text-decoration: underline; }

        /* ── Main body ── */
        .lp-body {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
          position: relative;
          overflow: hidden;
          background: #F0F4FB;
        }

        /* ── Car silhouette ── */
        .lp-car-bg {
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: min(860px, 110vw);
          pointer-events: none;
          user-select: none;
          opacity: 1;
        }

        /* ── Customer card ── */
        .lp-card {
          background: #FFFFFF;
          border: 1px solid #D8E0EE;
          border-radius: 0;
          width: 100%;
          max-width: 420px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(30,61,114,0.10);
          position: relative;
          z-index: 2;
        }

        .lp-card-header {
          background: #1E3D72;
          padding: 28px 32px 24px;
        }
        .lp-card-header-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          margin-bottom: 4px;
          font-family: var(--font-barlow-condensed), system-ui, sans-serif;
        }
        .lp-card-header-title {
          font-size: 24px;
          font-weight: 700;
          color: #FFFFFF;
          letter-spacing: 0.01em;
          line-height: 1.1;
          font-family: var(--font-barlow-condensed), system-ui, sans-serif;
        }
        .lp-card-header-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          margin-top: 4px;
          font-weight: 400;
        }

        .lp-card-body {
          padding: 28px 32px 24px;
        }

        .lp-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-bottom: 16px;
        }
        .lp-label {
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .lp-input {
          font-size: 14px;
          font-weight: 400;
          padding: 9px 12px;
          background: #F8FAFC;
          border: 1px solid #CBD5E1;
          border-radius: 4px;
          color: #0F172A;
          outline: none;
          transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
          width: 100%;
        }
        .lp-input::placeholder { color: #94A3B8; }
        .lp-input:focus {
          border-color: #1E3D72;
          background: #FFFFFF;
          box-shadow: 0 0 0 2px rgba(30,61,114,0.12);
        }

        .lp-error {
          font-size: 12px;
          font-weight: 500;
          color: #B91C1C;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 4px;
          padding: 8px 12px;
          margin-bottom: 14px;
        }

        .lp-btn {
          width: 100%;
          background: #1E3D72;
          color: #FFFFFF;
          border: none;
          border-radius: 0;
          padding: 12px 20px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: background 0.18s, transform 0.1s;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-family: var(--font-barlow-condensed), system-ui, sans-serif;
        }
        .lp-btn:hover:not(:disabled) { background: #163060; }
        .lp-btn:active:not(:disabled) { transform: scale(0.99); }
        .lp-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .lp-card-footer {
          padding: 0 32px 24px;
          text-align: center;
          border-top: 1px solid #F1F5F9;
          margin-top: 4px;
          padding-top: 16px;
        }
        .lp-card-footer p {
          font-size: 12.5px;
          color: #64748B;
          font-weight: 400;
        }
        .lp-card-footer a {
          color: #1E3D72;
          font-weight: 700;
          text-decoration: none;
        }
        .lp-card-footer a:hover { text-decoration: underline; }

        /* ── Employee footer — hover-reveal ── */
        .lp-emp {
          flex-shrink: 0;
          background: #0F1E3A;
          position: relative;
          z-index: 10;
        }

        /* The always-visible strip */
        .lp-emp-strip {
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: default;
          transition: background 0.2s;
        }
        .lp-emp-strip-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          flex-shrink: 0;
        }
        .lp-emp-strip-text {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          transition: color 0.2s;
        }
        .lp-emp-strip-chevron {
          transition: transform 0.35s ease, opacity 0.2s;
          opacity: 0.25;
          color: rgba(255,255,255,0.4);
        }

        /* The expandable panel */
        .lp-emp-panel {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.38s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.28s ease;
          opacity: 0;
        }
        .lp-emp-panel-inner {
          padding: 0 32px 24px;
          max-width: 900px;
          margin: 0 auto;
        }
        .lp-emp-form-row {
          display: flex;
          gap: 10px;
          align-items: flex-end;
          flex-wrap: wrap;
        }
        .lp-emp-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 160px;
        }
        .lp-emp-field-label {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .lp-emp-input {
          font-size: 13px;
          padding: 9px 12px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 4px;
          color: #FFFFFF;
          outline: none;
          transition: border-color 0.18s, background 0.18s;
          width: 100%;
        }
        .lp-emp-input::placeholder { color: rgba(255,255,255,0.22); }
        .lp-emp-input:focus {
          border-color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.09);
        }
        .lp-emp-btn {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 0;
          color: #FFFFFF;
          padding: 9px 20px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.18s, border-color 0.18s;
          height: 38px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          flex-shrink: 0;
          font-family: var(--font-barlow-condensed), system-ui, sans-serif;
        }
        .lp-emp-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.35);
        }
        .lp-emp-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .lp-emp-error {
          width: 100%;
          font-size: 11.5px;
          font-weight: 500;
          color: #FCA5A5;
          margin-top: 6px;
        }
        .lp-emp-sub {
          width: 100%;
          font-size: 11px;
          color: rgba(255,255,255,0.22);
          margin-top: 6px;
        }
        .lp-emp-sub a {
          color: rgba(255,255,255,0.4);
          font-weight: 600;
          text-decoration: none;
        }
        .lp-emp-sub a:hover { color: rgba(255,255,255,0.65); }

        /* Expand on hover OR when an input inside is focused */
        .lp-emp:hover .lp-emp-panel,
        .lp-emp:focus-within .lp-emp-panel {
          max-height: 180px;
          opacity: 1;
        }
        .lp-emp:hover .lp-emp-strip {
          background: rgba(255,255,255,0.03);
        }
        .lp-emp:hover .lp-emp-strip-text,
        .lp-emp:focus-within .lp-emp-strip-text {
          color: rgba(255,255,255,0.55);
        }
        .lp-emp:hover .lp-emp-strip-chevron,
        .lp-emp:focus-within .lp-emp-strip-chevron {
          transform: rotate(180deg);
          opacity: 0.5;
        }

        /* ── Mobile ── */
        @media (max-width: 600px) {
          .lp-nav { padding: 0 20px; }
          .lp-card-header { padding: 22px 22px 18px; }
          .lp-card-body { padding: 22px 22px 20px; }
          .lp-card-footer { padding: 16px 22px 20px; }
          .lp-emp-panel-inner { padding: 0 20px 20px; }
          .lp-emp-form-row { flex-direction: column; }
          .lp-emp-btn { width: 100%; justify-content: center; }
          .lp-nav-tagline { display: none; }
          .lp-nav-right { display: none; }
          .lp-emp:hover .lp-emp-panel,
          .lp-emp:focus-within .lp-emp-panel {
            max-height: 320px;
          }
        }
      `}</style>

      <div className="lp-root">

        {/* ── Top nav ── */}
        <nav className="lp-nav">
          <div className="lp-nav-logo">
            <div className="lp-nav-badge">SM</div>
            <div>
              <div className="lp-nav-name">Smith Motors</div>
              <div className="lp-nav-tagline">Your Trusted Local Dealer</div>
            </div>
          </div>
          <div className="lp-nav-right">
            New customer?{" "}
            <Link href="/register">Create an account</Link>
          </div>
        </nav>

        {/* ── Customer sign-in (centered, car silhouette behind) ── */}
        <main className="lp-body">

          {/* Car silhouette SVG */}
          <svg
            className="lp-car-bg"
            viewBox="0 0 860 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Ground shadow */}
            <ellipse cx="430" cy="212" rx="370" ry="7" fill="rgba(0,0,0,0.06)" />

            {/* Main body lower sill */}
            <path
              d="M 108 168 L 752 168 Q 770 168 778 158 L 788 142 Q 792 134 784 130
                 L 738 122 L 718 122 L 690 66 Q 682 52 668 48 L 560 42 L 480 40 L 380 40
                 L 272 42 L 192 48 Q 178 52 170 66 L 142 122 L 122 122 L 76 130
                 Q 68 134 72 142 L 82 158 Q 90 168 108 168 Z"
              fill="rgba(180,190,205,0.22)"
              stroke="rgba(120,140,165,0.28)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Cabin / greenhouse */}
            <path
              d="M 272 42 L 292 14 Q 298 6 308 4 L 552 4 Q 562 6 568 14 L 588 42 Z"
              fill="rgba(160,175,195,0.18)"
              stroke="rgba(120,140,165,0.25)"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* Windshield glare */}
            <path
              d="M 310 8 L 296 40 L 380 40 L 372 8 Z"
              fill="rgba(255,255,255,0.07)"
            />
            <path
              d="M 488 8 L 568 40 L 564 40 L 488 10 Z"
              fill="rgba(255,255,255,0.04)"
            />

            {/* Body highlight line */}
            <path
              d="M 110 150 Q 280 140 430 138 Q 580 136 750 150"
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1"
            />

            {/* Front bumper detail */}
            <path
              d="M 76 130 Q 60 132 56 140 L 54 148 Q 53 158 62 162 L 108 168"
              fill="rgba(160,175,195,0.15)"
              stroke="rgba(120,140,165,0.2)"
              strokeWidth="1"
            />
            {/* Rear bumper detail */}
            <path
              d="M 784 130 Q 800 132 804 140 L 806 148 Q 807 158 798 162 L 752 168"
              fill="rgba(160,175,195,0.15)"
              stroke="rgba(120,140,165,0.2)"
              strokeWidth="1"
            />

            {/* Front headlight */}
            <path
              d="M 60 138 L 74 130 L 74 136 L 62 144 Z"
              fill="rgba(200,215,230,0.3)"
              stroke="rgba(150,170,195,0.3)"
              strokeWidth="0.8"
            />
            {/* Rear taillight */}
            <path
              d="M 800 138 L 786 130 L 786 136 L 798 144 Z"
              fill="rgba(200,140,140,0.2)"
              stroke="rgba(180,120,120,0.25)"
              strokeWidth="0.8"
            />

            {/* Front wheel well */}
            <path
              d="M 142 122 Q 132 140 128 155 Q 126 165 135 168 L 200 168 Q 210 165 212 155 Q 212 140 202 122 Z"
              fill="rgba(150,165,185,0.12)"
            />
            {/* Rear wheel well */}
            <path
              d="M 658 122 Q 648 140 644 155 Q 642 165 651 168 L 716 168 Q 726 165 728 155 Q 728 140 718 122 Z"
              fill="rgba(150,165,185,0.12)"
            />

            {/* Front wheel */}
            <circle cx="172" cy="182" r="30"
              fill="rgba(140,155,175,0.15)"
              stroke="rgba(110,130,155,0.28)"
              strokeWidth="1.5"
            />
            <circle cx="172" cy="182" r="18"
              fill="rgba(130,145,165,0.1)"
              stroke="rgba(110,130,155,0.18)"
              strokeWidth="1"
            />
            <circle cx="172" cy="182" r="6"
              fill="rgba(140,155,175,0.2)"
              stroke="rgba(110,130,155,0.2)"
              strokeWidth="1"
            />
            {/* Front wheel spokes */}
            {[0,60,120,180,240,300].map((deg, i) => {
              const r = Math.PI * deg / 180;
              return (
                <line key={i}
                  x1={172 + 7 * Math.cos(r)} y1={182 + 7 * Math.sin(r)}
                  x2={172 + 17 * Math.cos(r)} y2={182 + 17 * Math.sin(r)}
                  stroke="rgba(110,130,155,0.18)" strokeWidth="1.2"
                />
              );
            })}

            {/* Rear wheel */}
            <circle cx="688" cy="182" r="30"
              fill="rgba(140,155,175,0.15)"
              stroke="rgba(110,130,155,0.28)"
              strokeWidth="1.5"
            />
            <circle cx="688" cy="182" r="18"
              fill="rgba(130,145,165,0.1)"
              stroke="rgba(110,130,155,0.18)"
              strokeWidth="1"
            />
            <circle cx="688" cy="182" r="6"
              fill="rgba(140,155,175,0.2)"
              stroke="rgba(110,130,155,0.2)"
              strokeWidth="1"
            />
            {/* Rear wheel spokes */}
            {[0,60,120,180,240,300].map((deg, i) => {
              const r = Math.PI * deg / 180;
              return (
                <line key={i}
                  x1={688 + 7 * Math.cos(r)} y1={182 + 7 * Math.sin(r)}
                  x2={688 + 17 * Math.cos(r)} y2={182 + 17 * Math.sin(r)}
                  stroke="rgba(110,130,155,0.18)" strokeWidth="1.2"
                />
              );
            })}

            {/* Ground line */}
            <line x1="40" y1="212" x2="820" y2="212" stroke="rgba(0,0,0,0.07)" strokeWidth="1" />
          </svg>

          {/* Customer sign-in card */}
          <div className="lp-card">

            <div className="lp-card-header">
              <div className="lp-card-header-label">Customer Portal</div>
              <div className="lp-card-header-title">Welcome back</div>
              <div className="lp-card-header-sub">Sign in to manage your vehicles &amp; inquiries</div>
            </div>

            <div className="lp-card-body">
              <form onSubmit={handleCustomerSignIn}>
                <div className="lp-field">
                  <label className="lp-label">Email Address</label>
                  <input
                    className="lp-input"
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    required
                    autoFocus
                    placeholder="you@example.com"
                  />
                </div>
                <div className="lp-field">
                  <label className="lp-label">Password</label>
                  <input
                    className="lp-input"
                    type="password"
                    value={custPassword}
                    onChange={(e) => setCustPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>

                {custError && <div className="lp-error">{custError}</div>}

                <button type="submit" disabled={loading === "customer"} className="lp-btn">
                  {loading === "customer" ? "Signing in…" : "Sign In"}
                  {loading !== "customer" && (
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              </form>
            </div>

            <div className="lp-card-footer">
              <p>Don&apos;t have an account? <Link href="/register">Create one — it&apos;s free</Link></p>
            </div>

          </div>
        </main>

        {/* ── Employee sign-in — hover to reveal ── */}
        <footer className="lp-emp">

          {/* Always-visible strip */}
          <div className="lp-emp-strip">
            <div className="lp-emp-strip-dot" />
            <span className="lp-emp-strip-text">Employee Access</span>
            <svg
              className="lp-emp-strip-chevron"
              width="12" height="12"
              fill="none" stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
            </svg>
          </div>

          {/* Expandable form */}
          <div className="lp-emp-panel">
            <div className="lp-emp-panel-inner">
              <form onSubmit={handleEmployeeSignIn}>
                <div className="lp-emp-form-row">
                  <div className="lp-emp-field">
                    <label className="lp-emp-field-label">Work Email</label>
                    <input
                      className="lp-emp-input"
                      type="email"
                      value={empEmail}
                      onChange={(e) => setEmpEmail(e.target.value)}
                      required
                      placeholder="you@smithmotors.com"
                    />
                  </div>
                  <div className="lp-emp-field">
                    <label className="lp-emp-field-label">Password</label>
                    <input
                      className="lp-emp-input"
                      type="password"
                      value={empPassword}
                      onChange={(e) => setEmpPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                    />
                  </div>
                  <button type="submit" disabled={loading === "employee"} className="lp-emp-btn">
                    {loading === "employee" ? "…" : "Sign In"}
                    {loading !== "employee" && (
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                  {empError && <p className="lp-emp-error">{empError}</p>}
                  <p className="lp-emp-sub">
                    New team member? <Link href="/register">Request access</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>

        </footer>

      </div>
    </>
  );
}
