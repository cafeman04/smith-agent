"use client";

import { useEffect, useState } from "react";
import type { PricingRecommendation } from "@/types/agent";
import { cn } from "@/components/ui/cn";

interface PriceRecommendationWidgetProps {
  sessionId: string;
}

export function PriceRecommendationWidget({ sessionId }: PriceRecommendationWidgetProps) {
  const [rec, setRec] = useState<PricingRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/salesperson/recommendation?sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((data) => setRec(data))
      .catch(() => setError("Could not load recommendation"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-md p-4 animate-pulse">
        <div className="h-3 bg-slate-200 rounded w-1/2 mb-2" />
        <div className="h-3 bg-slate-200 rounded w-3/4" />
      </div>
    );
  }

  if (error || !rec) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-sm text-slate-500">
        {error || "No recommendation available"}
      </div>
    );
  }

  const confidenceColors = {
    low: "bg-amber-50 text-amber-700",
    medium: "bg-blue-50 text-blue-700",
    high: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.1em]">AI Pricing Recommendation</p>
        <span className={cn("text-[10px] px-2 py-0.5 font-semibold uppercase tracking-[0.04em]", confidenceColors[rec.confidenceLevel])}>
          {rec.confidenceLevel}
        </span>
      </div>

      <div className="p-4">
        <div className="bg-navy text-white px-4 py-3 text-center mb-3">
          <p className="text-2xl font-bold tracking-tight">+{rec.openingMarkupPercent}%</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.06em] mt-0.5">Opening markup over MSRP</p>
        </div>

        <p className="text-xs text-slate-600 mb-3 leading-relaxed">{rec.rationale}</p>

        <div className="mb-3">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-1.5">Talking points</p>
          <ul className="space-y-1">
            {rec.talkingPoints.map((point, i) => (
              <li key={i} className="text-xs text-slate-600 flex gap-2">
                <span className="text-slate-300 mt-0.5 shrink-0">—</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-slate-100 pt-2.5">
          <p className="text-xs text-slate-500">
            Negotiation floor:{" "}
            <span className="font-bold text-slate-900 font-mono">
              ${rec.negotiationFloor.toLocaleString()}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
