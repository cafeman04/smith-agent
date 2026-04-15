"use client";

import { cn } from "@/components/ui/cn";

interface HandoffBannerProps {
  salespersonName?: string;
  salespersonJoined?: boolean;
  message?: string;
  className?: string;
}

export function HandoffBanner({ salespersonName, salespersonJoined, message, className }: HandoffBannerProps) {
  if (salespersonJoined && salespersonName) {
    return (
      <div className={cn("bg-emerald-50 border border-emerald-200 rounded px-4 py-3 flex items-start gap-3", className)}>
        <div className="flex-shrink-0 w-7 h-7 bg-emerald-700 flex items-center justify-center text-white text-xs font-bold">
          ✓
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-800 tracking-tight">
            Connected with {salespersonName}
          </p>
          <p className="text-xs text-emerald-700 mt-0.5">
            {message || "You're now chatting directly with your sales specialist."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-amber-50 border border-amber-200 rounded px-4 py-3 flex items-start gap-3", className)}>
      <div className="flex-shrink-0 w-7 h-7 bg-amber-100 border border-amber-200 flex items-center justify-center">
        <svg className="w-3.5 h-3.5 text-amber-600 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-amber-800 tracking-tight">
          Connecting you with a specialist
        </p>
        <p className="text-xs text-amber-700 mt-0.5">
          {message || "A sales specialist has been notified. They'll join this chat shortly."}
        </p>
      </div>
    </div>
  );
}
