"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { StageBadge } from "@/components/stage-badge";
import { InteractionTimeline } from "@/components/interaction-timeline";
import { InteractionForm } from "@/components/interaction-form";
import { PrecallBrief } from "@/components/precall-brief";
import { DealUnderstanding } from "@/components/deal-understanding";
import { ContactProfile } from "@/components/contact-profile";
import { DealSignals } from "@/components/deal-signals";
import { AskDealBook } from "@/components/ask-dealbook";
import { EmailDraft } from "@/components/email-draft";
import { Building2, User, MessageCircle } from "lucide-react";

interface Deal {
  id: string;
  companyName: string;
  contactName: string;
  stage: string;
  createdAt: string;
  interactions: Array<{
    id: string;
    content: string;
    summary: string | null;
    createdAt: string;
  }>;
}

export default function DealWorkspacePage() {
  const params = useParams();
  const dealId = params.id as string;
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"log" | "timeline" | "brief" | "signals" | "profile" | "ask" | "email">("log");

  const fetchDeal = useCallback(async () => {
    try {
      const res = await fetch(`/api/deals/${dealId}`);
      if (res.ok) {
        setDeal(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch deal:", e);
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    fetchDeal();
  }, [fetchDeal]);

  function handleInteractionSuccess() {
    fetchDeal();
    setRefreshKey((k) => k + 1);
  }

  if (loading) {
    return (
      <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <div className="space-y-4 animate-pulse">
          <div className="h-16 bg-white/[0.04] rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
            <div className="lg:col-span-7 h-[600px] bg-white/[0.04] rounded-2xl" />
            <div className="lg:col-span-5 h-[600px] bg-white/[0.04] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-24 text-center">
        <div className="glass-card max-w-md mx-auto p-8">
          <h1 className="text-xl font-bold text-white">Deal not found</h1>
          <p className="text-sm text-dm-muted mt-2">
            This deal may have been deleted or moved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-dm-muted mb-4">
        <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
          <span>Dashboard</span>
        </Link>
        <span>/</span>
        <span className="text-dm-text">{deal.companyName}</span>
      </div>

      {/* Deal Header Banner */}
      <div className="glass-card p-6 mb-6 glow-indigo">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{deal.companyName}</h1>
              <StageBadge stage={deal.stage} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-dm-muted">
              <span className="flex items-center gap-1.5 font-semibold text-white bg-dm-indigo/10 border border-dm-indigo/20 px-2.5 py-1 rounded-lg">
                <User className="w-3.5 h-3.5 text-dm-indigo" />
                Key Contact: {deal.contactName}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-dm-indigo" />
                {deal.interactions.length} interactions logged
              </span>
              <span className="font-mono text-xs text-dm-muted/70">
                Created{" "}
                {new Date(deal.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Top Quick Memory Snapshot */}
            {deal.interactions.length > 0 && (
              <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 text-xs text-dm-text">
                <span className="font-bold text-dm-indigo shrink-0">⚡ Latest Snapshot:</span>
                <span className="truncate text-dm-muted font-medium">
                  "{deal.interactions[0]?.summary || deal.interactions[0]?.content}"
                </span>
              </div>
            )}
          </div>

          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-dm-muted hover:text-white border border-white/[0.08] transition-all shrink-0"
          >
            ← Back to Deals
          </Link>
        </div>
      </div>

      {/* 2-Column Split Workspace with Complete Top Tab Switcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Complete Tabbed Intelligence & Actions Hub (60% Width) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Top Tab Switcher Bar: Perfectly aligned equal-width tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1 p-1.5 glass-card rounded-2xl w-full">
            <button
              onClick={() => setActiveTab("log")}
              className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center ${
                activeTab === "log"
                  ? "bg-dm-indigo text-white shadow-md shadow-dm-indigo/30 font-bold"
                  : "text-dm-muted hover:text-white hover:bg-white/5"
              }`}
            >
              Log Call
            </button>

            <button
              onClick={() => setActiveTab("timeline")}
              className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center ${
                activeTab === "timeline"
                  ? "bg-dm-indigo text-white shadow-md shadow-dm-indigo/30 font-bold"
                  : "text-dm-muted hover:text-white hover:bg-white/5"
              }`}
            >
              Timeline ({deal.interactions.length})
            </button>

            <button
              onClick={() => setActiveTab("brief")}
              className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center ${
                activeTab === "brief"
                  ? "bg-dm-indigo text-white shadow-md shadow-dm-indigo/30 font-bold"
                  : "text-dm-muted hover:text-white hover:bg-white/5"
              }`}
            >
              10-Sec Brief
            </button>

            <button
              onClick={() => setActiveTab("signals")}
              className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center ${
                activeTab === "signals"
                  ? "bg-dm-indigo text-white shadow-md shadow-dm-indigo/30 font-bold"
                  : "text-dm-muted hover:text-white hover:bg-white/5"
              }`}
            >
              Signals & Risks
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center ${
                activeTab === "profile"
                  ? "bg-dm-indigo text-white shadow-md shadow-dm-indigo/30 font-bold"
                  : "text-dm-muted hover:text-white hover:bg-white/5"
              }`}
            >
              Prospect Profile
            </button>

            <button
              onClick={() => setActiveTab("email")}
              className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center ${
                activeTab === "email"
                  ? "bg-dm-indigo text-white shadow-md shadow-dm-indigo/30 font-bold"
                  : "text-dm-muted hover:text-white hover:bg-white/5"
              }`}
            >
              Email Draft
            </button>

            <button
              onClick={() => setActiveTab("ask")}
              className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "ask"
                  ? "bg-dm-indigo text-white shadow-md shadow-dm-indigo/30 font-bold"
                  : "text-dm-muted hover:text-white hover:bg-white/5"
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          </div>

          {/* Selected Intelligence & Action Tab View */}
          <div className="min-h-[480px]">
            {activeTab === "brief" && (
              <PrecallBrief dealId={dealId} key={`brief-${refreshKey}`} />
            )}

            {activeTab === "signals" && (
              <DealSignals dealId={dealId} key={`signals-${refreshKey}`} />
            )}

            {activeTab === "profile" && (
              <DealUnderstanding
                dealId={dealId}
                interactionCount={deal.interactions.length}
                key={`understanding-${refreshKey}`}
              />
            )}

            {activeTab === "ask" && (
              <AskDealBook dealId={dealId} />
            )}

            {activeTab === "log" && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-dm-muted uppercase tracking-wider px-1">
                  Log Call Interaction
                </h2>
                <InteractionForm
                  dealId={dealId}
                  onSuccess={handleInteractionSuccess}
                />
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-dm-muted uppercase tracking-wider px-1">
                  Call History Timeline ({deal.interactions.length})
                </h2>
                <InteractionTimeline interactions={deal.interactions} />
              </div>
            )}

            {activeTab === "email" && (
              <EmailDraft dealId={dealId} key={`email-${refreshKey}`} />
            )}
          </div>
        </div>

        {/* Right Column: Key Contact Profile Sidebar (40% Width) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Contact Profile Fact Sheet */}
          <ContactProfile dealId={dealId} key={`contact-${refreshKey}`} />

        </div>

      </div>
    </div>
  );
}
