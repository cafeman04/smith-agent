import prisma from "@/lib/prisma";
import Link from "next/link";

export async function MetricsPreviewCard() {
  const [assignmentRows, sessionRows, activeAssignments] = await Promise.all([
    prisma.assignment.findMany({
      select: { status: true, intentScore: true },
    }),
    prisma.chatSession.findMany({
      select: { intentScore: true },
    }),
    prisma.assignment.findMany({
      where: { status: { in: ["PENDING", "ACKNOWLEDGED", "IN_PROGRESS"] } },
      include: {
        session: {
          include: {
            vehicleMentions: {
              include: { vehicle: { select: { msrp: true } } },
              orderBy: { sentiment: "desc" },
              take: 1,
            },
          },
        },
      },
    }),
  ]);

  // Win rate
  const won  = assignmentRows.filter(a => a.status === "CLOSED_WON").length;
  const lost = assignmentRows.filter(a => a.status === "CLOSED_LOST").length;
  const closed = won + lost;
  const winRate = closed > 0 ? Math.round((won / closed) * 100) : 0;

  // Pipeline value
  const pipelineValue = activeAssignments.reduce(
    (sum, a) => sum + (a.session.vehicleMentions[0]?.vehicle.msrp ?? 33_000), 0
  );
  const pipelineLabel = pipelineValue >= 1_000_000
    ? `$${(pipelineValue / 1_000_000).toFixed(1)}M`
    : `$${Math.round(pipelineValue / 1000)}K`;

  // Avg intent
  const avgIntent = sessionRows.length > 0
    ? Math.round(sessionRows.reduce((s, x) => s + x.intentScore, 0) / sessionRows.length * 100)
    : 0;

  // Intent distribution (5 buckets, split at 0.72 handoff threshold)
  const buckets = [
    { color: "bg-slate-300",    min: 0,    max: 0.25, count: 0 },
    { color: "bg-amber-400",    min: 0.25, max: 0.50, count: 0 },
    { color: "bg-orange-500",   min: 0.50, max: 0.72, count: 0 },
    { color: "bg-emerald-500",  min: 0.72, max: 0.90, count: 0 },
    { color: "bg-emerald-700",  min: 0.90, max: 1.01, count: 0 },
  ];
  for (const { intentScore } of sessionRows) {
    for (const b of buckets) {
      if (intentScore >= b.min && intentScore < b.max) { b.count++; break; }
    }
  }
  const totalForBar = Math.max(sessionRows.length, 1);
  const aboveThreshold = buckets[3].count + buckets[4].count;

  const activeCount = activeAssignments.length;

  return (
    <Link href="/salesperson/metrics">
      <div className="bg-white border border-slate-200 rounded-md p-4 hover:border-slate-400 hover:shadow-sm transition-all cursor-pointer mt-3">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.1em]">Performance</p>
          <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-[0.06em]">View all →</span>
        </div>

        {/* Win rate + Pipeline */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className={`text-2xl font-bold tracking-tight ${winRate >= 50 ? "text-emerald-700" : winRate > 0 ? "text-amber-600" : "text-slate-300"}`}>
              {closed > 0 ? `${winRate}%` : "—"}
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.06em] mb-1">Win rate</p>
            <div className="h-0.5 bg-slate-100 overflow-hidden">
              <div
                className={`h-full transition-all ${winRate >= 50 ? "bg-emerald-500" : "bg-amber-400"}`}
                style={{ width: `${winRate}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">{won}W · {lost}L</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-700 tracking-tight font-mono">{pipelineLabel}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.06em] mb-1">Pipeline</p>
            <p className="text-[10px] text-slate-400">{activeCount} active</p>
          </div>
        </div>

        {/* Intent distribution mini-bar */}
        <div className="mb-3">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.06em] mb-1.5">Intent distribution</p>
          <div className="flex h-2 gap-px">
            {buckets.map((b, i) => (
              <div
                key={i}
                className={b.color}
                style={{ flex: Math.max(b.count, totalForBar * 0.02) }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-slate-400">Low</span>
            <span className="text-[10px] text-emerald-600 font-semibold">
              {aboveThreshold} above 72% ↑
            </span>
          </div>
        </div>

        {/* Footer stats */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 font-semibold uppercase tracking-[0.04em]">
            {avgIntent}% avg
          </span>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 font-semibold uppercase tracking-[0.04em]">
            {won} won
          </span>
          <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 font-semibold uppercase tracking-[0.04em]">
            {activeCount} active
          </span>
        </div>

      </div>
    </Link>
  );
}
