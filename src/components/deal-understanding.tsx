"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export function DealUnderstanding({ dealId, interactionCount }: { dealId: string; interactionCount: number }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_data() {
      try {
        const res = await fetch(`/api/deals/${dealId}/understanding`);
        if (res.ok) setData(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetch_data();
  }, [dealId]);

  // Distinguish two empty states
  if (loading) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-dm-indigo" />
          <h3 className="text-sm font-semibold text-dm-text">Deal Understanding</h3>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-dm-card-hover rounded animate-pulse" />
          <div className="h-3 w-5/6 bg-dm-card-hover rounded animate-pulse" />
          <div className="h-3 w-3/4 bg-dm-card-hover rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // State 1: No interactions logged yet
  if (data?.status === "no-interactions" || interactionCount === 0) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-dm-muted" />
          <h3 className="text-sm font-semibold text-dm-text">Deal Understanding</h3>
        </div>
        <p className="text-sm text-dm-muted">
          Log your first interaction to start building DealBook&apos;s understanding of this deal.
        </p>
      </div>
    );
  }

  // State 2: Interactions exist but mental model is still computing
  if (data?.status === "building" || !data?.content) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Loader2 className="w-4 h-4 text-dm-indigo animate-spin" />
          <h3 className="text-sm font-semibold text-dm-text">Deal Understanding</h3>
        </div>
        <p className="text-sm text-dm-muted">
          Building understanding from {interactionCount} interactions…
        </p>
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full bg-dm-card-hover rounded animate-pulse" />
          <div className="h-3 w-4/5 bg-dm-card-hover rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // State 3: Ready
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-dm-indigo" />
          <h3 className="text-sm font-semibold text-dm-text">Prospect Profile & Mental Model</h3>
        </div>
        {data?.isStale && (
          <span className="text-xs text-dm-amber">Refreshing…</span>
        )}
      </div>

      {/* Internal Scroller Box */}
      <div className="max-h-[440px] overflow-y-auto custom-scrollbar pr-1.5 space-y-3">
        <p className="text-xs sm:text-sm text-dm-muted leading-relaxed whitespace-pre-line">
          {data.content}
        </p>
        {data.lastUpdated && (
          <p className="text-[11px] text-dm-muted/50 font-mono">
            Updated {new Date(data.lastUpdated).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
