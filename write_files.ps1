$content1 = @'
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, User, FileText, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const STAGES = [
  "Prospecting",
  "Discovery",
  "Proposal",
  "Negotiation",
  "Closed-Won",
  "Closed-Lost",
];

export default function NewDealPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [stage, setStage] = useState("Discovery");
  const [firstNote, setFirstNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim() || !contactName.trim()) {
      setError("Company name and contact name are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          contactName: contactName.trim(),
          stage,
          firstNote: firstNote.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to create deal");

      const deal = await res.json();
      router.push(`/deals/${deal.id}`);
    } catch (e) {
      setError("Failed to create deal. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-10">
      <Link href="/" className="btn-ghost inline-flex items-center gap-1.5 mb-6 text-xs">
        <ArrowLeft className="w-3 h-3" />
        Back to deals
      </Link>

      <h1 className="text-xl font-bold text-white mb-1">Create New Deal</h1>
      <p className="text-sm text-gray-500 mb-8">
        Set up a new deal and start building AI-powered memory.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
            <Building2 className="w-3 h-3 text-indigo-400" />
            Company Name
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Northwind Logistics"
            className="input-base"
            disabled={loading}
          />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
            <User className="w-3 h-3 text-indigo-400" />
            Contact Name
          </label>
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="e.g. Sarah Chen"
            className="input-base"
            disabled={loading}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400">Deal Stage</label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="input-base appearance-none cursor-pointer"
            disabled={loading}
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
            <FileText className="w-3 h-3 text-indigo-400" />
            First Interaction Note
            <span className="text-gray-600 font-normal">(optional)</span>
          </label>
          <textarea
            value={firstNote}
            onChange={(e) => setFirstNote(e.target.value)}
            placeholder="What happened on this call? Write naturally \u2014 who said what, key numbers, objections raised\u2026"
            className="input-base resize-none h-28"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating…
            </>
          ) : (
            "Create Deal & Open Workspace"
          )}
        </button>
      </form>
    </div>
  );
}
'@
Set-Content -Path "c:\Users\kotte\Downloads\hackaton\src\app\deals\new\page.tsx" -Value $content1 -Encoding UTF8

$content2 = @'
"use client";

import { useState, useEffect } from "react";
import { BarChart3, Brain, TrendingUp, Loader2 } from "lucide-react";

interface PatternInsight {
  text: string;
  confidence: number;
  category: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  pricing: "text-amber-400",
  timeline: "text-sky-400",
  competition: "text-red-400",
  technical: "text-violet-400",
  authority: "text-orange-400",
  security: "text-emerald-400",
  other: "text-gray-500",
};

export default function PatternsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patterns")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-[1000px] mx-auto px-5 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-violet-600/10 text-violet-400 text-xs font-semibold mb-3 ring-1 ring-inset ring-violet-500/20">
          <BarChart3 className="w-3.5 h-3.5" />
          Cross-Deal Intelligence
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
          Objection Patterns
        </h1>
        <p className="text-sm text-gray-500">
          AI-synthesized patterns from Hindsight\u2019s opinion network across all deals.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 w-48 bg-white/[0.04] rounded mb-3" />
              <div className="h-3 w-full bg-white/[0.04] rounded mb-2" />
              <div className="h-3 w-3/4 bg-white/[0.04] rounded" />
            </div>
          ))}
        </div>
      ) : data?.status === "no-data" ? (
        <div className="card p-16 text-center">
          <Brain className="w-10 h-10 mx-auto mb-4 text-gray-700" />
          <h3 className="text-base font-semibold text-gray-300 mb-1">No patterns yet</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Log more interactions across multiple deals to start building
            cross-deal objection intelligence.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* AI Summary */}
          {data?.summary && (
            <div className="card p-5 border-indigo-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-indigo-400" />
                <span className="section-label">AI Analysis</span>
                {data.rawOpinionCount > 0 && (
                  <span className="text-[11px] text-gray-600 font-mono ml-auto">
                    {data.rawOpinionCount} opinions
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                {data.summary}
              </p>
            </div>
          )}

          {/* Insights */}
          {data?.insights?.length > 0 && (
            <div className="space-y-3">
              <p className="section-label">Pattern Insights</p>
              {data.insights.map((insight: PatternInsight, i: number) => (
                <div key={i} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wider ${
                        CATEGORY_COLORS[insight.category] || CATEGORY_COLORS.other
                      }`}
                    >
                      {insight.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      <span className="text-[11px] font-mono text-gray-500">
                        {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {insight.text}
                  </p>
                  <div className="mt-3 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full transition-all duration-700"
                      style={{ width: `${insight.confidence * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
'@
Set-Content -Path "c:\Users\kotte\Downloads\hackaton\src\app\patterns\page.tsx" -Value $content2 -Encoding UTF8
