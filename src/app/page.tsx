"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DealCard } from "@/components/deal-card";
import { Brain, Plus, Sparkles, TrendingUp, Shield } from "lucide-react";

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
    <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Hero Section */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dm-indigo/10 border border-dm-indigo/20 text-dm-indigo text-xs sm:text-sm font-medium mb-4">
          <Brain className="w-4 h-4" />
          AI-Powered Sales Memory
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
          Brief yourself in{" "}
          <span className="bg-gradient-to-r from-dm-indigo via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            10 seconds
          </span>{" "}
          before every call
        </h1>
        <p className="text-dm-muted text-base sm:text-lg max-w-2xl mx-auto">
          DealMind remembers every interaction, objection, and competitor mention across your deals.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-10">
        <div className="glass-card p-5 flex items-center gap-4 glow-indigo-hover">
          <div className="p-3 rounded-xl bg-dm-indigo/10 border border-dm-indigo/20">
            <TrendingUp className="w-6 h-6 text-dm-indigo" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-dm-text">{deals.length}</p>
            <p className="text-xs sm:text-sm text-dm-muted">Active Deals</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4 glow-indigo-hover">
          <div className="p-3 rounded-xl bg-dm-green/10 border border-dm-green/20">
            <Sparkles className="w-6 h-6 text-dm-green" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-dm-text">
              {deals.reduce((sum, d) => sum + d.interactionCount, 0)}
            </p>
            <p className="text-xs sm:text-sm text-dm-muted">Memories Stored</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4 glow-indigo-hover">
          <div className="p-3 rounded-xl bg-dm-amber/10 border border-dm-amber/20">
            <Shield className="w-6 h-6 text-dm-amber" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-dm-text">
              {deals.filter((d) => d.stage === "Closed-Won").length}
            </p>
            <p className="text-xs sm:text-sm text-dm-muted">Deals Won</p>
          </div>
        </div>
      </div>

      {/* Deals Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-dm-text tracking-tight">Your Deals</h2>
        <Link
          href="/deals/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-dm-indigo hover:bg-dm-indigo-hover text-white transition-all duration-200 shadow-lg shadow-dm-indigo/25"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {deals.map((deal) => (
            <DealCard key={deal.id} {...deal} />
          ))}
        </div>
      )}
    </div>
  );
}
