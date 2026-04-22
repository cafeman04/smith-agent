"use client";

import { cn } from "@/components/ui/cn";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface CustomerCardProps {
  assignmentId: string;
  customerId: string;
  sessionId: string;
  customerName?: string;
  customerEmail: string;
  intentScore: number;
  assignmentStatus: string;
  lastActivity: string;
  summary: string;
  recommendedMarkup?: number;
  urgency?: "COLD" | "WARM" | "HOT";
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:      "bg-amber-50 text-amber-700",
  ACKNOWLEDGED: "bg-blue-50 text-blue-700",
  IN_PROGRESS:  "bg-emerald-50 text-emerald-700",
  CLOSED_WON:   "bg-slate-100 text-slate-500",
  CLOSED_LOST:  "bg-red-50 text-red-600",
};

function IntentBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-400" : "bg-slate-300";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-slate-100 overflow-hidden">
        <div className={cn("h-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-bold text-slate-600 w-8 text-right font-mono">{pct}%</span>
    </div>
  );
}

export function CustomerCard({
  customerId,
  sessionId,
  customerName,
  customerEmail,
  intentScore,
  assignmentStatus,
  lastActivity,
  summary,
  recommendedMarkup,
  urgency,
}: CustomerCardProps) {
  const isHot = urgency === "HOT";
  const router = useRouter();
  const [joining, setJoining] = useState(false);

  const handleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setJoining(true);
    try {
      await fetch("/api/salesperson/live-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, customerId, action: "join" }),
      });
    } finally {
      setJoining(false);
      router.push(`/salesperson/customers/${customerId}`);
    }
  };

  return (
    <Link href={`/salesperson/customers/${customerId}`}>
      <div
        className={cn(
          "bg-white border rounded-md p-4 hover:shadow-sm transition-all cursor-pointer",
          isHot
            ? "border-2 border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)] animate-pulse-slow"
            : "border-slate-200 hover:border-slate-400"
        )}
      >
        {isHot && (
          <div className="-mx-4 -mt-4 mb-3 px-4 py-1.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-[0.12em] rounded-t flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Hot Lead — Join Now
          </div>
        )}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-semibold text-sm text-slate-900 tracking-tight">
              {customerName || customerEmail}
            </p>
            <p className="text-xs text-slate-400">{customerEmail}</p>
          </div>
          <span className={cn("text-[10px] px-2 py-0.5 font-semibold uppercase tracking-[0.06em]", STATUS_COLORS[assignmentStatus])}>
            {assignmentStatus.replace(/_/g, " ")}
          </span>
        </div>

        <div className="mb-3">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-1.5">Buying Intent</p>
          <IntentBar score={intentScore} />
        </div>

        {recommendedMarkup !== undefined && (
          <div className="mb-3 bg-blue-50 border border-blue-100 rounded px-3 py-1.5">
            <span className="text-blue-700 text-xs font-semibold">
              AI: Open at +{recommendedMarkup}% over MSRP
            </span>
          </div>
        )}

        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{summary}</p>

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-slate-400">
            {formatDistanceToNow(new Date(lastActivity), { addSuffix: true })}
          </p>

          {assignmentStatus === "PENDING" && (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="text-[10px] bg-navy text-white px-3 py-1 rounded hover:bg-navy-hover disabled:opacity-50 transition-colors font-semibold uppercase tracking-[0.06em]"
            >
              {joining ? "Joining…" : "Join Chat"}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
