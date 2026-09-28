"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DealCard } from "@/components/deal-card";
import { Brain, Plus, Sparkles, Briefcase, Trophy } from "lucide-react";

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
    <div className="max-w-[1550px] w-full mx-auto px-6 sm:px-8 pt-4 pb-12">
      {/* Hero Section */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dm-indigo/10 border border-dm-indigo/20 text-dm-indigo text-xs sm:text-sm font-medium mb-4">
          <Brain className="w-4 h-4" />
          AI-Powered Sales Memory
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
          Brief yourself in{" "}
          <span className="bg-gradient-to-r from-dm-indigo via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            10 seconds
          </span>{" "}
          before every call
        </h1>
        <p className="text-dm-muted text-sm sm:text-base max-w-xl mx-auto">
          DealBook remembers every interaction, objection, and competitor mention across your deals.
        </p>
      </div>

      {/* Upper Stats Row (Compact Size) */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-dm-indigo/10 border border-dm-indigo/20 shrink-0">
              <Briefcase className="w-4 h-4 text-dm-indigo" />
            </div>
            <div>
              <p className="text-xl font-bold text-dm-text leading-none">{deals.length}</p>
              <p className="text-xs text-dm-muted mt-1">Active Deals</p>
            </div>
          </div>
          <div className="glass-card p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-dm-green/10 border border-dm-green/20 shrink-0">
              <Brain className="w-4 h-4 text-dm-green" />
            </div>
            <div>
              <p className="text-xl font-bold text-dm-text leading-none">
                {deals.reduce((sum, d) => sum + d.interactionCount, 0)}
              </p>
              <p className="text-xs text-dm-muted mt-1">Memories Stored</p>
            </div>
          </div>
          <div className="glass-card p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-dm-amber/10 border border-dm-amber/20 shrink-0">
              <Trophy className="w-4 h-4 text-dm-amber" />
            </div>
            <div>
              <p className="text-xl font-bold text-dm-text leading-none">
                {deals.filter((d) => d.stage === "Closed-Won").length}
              </p>
              <p className="text-xs text-dm-muted mt-1">Deals Won</p>
            </div>
          </div>
        </div>
      </div>

      {/* Deals Header */}
      <div className="relative flex items-center justify-center mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight text-center">Your Deals</h2>
        <Link
          href="/deals/new"
          className="absolute right-0 hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-dm-indigo hover:bg-dm-indigo-hover text-white transition-all duration-200 shadow-lg shadow-dm-indigo/25"
        >
          <Plus className="w-4 h-4" />
          New Deal
        </Link>
      </div>

      {/* Deal Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
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
        <div className="glass-card p-12 text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-dm-muted opacity-50" />
          <h3 className="text-lg font-semibold text-dm-text mb-2">No deals yet</h3>
          <p className="text-sm text-dm-muted mb-6">
            Create your first deal to start building AI-powered memory.
          </p>
          <Link
            href="/deals/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-dm-indigo hover:bg-dm-indigo-hover text-white transition-all"
          >
            <Plus className="w-4 h-4" />
            Create First Deal
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <DealCard key={deal.id} {...deal} />
          ))}
        </div>
      )}
    </div>
  );
}
