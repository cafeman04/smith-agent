import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { PriceRecommendationWidget } from "@/components/salesperson/PriceRecommendationWidget";
import { LiveChatPanel } from "@/components/salesperson/LiveChatPanel";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !["SALESPERSON", "MANAGER", "ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const { customerId } = await params;

  const assignment = await prisma.assignment.findFirst({
    where: { customerId, salespersonId: session.user.id },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      session: {
        include: {
          messages: { orderBy: { createdAt: "asc" }, select: { id: true, role: true, content: true, createdAt: true } },
          vehicleMentions: { include: { vehicle: true }, orderBy: { mentionedAt: "desc" } },
        },
      },
    },
  });

  if (!assignment) notFound();

  const handoffPayload = JSON.parse(assignment.handoffPayload || "{}");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 h-14 flex items-center">
        <div className="max-w-5xl mx-auto w-full flex items-center gap-4">
          <Link href="/salesperson/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-900 uppercase tracking-[0.08em] transition-colors">
            ← Dashboard
          </Link>
          <div className="w-px h-4 bg-slate-200" />
          <h1 className="font-semibold text-slate-900 tracking-tight">
            {assignment.customer.name || assignment.customer.email}
          </h1>
          <span className="ml-auto text-[10px] bg-blue-50 text-blue-700 px-2.5 py-1 font-semibold uppercase tracking-[0.08em]">
            {assignment.status.replace(/_/g, " ")}
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Customer + summary */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer info */}
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.1em]">Customer Info</p>
            </div>
            <div className="p-5 space-y-1.5 text-sm">
              <p className="flex gap-2">
                <span className="text-slate-400 w-16 shrink-0 text-xs">Email</span>
                <span className="text-slate-900">{assignment.customer.email}</span>
              </p>
              {assignment.customer.phone && (
                <p className="flex gap-2">
                  <span className="text-slate-400 w-16 shrink-0 text-xs">Phone</span>
                  <span className="text-slate-900">{assignment.customer.phone}</span>
                </p>
              )}
              <p className="flex gap-2">
                <span className="text-slate-400 w-16 shrink-0 text-xs">Intent</span>
                <span className="font-bold text-blue-700 font-mono">{Math.round(assignment.intentScore * 100)}%</span>
              </p>
            </div>
          </div>

          {/* AI Summary */}
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.1em]">AI Handoff Summary</p>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{assignment.summary}</p>

              {handoffPayload.urgencySignals?.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.1em] mb-2">Urgency signals</p>
                  <div className="flex flex-wrap gap-1.5">
                    {handoffPayload.urgencySignals.map((s: string, i: number) => (
                      <span key={i} className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 font-semibold uppercase tracking-[0.04em]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-3 flex gap-4 text-xs text-slate-500">
                <span>{handoffPayload.financingMentioned ? "💰 Financing mentioned" : ""}</span>
                <span>{handoffPayload.tradeInMentioned ? "🔄 Trade-in mentioned" : ""}</span>
              </div>
            </div>
          </div>

          {/* Vehicles of interest */}
          {assignment.session.vehicleMentions.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
              <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.1em]">Vehicles of Interest</p>
              </div>
              <div className="p-5 space-y-2">
                {assignment.session.vehicleMentions.map((vm) => (
                  <div key={vm.id} className="flex items-center justify-between p-3 border border-slate-100 rounded bg-slate-50">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {vm.vehicle.year} {vm.vehicle.make} {vm.vehicle.model} {vm.vehicle.trim}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">VIN: {vm.vehicle.vin}</p>
                      {vm.vehicle.daysOnLot >= 60 ? (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-red-50 text-red-700 px-2 py-0.5 font-semibold uppercase tracking-[0.04em]">
                          {vm.vehicle.daysOnLot}d on lot — push for special
                        </span>
                      ) : vm.vehicle.daysOnLot >= 30 ? (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 font-semibold uppercase tracking-[0.04em]">
                          {vm.vehicle.daysOnLot}d on lot
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm font-bold text-slate-900 font-mono">
                      ${vm.vehicle.msrp.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat transcript */}
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.1em]">
                Chat Transcript — {assignment.session.messages.length} messages
              </p>
            </div>
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto thin-scroll">
              {assignment.session.messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "USER" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded px-3 py-2 text-xs ${
                      m.role === "USER"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <p className="leading-relaxed">{m.content}</p>
                    <p className={`mt-1 text-[10px] ${m.role === "USER" ? "text-slate-400" : "text-slate-400"}`}>
                      {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live chat + pricing + actions */}
        <div className="space-y-4">
          <LiveChatPanel
            sessionId={assignment.session.id}
            customerId={assignment.customer.id}
            customerName={assignment.customer.name}
            assignmentStatus={assignment.status}
            salespersonName={session.user.name ?? "Sales Advisor"}
          />

          <PriceRecommendationWidget sessionId={assignment.session.id} />

          {/* Status update */}
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.1em]">Update Status</p>
            </div>
            <div className="p-4 space-y-1.5">
              {[
                { value: "ACKNOWLEDGED", label: "Mark Acknowledged" },
                { value: "IN_PROGRESS", label: "Mark In Progress" },
                { value: "CLOSED_WON", label: "Close as Won" },
                { value: "CLOSED_LOST", label: "Close as Lost" },
              ].map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className="w-full text-left text-sm px-3 py-2 border border-slate-200 rounded text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={assignment.status === s.value}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <Link
            href={`/salesperson/appointments?customerId=${customerId}`}
            className="block w-full bg-slate-900 text-white text-center py-2.5 rounded-md text-sm font-semibold hover:bg-slate-800 transition-colors tracking-wide"
          >
            Schedule Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
