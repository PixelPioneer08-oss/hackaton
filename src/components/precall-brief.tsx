"use client";

import { useState, useEffect } from "react";
import { RefreshCw, MapPin, AlertTriangle, Users, Lightbulb, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface Brief {
  whereLeft: string;
  openObjections: string[];
  stakeholders: Array<{ name: string; role: string }>;
  suggestedTalkingPoints: string[];
}

export function PrecallBrief({ dealId }: { dealId: string }) {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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

  function handleCopy() {
    if (!brief) return;
    const text = `⚡ 10-SEC PRE-CALL BRIEF\n\n📌 WHERE THINGS LEFT OFF:\n${brief.whereLeft || "N/A"}\n\n🚨 OPEN OBJECTIONS:\n${(brief.openObjections || []).map(o => `• ${o}`).join("\n") || "None"}\n\n👥 STAKEHOLDERS:\n${(brief.stakeholders || []).map(s => `• ${s.name} (${s.role})`).join("\n") || "None"}\n\n💡 TALKING POINTS:\n${(brief.suggestedTalkingPoints || []).map((t, i) => `${i + 1}. ${t}`).join("\n") || "None"}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Pre-call brief copied to clipboard!", { duration: 3000 });
    setTimeout(() => setCopied(false), 2500);
  }

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
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-dm-text">Pre-Call Brief</h3>
          <span className="text-[10px] font-mono text-dm-indigo bg-dm-indigo/10 border border-dm-indigo/20 px-2 py-0.5 rounded-full font-bold">
            10-Sec AI Summary
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-dm-muted hover:text-white transition-all cursor-pointer"
            title="Copy brief to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-dm-green" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Brief"}</span>
          </button>
          <button
            onClick={fetchBrief}
            className="p-1.5 rounded-lg hover:bg-white/5 text-dm-muted hover:text-dm-text transition-colors cursor-pointer"
            title="Refresh brief"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Internal Scroller Box */}
      <div className="max-h-[440px] overflow-y-auto custom-scrollbar pr-1.5 space-y-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-dm-indigo">
            <MapPin className="w-3.5 h-3.5" />
            Where Things Left Off
          </div>
          <p className="text-sm text-dm-muted leading-relaxed">{brief.whereLeft || "No notes yet."}</p>
        </div>

        {openObjections.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-dm-amber">
              <AlertTriangle className="w-3.5 h-3.5" />
              Open Objections ({openObjections.length})
            </div>
            <ul className="space-y-1">
              {openObjections.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-dm-muted leading-relaxed">
                  <span className="text-dm-amber shrink-0 mt-1">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {stakeholders.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-dm-green">
              <Users className="w-3.5 h-3.5" />
              Key Stakeholders ({stakeholders.length})
            </div>
            <div className="space-y-1">
              {stakeholders.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-dm-text font-medium">{s.name}</span>
                  <span className="text-dm-muted text-xs">— {s.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {suggestedTalkingPoints.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
              <Lightbulb className="w-3.5 h-3.5" />
              Suggested Talking Points ({suggestedTalkingPoints.length})
            </div>
            <ol className="space-y-1.5">
              {suggestedTalkingPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-dm-muted leading-relaxed">
                  <span className="text-blue-400 font-mono text-xs mt-0.5 font-bold shrink-0">{i + 1}.</span>
                  <span>{point}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

