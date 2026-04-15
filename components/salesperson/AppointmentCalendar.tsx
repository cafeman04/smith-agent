"use client";

import { useState } from "react";

export interface CalendarAppointment {
  id: string;
  customerName: string | null;
  customerEmail: string;
  vehicleLabel: string | null;
  type: string;
  scheduledAt: string;
  status: string;
  notes: string | null;
}

interface AppointmentCalendarProps {
  appointments: CalendarAppointment[];
}

const TYPE_COLORS: Record<string, string> = {
  TEST_DRIVE:       "bg-slate-100 text-slate-700 border-slate-200",
  FINANCING_REVIEW: "bg-violet-100 text-violet-700 border-violet-200",
  DELIVERY:         "bg-emerald-100 text-emerald-700 border-emerald-200",
  SERVICE:          "bg-amber-100 text-amber-700 border-amber-200",
};

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED:  "bg-amber-100 text-amber-700",
  CONFIRMED:  "bg-emerald-100 text-emerald-700",
  COMPLETED:  "bg-slate-100 text-slate-600",
  CANCELLED:  "bg-red-100 text-red-600",
  NO_SHOW:    "bg-red-50 text-red-500",
};

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function AppointmentCalendar({ appointments }: AppointmentCalendarProps) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<CalendarAppointment | null>(null);
  const [dayDetail, setDayDetail] = useState<Date | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const apptsByDay = (d: number) => {
    const date = new Date(year, month, d);
    return appointments.filter((a) => sameDay(new Date(a.scheduledAt), date));
  };

  const MONTHS = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];
  const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const dayAppts = dayDetail
    ? appointments.filter((a) => sameDay(new Date(a.scheduledAt), dayDetail))
    : [];

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-900 uppercase tracking-[0.08em] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Calendar View
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => { setOpen(false); setDayDetail(null); setSelected(null); }}>
          <div className="bg-white rounded-md border border-slate-200 shadow-lg w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Calendar header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
              <button onClick={prevMonth} className="p-1.5 hover:bg-slate-200 transition-colors">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="font-semibold text-slate-900 text-sm">{MONTHS[month]} {year}</h2>
              <button onClick={nextMonth} className="p-1.5 hover:bg-slate-200 transition-colors">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day names row */}
            <div className="grid grid-cols-7 border-b border-slate-200">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-[9px] text-slate-400 font-semibold uppercase tracking-[0.08em] py-2">{d}</div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7">
              {/* leading blank cells */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`blank-${i}`} className="h-16 border-b border-r border-slate-100" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                const isToday = sameDay(new Date(year, month, d), today);
                const dayApptList = apptsByDay(d);
                const isSelected = dayDetail && sameDay(new Date(year, month, d), dayDetail);
                return (
                  <div
                    key={d}
                    onClick={() => setDayDetail(dayApptList.length > 0 ? new Date(year, month, d) : null)}
                    className={`h-16 border-b border-r border-slate-100 p-1 text-xs cursor-pointer transition-colors ${
                      dayApptList.length > 0 ? "hover:bg-slate-50" : ""
                    } ${isSelected ? "bg-slate-100" : ""}`}
                  >
                    <p className={`w-5 h-5 flex items-center justify-center mb-0.5 font-semibold text-[11px] ${
                      isToday ? "bg-slate-900 text-white" : "text-slate-600"
                    }`}>
                      {d}
                    </p>
                    {dayApptList.slice(0, 2).map((a) => (
                      <p
                        key={a.id}
                        onClick={(e) => { e.stopPropagation(); setSelected(a); setDayDetail(null); }}
                        className={`truncate text-[10px] rounded px-1 mb-0.5 cursor-pointer border ${
                          TYPE_COLORS[a.type] ?? "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {new Date(a.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        {" "}{a.customerName?.split(" ")[0] ?? "Guest"}
                      </p>
                    ))}
                    {dayApptList.length > 2 && (
                      <p className="text-[10px] text-slate-400 pl-1">+{dayApptList.length - 2} more</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Day detail panel */}
            {dayDetail && dayAppts.length > 0 && (
              <div className="border-t border-slate-200 p-4 max-h-48 overflow-y-auto">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.1em] mb-2">
                  {dayDetail.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
                <div className="space-y-2">
                  {dayAppts.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => { setSelected(a); setDayDetail(null); }}
                      className="flex items-center justify-between p-2 hover:bg-slate-50 cursor-pointer"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{a.customerName || a.customerEmail}</p>
                        {a.vehicleLabel && <p className="text-xs text-slate-500">{a.vehicleLabel}</p>}
                        <p className="text-xs text-slate-400">
                          {new Date(a.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-[0.06em] ${TYPE_COLORS[a.type]?.split(" border")[0] ?? "bg-slate-100 text-slate-600"}`}>
                          {a.type.replace(/_/g, " ")}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-[0.06em] ${STATUS_COLORS[a.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {a.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button onClick={() => { setOpen(false); setDayDetail(null); setSelected(null); }} className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 uppercase tracking-[0.06em] transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-semibold text-slate-900">{selected.customerName || selected.customerEmail}</p>
                <p className="text-xs text-slate-500">{selected.customerEmail}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-lg leading-none transition-colors">✕</button>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2 flex-wrap">
                <span className={`text-[10px] px-2 py-1 rounded font-semibold uppercase tracking-[0.06em] border ${TYPE_COLORS[selected.type] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                  {selected.type.replace(/_/g, " ")}
                </span>
                <span className={`text-[10px] px-2 py-1 rounded font-semibold uppercase tracking-[0.06em] ${STATUS_COLORS[selected.status] ?? "bg-slate-100 text-slate-600"}`}>
                  {selected.status}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {new Date(selected.scheduledAt).toLocaleDateString("en-US", {
                  weekday: "long", month: "long", day: "numeric",
                  hour: "numeric", minute: "2-digit",
                })}
              </p>
              {selected.vehicleLabel && (
                <p className="text-sm text-slate-700">{selected.vehicleLabel}</p>
              )}
              {selected.notes && (
                <p className="text-sm text-slate-600 bg-slate-50 rounded p-2">{selected.notes}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
