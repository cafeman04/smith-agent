"use client";

import { useState } from "react";

export interface StripAppointment {
  id: string;
  customerName: string | null;
  customerEmail: string;
  vehicleLabel: string | null;
  type: string;
  scheduledAt: string;
  status: string;
  notes: string | null;
}

interface WeekStripProps {
  appointments: StripAppointment[];
}

const TYPE_COLORS: Record<string, string> = {
  TEST_DRIVE:       "bg-blue-100 text-blue-700",
  FINANCING_REVIEW: "bg-violet-100 text-violet-700",
  DELIVERY:         "bg-emerald-100 text-emerald-700",
  SERVICE:          "bg-amber-100 text-amber-700",
};

function formatType(t: string) {
  return t.replace(/_/g, " ");
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function WeekStrip({ appointments }: WeekStripProps) {
  const [selected, setSelected] = useState<StripAppointment | null>(null);

  // Build 7-day window starting today
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const apptsByDay = days.map((day) =>
    appointments.filter((a) => sameDay(new Date(a.scheduledAt), day))
  );

  const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <div className="px-3 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.1em]">This Week</p>
          <p className="text-[10px] text-slate-400">
            {today.toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
            {days[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </div>
        <div className="grid grid-cols-7 divide-x divide-slate-100">
          {days.map((day, i) => {
            const isToday = sameDay(day, today);
            const dayAppts = apptsByDay[i];
            return (
              <div key={i} className="flex flex-col items-center py-2 px-0.5 min-h-[64px]">
                <p className={`text-[9px] font-semibold mb-0.5 uppercase tracking-[0.06em] ${isToday ? "text-blue-700" : "text-slate-400"}`}>
                  {DAY_NAMES[day.getDay()]}
                </p>
                <p className={`text-sm font-bold mb-1 w-6 h-6 flex items-center justify-center ${
                  isToday ? "bg-slate-900 text-white" : "text-slate-700"
                }`}>
                  {day.getDate()}
                </p>
                <div className="flex flex-col gap-0.5 w-full px-0.5">
                  {dayAppts.slice(0, 2).map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setSelected(a)}
                      className={`w-full text-[9px] truncate px-1 py-0.5 text-left font-semibold ${
                        TYPE_COLORS[a.type] ?? "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {a.customerName?.split(" ")[0] ?? "Guest"}
                    </button>
                  ))}
                  {dayAppts.length > 2 && (
                    <p className="text-[9px] text-slate-400 text-center">+{dayAppts.length - 2}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail popup */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelected(null)}>
          <div className="bg-white border border-slate-200 rounded-md shadow-2xl p-5 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-semibold text-slate-900 tracking-tight">{selected.customerName || selected.customerEmail}</p>
                <p className="text-xs text-slate-400">{selected.customerEmail}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-lg leading-none">×</button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2 flex-wrap">
                <span className={`text-[10px] px-2 py-0.5 font-semibold uppercase tracking-[0.06em] ${TYPE_COLORS[selected.type] ?? "bg-slate-100 text-slate-500"}`}>
                  {formatType(selected.type)}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 font-semibold uppercase tracking-[0.06em]">{selected.status}</span>
              </div>
              {selected.vehicleLabel && (
                <p className="text-slate-600 text-xs">{selected.vehicleLabel}</p>
              )}
              <p className="text-slate-900 font-semibold text-sm">
                {new Date(selected.scheduledAt).toLocaleDateString("en-US", {
                  weekday: "long", month: "long", day: "numeric",
                  hour: "numeric", minute: "2-digit",
                })}
              </p>
              {selected.notes && <p className="text-slate-500 text-xs italic">{selected.notes}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
