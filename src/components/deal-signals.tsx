"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, ShieldAlert, TrendingDown, Loader2 } from "lucide-react";

const RISK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  medium: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  low: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
};

export function DealSignals({ dealId }: { dealId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/deals/${dealId}/signals`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dealId]);

  if (loading) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Loader2 className="w-4 h-4 text-dm-amber animate-spin" />
          <h3 className="text-sm font-semibold text-dm-text">Drift Signals</h3>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-dm-card-hover rounded animate-pulse" />
          <div className="h-3 w-4/5 bg-dm-card-hover rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data || data.error || data.status === "insufficient-data") {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="w-4 h-4 text-dm-muted" />
          <h3 className="text-sm font-semibold text-dm-text">Drift Signals</h3>
        </div>
        <p className="text-sm text-dm-muted">
          {data?.error || "Need at least 2 interactions to detect drift."}
        </p>
      </div>
    );
  }

  const signals = Array.isArray(data.signals) ? data.signals : [];

  if (signals.length === 0) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="w-4 h-4 text-dm-green" />
          <h3 className="text-sm font-semibold text-dm-text">Drift Signals</h3>
        </div>
        <p className="text-sm text-dm-green">No contradictions detected ✓</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-dm-amber" />
          <h3 className="text-sm font-semibold text-dm-text">Drift Signals</h3>
        </div>
        <span className="text-xs text-dm-muted">{data.summary}</span>
      </div>
      <div className="space-y-2">
        {signals.map((signal: any, i: number) => {
          const colors = RISK_COLORS[signal.risk] || RISK_COLORS.low;
          return (
            <div key={i} className={`p-3 rounded-xl border ${colors.border} ${colors.bg}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${colors.text} uppercase tracking-wider`}>
                  {signal.type?.replace(/_/g, " ") || "DRIFT"}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                  {signal.risk || "low"}
                </span>
              </div>
              <p className="text-sm text-dm-text">{signal.description}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-dm-muted font-mono">
                <span>Then: {signal.firstMention}</span>
                <TrendingDown className="w-3 h-3" />
                <span>Now: {signal.currentState}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
