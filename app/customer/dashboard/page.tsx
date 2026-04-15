import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { MarketingOptInBanner } from "@/components/customer/MarketingOptInBanner";

export default async function CustomerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { marketingOptIn: true },
  });
  const showOptInBanner = !dbUser?.marketingOptIn;

  return (
    <div className="min-h-screen bg-[#F0F4FB]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-0 h-14 flex items-center">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-navy flex items-center justify-center text-white font-bold text-xs tracking-tight">
              SM
            </div>
            <span className="font-semibold text-slate-900 text-sm tracking-tight">Smith Motors</span>
          </div>
          <Link
            href="/customer/settings"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors group"
            title="Account settings"
          >
            <span className="hidden sm:inline text-xs">{session.user.name || session.user.email}</span>
            <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-slate-200 border border-slate-200 flex items-center justify-center transition-colors">
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.12em] mb-1">Dashboard</p>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Welcome back, {firstName}</h1>
        </div>

        {showOptInBanner && <MarketingOptInBanner />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          {/* Chat with AI */}
          <Link href="/customer/chat">
            <div className="bg-white border border-slate-200 border-l-4 border-l-navy p-5 hover:border-slate-400 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-navy flex items-center justify-center group-hover:bg-navy-hover transition-colors">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-[0.1em]">AI Assistant</span>
              </div>
              <h2 className="font-semibold text-slate-900 text-base mb-1 tracking-tight">Chat with Alex</h2>
              <p className="text-slate-500 text-sm leading-relaxed">Ask questions, get recommendations, and book appointments with our AI assistant.</p>
            </div>
          </Link>

          {/* Browse Inventory */}
          <Link href="/customer/inventory">
            <div className="bg-white border border-slate-200 border-l-4 border-l-navy p-5 hover:border-slate-400 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-navy flex items-center justify-center group-hover:bg-navy-hover transition-colors">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-[0.1em]">Inventory</span>
              </div>
              <h2 className="font-semibold text-slate-900 text-base mb-1 tracking-tight">Browse Inventory</h2>
              <p className="text-slate-500 text-sm leading-relaxed">Explore our available vehicles, filter by make, model, and price.</p>
            </div>
          </Link>

          {/* Financing */}
          <Link href="/customer/financing">
            <div className="bg-white border border-slate-200 border-l-4 border-l-navy p-5 hover:border-slate-400 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-navy flex items-center justify-center group-hover:bg-navy-hover transition-colors">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-[0.1em]">Finance</span>
              </div>
              <h2 className="font-semibold text-slate-900 text-base mb-1 tracking-tight">Financing</h2>
              <p className="text-slate-500 text-sm leading-relaxed">Calculate payments and manage your financing application and documents.</p>
            </div>
          </Link>

          {/* Car Match Quiz */}
          <Link href="/customer/quiz">
            <div className="bg-white border border-slate-200 border-l-4 border-l-navy p-5 hover:border-slate-400 hover:shadow-sm transition-all cursor-pointer group relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 uppercase tracking-[0.08em]">2 min</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-navy flex items-center justify-center group-hover:bg-navy-hover transition-colors">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-[0.1em]">Match Quiz</span>
              </div>
              <h2 className="font-semibold text-slate-900 text-base mb-1 tracking-tight">Find My Perfect Car</h2>
              <p className="text-slate-500 text-sm leading-relaxed">Answer 8 quick questions and we&apos;ll match you with cars from our real inventory.</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
