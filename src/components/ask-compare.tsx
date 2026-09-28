"use client";
import { useState } from "react";
import { Brain, Ban, Send, Loader2, Sparkles, Scale } from "lucide-react";
import { EvidenceList } from "./evidence-list";

const STARTERS = [
  "How should I approach the next call?",
  "What has the budget looked like over time?",
  "What should I be worried about on this deal?",
  "Who are the key decision makers?",
];

function FormattedText({ text }: { text: string }) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-bold text-white bg-dm-indigo/15 border border-dm-indigo/30 px-1.5 py-0.5 rounded-md inline-block my-0.5">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      })}
    </span>
  );
}

export function AskCompare({ dealId }: { dealId: string }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showCompare, setShowCompare] = useState(false);

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/deals/${dealId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, mode: "compare" }),
      });
      if (res.ok) setResult(await res.json());
    } catch (e) {
      console.error("Ask failed:", e);
    }
    setLoading(false);
  }

  return (
    <div className="glass-card p-5 space-y-4">
      {/* Header with Optional Compare Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-dm-indigo" />
          <h3 className="text-sm font-bold text-white tracking-tight">Ask DealBook AI</h3>
        </div>
        <button
          onClick={() => setShowCompare(!showCompare)}
          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
            showCompare
              ? "bg-dm-indigo text-white border-dm-indigo/50 shadow-sm"
              : "bg-white/5 text-dm-muted hover:text-white border-white/10 hover:bg-white/10"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{showCompare ? "Showing Side-by-Side Compare" : "Compare with Standard AI"}</span>
        </button>
      </div>

      {/* Starter questions */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-dm-muted">
          <Sparkles className="w-3 h-3 text-dm-indigo" />
          <span>Suggested Questions:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => { setQ(s); ask(s); }}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-dm-indigo/20 border border-white/[0.08] hover:border-dm-indigo/30 text-dm-text hover:text-white transition-all text-left cursor-pointer disabled:opacity-50"
            >
              "{s}"
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(q)}
          placeholder="Ask anything about this deal…"
          className="flex-1 px-4 py-2.5 bg-[#0B0F17] border border-white/[0.08] rounded-xl text-xs sm:text-sm text-dm-text placeholder:text-dm-muted/40 focus:outline-none focus:border-dm-indigo/60 focus:ring-1 focus:ring-dm-indigo/25 transition-all"
          disabled={loading}
        />
        <button
          onClick={() => ask(q)}
          disabled={loading || !q.trim()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-dm-indigo to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all shadow-lg shadow-dm-indigo/25 cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      {/* Results Section */}
      {(loading || result) && (
        showCompare ? (
          /* SIDE-BY-SIDE COMPARE MODE */
          <div className="grid gap-3 md:grid-cols-2 pt-2">
            {/* WITHOUT memory */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-dm-muted pb-2 border-b border-white/[0.06]">
                <Ban className="h-3.5 w-3.5 text-red-400" />
                <span>Without Memory</span>
                <span className="ml-auto text-[10px] font-mono text-red-400/70 bg-red-400/10 px-1.5 py-0.5 rounded">Stateless</span>
              </div>
              {loading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 w-full bg-dm-card-hover rounded" />
                  <div className="h-3 w-4/5 bg-dm-card-hover rounded" />
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-dm-muted leading-relaxed">
                  <FormattedText text={result?.stateless?.answer} />
                </p>
              )}
            </div>

            {/* WITH memory */}
            <div className="rounded-xl border border-dm-indigo/40 bg-dm-indigo/[0.07] p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white pb-2 border-b border-white/[0.08]">
                <Brain className="h-3.5 w-3.5 text-indigo-400" />
                <span>With Hindsight Memory</span>
                <span className="ml-auto text-[10px] font-mono text-indigo-300 bg-dm-indigo/20 border border-dm-indigo/40 px-2 py-0.5 rounded-md font-bold">Grounded</span>
              </div>
              {loading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 w-full bg-dm-indigo/20 rounded" />
                  <div className="h-3 w-4/5 bg-dm-indigo/20 rounded" />
                </div>
              ) : (
                <>
                  <p className="text-xs sm:text-sm text-dm-text leading-relaxed">
                    <FormattedText text={result?.memory?.answer} />
                  </p>
                  {result?.memory?.degraded && (
                    <p className="text-[11px] text-amber-400">Memory unavailable — showing fallback.</p>
                  )}
                  <EvidenceList items={result?.memory?.evidence ?? []} />
                </>
              )}
            </div>
          </div>
        ) : (
          /* CLEAN SINGLE ANSWER MODE */
          <div className="rounded-xl border border-dm-indigo/40 bg-dm-indigo/[0.07] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-bold text-white tracking-tight">DealBook Memory Answer</span>
              </div>
              <span className="text-[10px] font-mono text-indigo-300 bg-dm-indigo/20 border border-dm-indigo/40 px-2.5 py-0.5 rounded-full font-bold">
                Hindsight Grounded
              </span>
            </div>
            {loading ? (
              <div className="space-y-2 animate-pulse py-2">
                <div className="h-4 w-full bg-dm-indigo/20 rounded" />
                <div className="h-4 w-5/6 bg-dm-indigo/20 rounded" />
                <div className="h-4 w-3/4 bg-dm-indigo/20 rounded" />
              </div>
            ) : (
              <div className="space-y-3 px-1">
                <p className="text-xs sm:text-sm text-dm-text leading-relaxed whitespace-pre-line">
                  <FormattedText text={result?.memory?.answer} />
                </p>
                {result?.memory?.degraded && (
                  <p className="text-[11px] text-amber-400">Memory unavailable — showing fallback.</p>
                )}
                <EvidenceList items={result?.memory?.evidence ?? []} />
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}

