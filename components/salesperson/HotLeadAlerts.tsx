"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Assignment = {
  id: string;
  customerName: string | null;
  customerEmail: string;
  intentScore: number;
  urgency?: "COLD" | "WARM" | "HOT";
  createdAt: string;
};

type SSEEvent =
  | { type: "connected" | "ping"; timestamp: string }
  | { type: "new_assignment"; assignment: Assignment };

export function HotLeadAlerts() {
  const router = useRouter();
  const [hotLead, setHotLead] = useState<Assignment | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    const connect = () => {
      const es = new EventSource("/api/salesperson/events");
      es.onmessage = (e) => {
        try {
          const data: SSEEvent = JSON.parse(e.data);
          if (data.type === "new_assignment" && data.assignment.urgency === "HOT") {
            setHotLead(data.assignment);
            const who = data.assignment.customerName || data.assignment.customerEmail;
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("🔥 Hot Lead", {
                body: `${who} is showing strong buying intent — join the chat now.`,
                tag:  `hot-${data.assignment.id}`,
              });
            }
            audioRef.current?.play().catch(() => {});
            router.refresh();
          } else if (data.type === "new_assignment") {
            router.refresh();
          }
        } catch {
          /* ignore malformed event */
        }
      };
      es.onerror = () => {
        es.close();
        setTimeout(connect, 3000);
      };
      return es;
    };

    const es = connect();
    return () => es.close();
  }, [router]);

  return (
    <>
      {/* Tiny chime — short sine beep encoded inline so no asset dependency */}
      <audio
        ref={audioRef}
        src="data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
        preload="auto"
      />
      {hotLead && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-white border-2 border-red-500 shadow-xl rounded-md overflow-hidden animate-pulse-slow">
          <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.12em] flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse" />
              Hot Lead Alert
            </span>
            <button
              onClick={() => setHotLead(null)}
              className="text-white/80 hover:text-white text-lg leading-none"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
          <div className="p-4">
            <p className="text-sm font-semibold text-slate-900">
              {hotLead.customerName || hotLead.customerEmail}
            </p>
            <p className="text-xs text-slate-500 mb-3">
              Intent {Math.round(hotLead.intentScore * 100)}% — strong buying signals just detected.
            </p>
            <button
              onClick={() => {
                setHotLead(null);
                router.refresh();
              }}
              className="w-full bg-navy text-white text-xs font-semibold uppercase tracking-[0.06em] py-2 rounded hover:bg-navy-hover transition-colors"
            >
              View on Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
}
