"use client";
import { useEffect, useState } from "react";
import { Swords, Loader2 } from "lucide-react";

export function CompetitorTracker({ dealId, refreshKey }: { dealId: string; refreshKey?: number }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setData(null);
    fetch(`/api/deals/${dealId}/competitors`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ competitors: [] }));
  }, [dealId, refreshKey]);

  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-dm-amber" />
          <h3 className="text-sm font-semibold text-dm-text">Competitor Intelligence</h3>
        </div>
        <span className="text-[10px] font-mono text-dm-amber bg-dm-amber/10 border border-dm-amber/20 px-2 py-0.5 rounded-full font-bold">
          Auto-Extracted
        </span>
      </div>

      {!data ? (
        <div className="flex items-center gap-2 py-3">
          <Loader2 className="w-4 h-4 text-dm-muted animate-spin" />
          <span className="text-xs text-dm-muted">Analyzing deal memory…</span>
        </div>
      ) : data.degraded ? (
        <p className="text-xs text-dm-muted py-2">Memory offline — competitor data unavailable.</p>
      ) : data.competitors?.length === 0 ? (
        <p className="text-xs text-dm-muted py-2">No competitors mentioned yet in this deal.</p>
      ) : (
        <div className="space-y-3">
          {data.competitors.map((c: any, i: number) => (
            <div key={i} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-dm-text">{c.name}</span>
                <span className="text-[10px] font-mono text-dm-muted bg-white/[0.04] px-2 py-0.5 rounded">
                  {c.firstMentioned}
                </span>
              </div>
              <p className="text-xs text-dm-muted leading-relaxed">{c.context}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
