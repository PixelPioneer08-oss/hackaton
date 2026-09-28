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
import { AskCompare } from "@/components/ask-compare";
import { EmailDraft } from "@/components/email-draft";
import { DealHealth, CompactDealHealth } from "@/components/deal-health";
import { CompetitorTracker } from "@/components/competitor-tracker";
import {
  Building2,
  User,
  Phone,
  Clock,
  Zap,
  AlertTriangle,
  UserCircle,
  Mail,
  MessageCircle,
} from "lucide-react";

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

type TabKey = "log" | "timeline" | "brief" | "signals" | "profile" | "ask" | "email";

const TABS: { key: TabKey; label: string; icon: typeof Phone }[] = [
  { key: "log", label: "Log Call", icon: Phone },
  { key: "timeline", label: "Timeline", icon: Clock },
  { key: "brief", label: "10-Sec Brief", icon: Zap },
  { key: "signals", label: "Signals & Risks", icon: AlertTriangle },
  { key: "profile", label: "Prospect Profile", icon: UserCircle },
  { key: "email", label: "Email Draft", icon: Mail },
  { key: "ask", label: "Ask AI", icon: MessageCircle },
];

export default function DealWorkspacePage() {
  const params = useParams();
  const dealId = params.id as string;
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>("log");

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

  // Item 6: Auto-jump to Signals after logging a new interaction
  async function handleInteractionLogged() {
    fetchDeal();
    // Wait for Hindsight to process the retained content before refetching
    await new Promise((r) => setTimeout(r, 4000));
    setRefreshKey((k) => k + 1);
    setActiveTab("signals"); // Auto-navigate to show drift detection
  }

  // Legacy handler for plain refresh (no auto-jump)
  function handleInteractionSuccess() {
    fetchDeal();
    setRefreshKey((k) => k + 1);
  }

  if (loading) {
    return (
      <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 pt-4">
        <div className="space-y-4 animate-pulse">
          <div className="h-16 bg-white/[0.04] rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
            <div className="lg:col-span-7 h-[600px] bg-white/[0.04] rounded-2xl" />
            <div className="lg:col-span-5 h-[600px] bg-white/[0.04] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
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
    <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-dm-muted mb-3">
        <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
          <span>Dashboard</span>
        </Link>
        <span>/</span>
        <span className="text-dm-text">{deal.companyName}</span>
      </div>

      {/* Deal Header Banner */}
      <div className="glass-card p-4 sm:p-5 mb-4 glow-indigo">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{deal.companyName}</h1>
              <StageBadge stage={deal.stage} />
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white bg-dm-indigo/15 border border-dm-indigo/30 px-2.5 py-1 rounded-xl shadow-sm shrink-0">
                <User className="w-3.5 h-3.5 text-dm-indigo" />
                Key Contact: <span className="font-bold text-white">{deal.contactName}</span>
              </span>
              <CompactDealHealth dealId={dealId} refreshKey={refreshKey} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-dm-muted">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-dm-indigo" />
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
                  &quot;{deal.interactions[0]?.summary || deal.interactions[0]?.content}&quot;
                </span>
              </div>
            )}
          </div>

          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-dm-muted hover:text-white border border-white/[0.08] transition-all shrink-0 self-start sm:self-center"
          >
            ← Back to Deals
          </Link>
        </div>
      </div>

      {/* 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Tabbed Intelligence & Actions Hub (60%) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Tab Switcher Bar with Icons */}
          <div className="flex items-center gap-1 p-1.5 glass-card rounded-2xl w-full overflow-x-auto no-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`h-9 px-2.5 sm:px-3 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 shrink-0 flex-1 ${
                    isActive
                      ? "bg-dm-indigo text-white shadow-md shadow-dm-indigo/30 font-bold border border-dm-indigo/50"
                      : "text-dm-muted hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${isActive ? "text-white" : "text-dm-muted"}`} />
                  <span className="whitespace-nowrap">
                    {tab.key === "timeline"
                      ? `Timeline (${deal.interactions.length})`
                      : tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Tab View */}
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
              <AskCompare dealId={dealId} />
            )}

            {activeTab === "log" && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-dm-muted uppercase tracking-wider px-1">
                  Log Call Interaction
                </h2>
                <InteractionForm
                  dealId={dealId}
                  onSuccess={handleInteractionLogged}
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

        {/* Right Column: Health Score & Competitors (40%) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Deal Health Score */}
          <DealHealth dealId={dealId} refreshKey={refreshKey} />

          {/* Competitor Intelligence */}
          <CompetitorTracker dealId={dealId} refreshKey={refreshKey} />

        </div>

      </div>
    </div>
  );
}
