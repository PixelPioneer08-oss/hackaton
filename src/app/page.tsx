"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DealCard } from "@/components/deal-card";
import { Brain, Plus, Sparkles, Briefcase, Trophy, Zap } from "lucide-react";

interface Deal {
  id: string;
  companyName: string;
  contactName: string;
  stage: string;
  createdAt: string;
  lastInteractionAt: string | null;
  interactionCount: number;
}

export default function Dashboard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/deals")
      .then((r) => r.json())
      .then(setDeals)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-[1550px] w-full mx-auto px-6 sm:px-8 pt-6 pb-16 relative">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-gradient-to-b from-dm-indigo/15 via-purple-500/5 to-transparent blur-[120px] pointer-events-none rounded-full" />

      {/* Hero Section */}
      <div className="mb-12 text-center relative z-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dm-indigo/15 border border-dm-indigo/30 text-dm-indigo text-xs sm:text-sm font-semibold shadow-sm backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-dm-indigo animate-pulse" />
          <Brain className="w-4 h-4 text-dm-indigo" />
          <span>Hindsight AI Sales Memory Engine</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Brief yourself in{" "}
          <span className="bg-gradient-to-r from-dm-indigo via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            10 seconds
          </span>{" "}
          before every call
        </h1>

        <p className="text-dm-muted text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          DealBook remembers every interaction, objection, and competitor mention across your enterprise deals — briefing reps before their next conversation.
        </p>
      </div>

      {/* Upper Stats Row (Compact & Premium) */}
      <div className="max-w-4xl mx-auto mb-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-4 flex items-center justify-between border border-white/[0.08] hover:border-dm-indigo/40 transition-all duration-200">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-dm-indigo/15 border border-dm-indigo/30 text-dm-indigo shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white leading-none font-mono">{deals.length}</p>
                <p className="text-xs font-semibold text-dm-muted mt-1">Active Deals</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-dm-indigo bg-dm-indigo/10 border border-dm-indigo/20 px-2 py-0.5 rounded-md font-bold">
              Live Pipeline
            </span>
          </div>

          <div className="glass-card p-4 flex items-center justify-between border border-white/[0.08] hover:border-emerald-500/40 transition-all duration-200">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white leading-none font-mono">
                  {deals.reduce((sum, d) => sum + d.interactionCount, 0)}
                </p>
                <p className="text-xs font-semibold text-dm-muted mt-1">Memories Stored</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold">
              Vector Memory
            </span>
          </div>

          <div className="glass-card p-4 flex items-center justify-between border border-white/[0.08] hover:border-amber-500/40 transition-all duration-200">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white leading-none font-mono">
                  {deals.filter((d) => d.stage === "Closed-Won").length}
                </p>
                <p className="text-xs font-semibold text-dm-muted mt-1">Deals Won</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md font-bold">
              Closed
            </span>
          </div>
        </div>
      </div>

      {/* Deals Header Section */}
      <div className="flex items-center justify-between mb-8 pb-3 border-b border-white/[0.06] relative z-10">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Your Pipeline Deals</h2>
          <span className="text-xs font-mono font-bold text-dm-muted bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
            {deals.length} active
          </span>
        </div>
        <Link
          href="/deals/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-dm-indigo hover:bg-dm-indigo-hover text-white transition-all duration-200 shadow-lg shadow-dm-indigo/25 hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Deal</span>
        </Link>
      </div>

      {/* Deal Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-6 space-y-4 animate-pulse">
              <div className="flex justify-between">
                <div className="h-5 w-32 bg-dm-card-hover rounded" />
                <div className="h-5 w-20 bg-dm-card-hover rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-24 bg-dm-card-hover rounded" />
                <div className="h-3 w-20 bg-dm-card-hover rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="glass-card p-12 text-center relative z-10 max-w-md mx-auto">
          <Brain className="w-12 h-12 mx-auto mb-4 text-dm-muted opacity-50" />
          <h3 className="text-lg font-bold text-white mb-2">No deals yet</h3>
          <p className="text-sm text-dm-muted mb-6">
            Create your first deal to start building AI-powered memory.
          </p>
          <Link
            href="/deals/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-dm-indigo hover:bg-dm-indigo-hover text-white transition-all shadow-lg shadow-dm-indigo/25"
          >
            <Plus className="w-4 h-4" />
            Create First Deal
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {deals.map((deal) => (
            <DealCard key={deal.id} {...deal} />
          ))}
        </div>
      )}
    </div>
  );
}

