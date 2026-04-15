"use client";

import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";

interface LiveMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  senderName?: string;
}

interface LiveChatPanelProps {
  sessionId: string;
  customerId: string;
  customerName: string | null;
  assignmentStatus: string;
  salespersonName: string;
}

export function LiveChatPanel({
  sessionId,
  customerId,
  customerName,
  assignmentStatus: initialStatus,
  salespersonName,
}: LiveChatPanelProps) {
  const [status, setStatus] = useState(initialStatus);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [input, setInput] = useState("");
  const [joining, setJoining] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastFetched, setLastFetched] = useState<string>(new Date(0).toISOString());
  const bottomRef = useRef<HTMLDivElement>(null);

  // Poll for new messages when IN_PROGRESS
  useEffect(() => {
    if (status !== "IN_PROGRESS" && status !== "PENDING") return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/salesperson/live-chat?sessionId=${sessionId}&after=${lastFetched}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.messages?.length) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = data.messages.filter((m: LiveMessage) => !existingIds.has(m.id));
            return [...prev, ...newMsgs].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          });
          setLastFetched(new Date().toISOString());
        }
        if (data.assignmentStatus) setStatus(data.assignmentStatus);
      } catch {
        // ignore
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [sessionId, status, lastFetched]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await fetch("/api/salesperson/live-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, customerId, action: "join" }),
      });
      if (res.ok) {
        setStatus("IN_PROGRESS");
        setLastFetched(new Date(0).toISOString()); // fetch all messages
      }
    } finally {
      setJoining(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    // Optimistic
    const optimistic: LiveMessage = {
      id: `opt-${Date.now()}`,
      role: "SALESPERSON",
      content,
      createdAt: new Date().toISOString(),
      senderName: salespersonName,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await fetch("/api/salesperson/live-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, customerId, action: "message", content }),
      });
      setLastFetched(new Date(0).toISOString());
    } finally {
      setSending(false);
    }
  };

  if (status === "CLOSED_WON" || status === "CLOSED_LOST") return null;

  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
        <div className={`w-1.5 h-1.5 ${status === "IN_PROGRESS" ? "bg-emerald-500" : "bg-amber-400"}`} />
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.1em]">Live Chat</p>
        <span className="ml-auto text-[10px] text-slate-400">
          {status === "IN_PROGRESS" ? "Active" : "Waiting"}
        </span>
      </div>

      {/* Join prompt */}
      {status === "PENDING" && (
        <div className="p-5 text-center">
          <div className="w-10 h-10 border border-amber-200 bg-amber-50 flex items-center justify-center mx-auto mb-3">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-900 mb-1 tracking-tight">
            {customerName || "A customer"} is waiting
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Join the live chat to continue their conversation
          </p>
          <button
            onClick={handleJoin}
            disabled={joining}
            className="bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors tracking-wide"
          >
            {joining ? "Joining…" : "Join Conversation"}
          </button>
        </div>
      )}

      {/* Live chat messages */}
      {status === "IN_PROGRESS" && (
        <>
          <div className="h-48 overflow-y-auto px-3 py-3 space-y-2 thin-scroll">
            {messages.length === 0 && (
              <p className="text-xs text-slate-400 text-center mt-8">
                No messages yet — say hello!
              </p>
            )}
            {messages.map((m) => {
              const isSP = m.role === "SALESPERSON";
              const isUser = m.role === "USER";
              return (
                <div key={m.id} className={`flex ${isSP ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded px-3 py-2 text-xs ${
                    isSP
                      ? "bg-slate-900 text-white"
                      : isUser
                        ? "bg-slate-100 text-slate-800"
                        : "bg-blue-50 text-blue-800 italic"
                  }`}>
                    {!isSP && (
                      <p className="text-[10px] font-semibold mb-0.5 opacity-60">
                        {isUser ? (customerName || "Customer") : "AI"}
                      </p>
                    )}
                    <p className="leading-relaxed">{m.content}</p>
                    <p className="mt-1 text-[10px] opacity-50">
                      {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 px-3 py-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
              placeholder="Reply to customer…"
              className="flex-1 text-sm border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="bg-slate-900 text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}
