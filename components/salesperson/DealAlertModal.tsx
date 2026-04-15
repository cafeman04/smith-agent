"use client";

import { useState, useEffect } from "react";

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  msrp: number;
  salePrice: number | null;
}

export function DealAlertModal() {
  const [open, setOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [vehicleId, setVehicleId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/admin/price-alert")
      .then((r) => r.json())
      .then((d) => {
        setVehicles(d.vehicles ?? []);
        setSubscriberCount(d.subscriberCount ?? 0);
      });
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    setStatus("idle");
    setResult(null);
    setSubject("");
    setMessage("");
    setVehicleId("");
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return;
    setStatus("loading");
    const res = await fetch("/api/admin/price-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message, vehicleId: vehicleId || undefined }),
    });
    const data = await res.json();
    if (res.ok) {
      setResult(data);
      setStatus("sent");
    } else {
      setStatus("error");
    }
  };

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-semibold px-3 py-1.5 uppercase tracking-[0.06em] transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        Deal Alert
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white border border-slate-200 rounded-md shadow-2xl w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h2 className="font-semibold text-slate-900 tracking-tight">Send Deal Alert</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {subscriberCount} subscriber{subscriberCount !== 1 ? "s" : ""} will receive this
                </p>
              </div>
              <button onClick={handleClose} className="text-slate-400 hover:text-slate-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {status === "sent" && result ? (
              <div className="px-6 py-10 text-center">
                <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-semibold text-slate-900 mb-1">Alert sent</p>
                <p className="text-sm text-slate-500">
                  {result.sent} delivered{result.failed > 0 ? `, ${result.failed} failed` : ""}
                </p>
                <button
                  onClick={handleClose}
                  className="mt-6 bg-navy text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-navy-hover transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="px-6 py-5 space-y-4">
                {/* Vehicle picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-[0.08em] mb-1.5">
                    Featured Vehicle <span className="text-slate-400 normal-case font-normal">(optional)</span>
                  </label>
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
                  >
                    <option value="">No specific vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model}{v.trim ? ` ${v.trim}` : ""} — ${v.msrp.toLocaleString()}
                        {v.salePrice && v.salePrice < v.msrp ? ` → $${v.salePrice.toLocaleString()}` : ""}
                      </option>
                    ))}
                  </select>
                  {selectedVehicle?.salePrice && selectedVehicle.salePrice < selectedVehicle.msrp && (
                    <p className="text-xs text-emerald-600 mt-1">
                      Price drop: ${(selectedVehicle.msrp - selectedVehicle.salePrice).toLocaleString()} off MSRP
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-[0.08em] mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Limited-time price drop on the 2024 CR-V"
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-[0.08em] mb-1.5">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a short note to your subscribers about this deal…"
                    rows={4}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 resize-none"
                  />
                </div>

                {status === "error" && (
                  <p className="text-xs text-red-600">Something went wrong. Please try again.</p>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleSend}
                    disabled={status === "loading" || !subject.trim() || !message.trim() || subscriberCount === 0}
                    className="bg-navy text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-navy-hover disabled:opacity-50 transition-colors tracking-wide"
                  >
                    {status === "loading" ? "Sending…" : `Send to ${subscriberCount} subscriber${subscriberCount !== 1 ? "s" : ""}`}
                  </button>
                  <button
                    onClick={handleClose}
                    className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
