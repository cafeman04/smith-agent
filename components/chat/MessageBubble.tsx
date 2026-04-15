"use client";

import { cn } from "@/components/ui/cn";
import type { ChatMessage } from "@/types/chat";
import { formatDistanceToNow } from "date-fns";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSalesperson = message.role === "salesperson";

  if (isUser) {
    return (
      <div className="flex w-full mb-4 justify-end">
        <div className="max-w-[75%] flex flex-col items-end">
          <div className="rounded rounded-br-none px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap bg-slate-900 text-white">
            {message.content}
          </div>
          <span className="text-[10px] text-slate-400 mt-1">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
        </div>
        <div className="flex-shrink-0 w-7 h-7 bg-slate-200 flex items-center justify-center text-slate-600 text-[10px] font-bold ml-2">
          You
        </div>
      </div>
    );
  }

  if (isSalesperson) {
    const initial = message.senderName ? message.senderName[0].toUpperCase() : "S";
    return (
      <div className="flex w-full mb-4 justify-start">
        <div className="flex-shrink-0 w-7 h-7 bg-emerald-700 flex items-center justify-center text-white text-[10px] font-bold mr-2">
          {initial}
        </div>
        <div className="max-w-[75%] flex flex-col items-start">
          {message.senderName && (
            <p className="text-[10px] text-emerald-700 font-semibold mb-0.5 uppercase tracking-[0.06em]">{message.senderName}</p>
          )}
          <div className="rounded rounded-bl-none px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap bg-emerald-700 text-white">
            {message.content}
          </div>
          <span className="text-[10px] text-slate-400 mt-1">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    );
  }

  // AI assistant
  return (
    <div className="flex w-full mb-4 justify-start">
      <div className="flex-shrink-0 w-7 h-7 bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold mr-2">
        A
      </div>
      <div className="max-w-[75%] flex flex-col items-start">
        <div className="rounded rounded-bl-none px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap bg-slate-100 text-slate-900">
          {message.content || (
            <span className="inline-flex gap-1 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 mt-1">
          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}
