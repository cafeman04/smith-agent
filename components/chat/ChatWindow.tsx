"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { useChat } from "@/hooks/useChat";
import { useHandoff } from "@/hooks/useHandoff";
import { MessageBubble } from "./MessageBubble";
import { HandoffBanner } from "./HandoffBanner";
import { cn } from "@/components/ui/cn";

const SUGGESTED_QUESTIONS = [
  "What SUVs do you have under $40,000?",
  "What are my financing options?",
  "Do you have any hybrid or electric vehicles?",
  "Can I schedule a test drive?",
];

export function ChatWindow({ initialMessage }: { initialMessage?: string }) {
  const { data: session } = useSession();
  const { messages, sessionId, isLoading, isHandedOff, handoffMessage, sendMessage } = useChat();
  const { salespersonName, salespersonJoined, salespersonMessages } = useHandoff(sessionId);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasSentInitial = useRef(false);

  // Guest upgrade modal state
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPassword, setGuestPassword] = useState("");
  const [guestError, setGuestError] = useState("");
  const [guestLoading, setGuestLoading] = useState(false);

  useEffect(() => {
    if (initialMessage && !hasSentInitial.current) {
      hasSentInitial.current = true;
      sendMessage(initialMessage);
    }
  }, [initialMessage, sendMessage]);

  // Merge AI/user messages with salesperson messages, sorted by time
  const allMessages = useMemo(() => {
    return [...messages, ...salespersonMessages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages, salespersonMessages]);

  const userMessageCount = messages.filter((m) => m.role === "user").length;

  useEffect(() => {
    if (userMessageCount >= 3 && session?.user?.role === "GUEST" && !showGuestModal) {
      setShowGuestModal(true);
    }
  }, [userMessageCount, session?.user?.role, showGuestModal]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const handleSend = () => {
    if (!input.trim() || isInputDisabled) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleGuestUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuestError("");
    setGuestLoading(true);
    try {
      const res = await fetch("/api/auth/convert-guest", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: guestEmail, name: guestName || undefined, password: guestPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGuestError(data.error === "Email already registered" ? "That email is already in use." : "Something went wrong. Please try again.");
        setGuestLoading(false);
        return;
      }
      await signOut({ redirect: false });
      await signIn("credentials", { email: guestEmail, password: guestPassword, redirect: false });
      setShowGuestModal(false);
    } catch {
      setGuestError("Something went wrong. Please try again.");
      setGuestLoading(false);
    }
  };

  // Disable input while waiting for salesperson or when guest modal is open
  const isInputDisabled = isLoading || (isHandedOff && !salespersonJoined) || showGuestModal;

  const inputPlaceholder = showGuestModal
    ? "Create an account to continue…"
    : isHandedOff && !salespersonJoined
      ? "Waiting for specialist to join…"
      : isHandedOff
        ? `Message ${salespersonName ?? "your specialist"}…`
        : "Ask about our vehicles, financing, or anything else…";

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Guest upgrade modal overlay */}
      {showGuestModal && (
        <div className="absolute inset-0 z-20 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-2xl mb-2">🔓</div>
              <h3 className="font-semibold text-slate-900 tracking-tight">Keep the conversation going</h3>
              <p className="text-xs text-slate-500 mt-1">
                Create a free account to continue chatting and save your preferences.
              </p>
            </div>
            <form onSubmit={handleGuestUpgrade} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-[0.08em] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-[0.08em] mb-1">
                  Name <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your name"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-[0.08em] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={guestPassword}
                  onChange={(e) => setGuestPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                />
              </div>
              {guestError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {guestError}
                </p>
              )}
              <button
                type="submit"
                disabled={guestLoading}
                className="w-full bg-navy text-white rounded-md py-2.5 text-sm font-semibold hover:bg-navy-hover disabled:opacity-50 transition-colors"
              >
                {guestLoading ? "Creating account…" : "Create Account"}
              </button>
            </form>
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] text-slate-400 uppercase tracking-[0.06em]">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <a
              href="/login"
              className="block text-center text-sm text-blue-700 font-semibold hover:underline"
            >
              Sign in to existing account
            </a>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-200 px-4 py-3 flex items-center gap-3 bg-white">
        <div className="w-8 h-8 bg-navy flex items-center justify-center text-white font-bold text-xs tracking-tight">
          {salespersonJoined && salespersonName ? salespersonName[0].toUpperCase() : "SM"}
        </div>
        <div>
          <p className="font-semibold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
            {salespersonJoined && salespersonName ? salespersonName : "Smith Motors Assistant"}
            {!salespersonJoined && (
              <span className="relative group inline-flex items-center">
                <svg
                  className="w-3.5 h-3.5 text-slate-400 cursor-default"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-5 z-50 w-64 rounded bg-slate-800 px-3 py-2 text-xs text-slate-100 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  Alex draws on your dealership&apos;s live inventory, financing rate tables, and the full context of your conversation to answer questions and make recommendations — no outside data / bias is factored into recommendations.
                </span>
              </span>
            )}
          </p>
          <p className="text-xs flex items-center gap-1 text-emerald-600">
            <span className="w-1.5 h-1.5 bg-emerald-500 inline-block" />
            {salespersonJoined ? "Live chat" : "Online"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 thin-scroll">
        {allMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-12 h-12 bg-slate-100 border border-slate-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 tracking-tight">Welcome to Smith Motors</h2>
              <p className="text-sm text-slate-500 mt-1">
                I can help you find your perfect vehicle, explore financing options, and more.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-1.5 w-full max-w-sm">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left text-sm bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded px-3 py-2 text-slate-600 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {allMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isHandedOff && (
          <HandoffBanner
            salespersonName={salespersonName}
            salespersonJoined={salespersonJoined}
            message={salespersonJoined ? undefined : handoffMessage}
            className="my-4"
          />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 px-4 py-3 bg-white">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={inputPlaceholder}
            disabled={isInputDisabled}
            rows={1}
            className={cn(
              "flex-1 resize-none rounded border border-slate-300 px-4 py-2.5 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent",
              "max-h-32 overflow-y-auto",
              isInputDisabled && "bg-slate-50 text-slate-400 cursor-not-allowed"
            )}
            style={{ minHeight: "42px" }}
          />
          <button
            onClick={handleSend}
            disabled={isInputDisabled || !input.trim()}
            className={cn(
              "flex-shrink-0 w-10 h-10 bg-navy text-white flex items-center justify-center rounded",
              "hover:bg-navy-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            )}
          >
            {isLoading ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 text-center uppercase tracking-[0.06em]">
          Smith Motors · {isHandedOff ? "Live specialist" : "AI assistant"}
        </p>
      </div>
    </div>
  );
}
