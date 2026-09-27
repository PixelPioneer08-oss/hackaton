"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { StageBadge } from "@/components/stage-badge";
import { InteractionTimeline } from "@/components/interaction-timeline";
import { InteractionForm } from "@/components/interaction-form";
import { PrecallBrief } from "@/components/precall-brief";
import { DealUnderstanding } from "@/components/deal-understanding";
import { ContactProfile } from "@/components/contact-profile";
import { DealSignals } from "@/components/deal-signals";
import { AskDealMind } from "@/components/ask-dealmind";
import { Building2, User } from "lucide-react";

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
    // Refresh deal data and all panels
    fetchDeal();
    setRefreshKey((k) => k + 1);
  }

  if (loading) {
    return (
      <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4 animate-pulse">
          <div className="h-10 w-64 bg-dm-card-hover rounded-xl" />
          <div className="h-4 w-40 bg-dm-card-hover rounded-md" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="h-[500px] bg-dm-card-hover rounded-2xl" />
            <div className="h-[500px] bg-dm-card-hover rounded-2xl" />
            <div className="h-[500px] bg-dm-card-hover rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="glass-card max-w-md mx-auto p-8">
          <h1 className="text-xl font-semibold text-dm-text">Deal not found</h1>
          <p className="text-sm text-dm-muted mt-2">
            This deal may have been deleted or moved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Deal Header Banner */}
      <div className="glass-card p-5 mb-6 glow-indigo">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{deal.companyName}</h1>
              <StageBadge stage={deal.stage} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-dm-muted">
              <span className="flex items-center gap-1.5 font-medium text-dm-text/90">
                <User className="w-4 h-4 text-dm-indigo" />
                {deal.contactName}
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
          </div>
        </div>
      </div>

      {/* Three-panel responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        {/* Left Panel: Timeline */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-dm-muted uppercase tracking-wider">
              Timeline ({deal.interactions.length})
            </h2>
          </div>
          <div className="max-h-[500px] lg:max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar pr-1.5">
            <InteractionTimeline interactions={deal.interactions} />
          </div>
        </div>

        {/* Center Panel: Log Interaction */}
        <div className="lg:col-span-4 space-y-3">
          <div className="px-1">
            <h2 className="text-xs font-bold text-dm-muted uppercase tracking-wider">
              Log Interaction
            </h2>
          </div>
          <InteractionForm
            dealId={dealId}
            onSuccess={handleInteractionSuccess}
          />
        </div>

        {/* Right Panel: Intelligence Stream */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-dm-muted uppercase tracking-wider">
              Hindsight Intelligence Stream
            </h2>
          </div>
          <div className="space-y-4 max-h-[550px] lg:max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar pr-1.5">
            <ContactProfile dealId={dealId} key={`contact-${refreshKey}`} />
            <DealUnderstanding
              dealId={dealId}
              interactionCount={deal.interactions.length}
              key={`understanding-${refreshKey}`}
            />
            <DealSignals dealId={dealId} key={`signals-${refreshKey}`} />
            <PrecallBrief dealId={dealId} key={`brief-${refreshKey}`} />
          </div>
        </div>
      </div>

      {/* Bottom Section: Ask DealMind Q&A */}
      <div className="mt-8">
        <AskDealMind dealId={dealId} />
      </div>
    </div>
  );
}
