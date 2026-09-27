"use client";

import { useState, useEffect } from "react";
import { RefreshCw, MapPin, AlertTriangle, Users, Lightbulb } from "lucide-react";

interface Brief {
  whereLeft: string;
  openObjections: string[];
  stakeholders: Array<{ name: string; role: string }>;
  suggestedTalkingPoints: string[];
}

export function PrecallBrief({ dealId }: { dealId: string }) {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchBrief() {
    setLoading(true);
    try {
      const res = await fetch(`/api/deals/${dealId}/brief`);
      if (res.ok) setBrief(await res.json());
    } catch (e) {
      console.error("Failed to fetch brief:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBrief(); }, [dealId]);

  if (loading) {
    return (
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-dm-text">Pre-Call Brief</h3>
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-24 bg-dm-card-hover rounded animate-pulse" />
            <div className="h-3 w-full bg-dm-card-hover rounded animate-pulse" />
            <div className="h-3 w-3/4 bg-dm-card-hover rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (!brief) return null;

  const openObjections = Array.isArray(brief.openObjections) ? brief.openObjections : [];
  const stakeholders = Array.isArray(brief.stakeholders) ? brief.stakeholders : [];
  const suggestedTalkingPoints = Array.isArray(brief.suggestedTalkingPoints) ? brief.suggestedTalkingPoints : [];

  return (
    <div className="glass-card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-dm-text">Pre-Call Brief</h3>
        <button
          onClick={fetchBrief}
          className="p-1.5 rounded-lg hover:bg-white/5 text-dm-muted hover:text-dm-text transition-colors"
          title="Refresh brief"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-medium text-dm-indigo">
          <MapPin className="w-3 h-3" />
          Where Things Left Off
        </div>
        <p className="text-sm text-dm-muted leading-relaxed">{brief.whereLeft || "No notes yet."}</p>
      </div>

      {openObjections.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-dm-amber">
            <AlertTriangle className="w-3 h-3" />
            Open Objections
          </div>
          <ul className="space-y-1">
            {openObjections.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-dm-muted">
                <span className="text-dm-amber mt-1">•</span>
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}

      {stakeholders.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-dm-green">
            <Users className="w-3 h-3" />
            Stakeholders
          </div>
          <div className="space-y-1">
            {stakeholders.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-dm-text">{s.name}</span>
                <span className="text-dm-muted text-xs">— {s.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestedTalkingPoints.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
            <Lightbulb className="w-3 h-3" />
            Suggested Talking Points
          </div>
          <ol className="space-y-1">
            {suggestedTalkingPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-dm-muted">
                <span className="text-blue-400 font-mono text-xs mt-0.5">{i + 1}.</span>
                {point}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
