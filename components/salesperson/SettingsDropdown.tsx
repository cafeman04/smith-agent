"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";

interface SettingsDropdownProps {
  name: string | null;
  email: string;
  role: string;
}

const ROLE_LABEL: Record<string, string> = {
  SALESPERSON: "Sales Advisor",
  MANAGER: "Manager",
  ADMIN: "Admin",
};

export function SettingsDropdown({ name, email, role }: SettingsDropdownProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"profile" | "notifications">("profile");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : email.slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 hover:bg-slate-100 px-2 py-1 rounded transition-colors"
        aria-label="Settings"
      >
        <div className="w-7 h-7 bg-navy flex items-center justify-center text-white text-[10px] font-bold">
          {initials}
        </div>
        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-72 bg-white border border-slate-200 rounded-md shadow-lg z-50 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            {(["profile", "notifications"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 text-[10px] py-2.5 font-semibold uppercase tracking-[0.08em] transition-colors ${
                  tab === t
                    ? "text-slate-900 border-b-2 border-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Profile tab */}
          {tab === "profile" && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-navy flex items-center justify-center text-white font-bold text-sm">
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900 tracking-tight">{name || email}</p>
                  <p className="text-xs text-slate-400">{email}</p>
                  <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 font-semibold uppercase tracking-[0.06em]">
                    {ROLE_LABEL[role] ?? role}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-1 text-sm text-slate-700">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-2">Account</p>
                <p><span className="text-slate-400 w-14 inline-block text-xs">Name</span>{name ?? "—"}</p>
                <p><span className="text-slate-400 w-14 inline-block text-xs">Email</span>{email}</p>
                <p><span className="text-slate-400 w-14 inline-block text-xs">Role</span>{ROLE_LABEL[role] ?? role}</p>
              </div>
            </div>
          )}

          {/* Notifications tab */}
          {tab === "notifications" && (
            <div className="p-4 space-y-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em]">Alerts</p>
              {[
                { label: "New customer assigned", defaultOn: true },
                { label: "Appointment reminders", defaultOn: true },
                { label: "Customer message received", defaultOn: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{item.label}</span>
                  <button
                    className={`w-8 h-4 rounded-full transition-colors relative flex-shrink-0 ${
                      item.defaultOn ? "bg-navy" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${
                        item.defaultOn ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Sign out */}
          <div className="border-t border-slate-100 p-3">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 rounded px-3 py-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
