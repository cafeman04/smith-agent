import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatWindow } from "@/components/chat/ChatWindow";
import Link from "next/link";

export default async function CustomerChatPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto w-full flex flex-col" style={{ height: "100dvh" }}>
        <div className="px-4 h-10 border-b border-slate-200 bg-white flex items-center">
          <Link href="/customer/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-900 uppercase tracking-[0.08em] transition-colors">
            ← Dashboard
          </Link>
        </div>
        <ChatWindow />
      </div>
    </div>
  );
}
