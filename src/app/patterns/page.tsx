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
  timeline: "text-blue-400",
  competition: "text-red-400",
  technical: "text-purple-400",
  authority: "text-orange-400",
  security: "text-green-400",
  other: "text-dm-muted",
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
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-dm-indigo/10">
            <BarChart3 className="w-6 h-6 text-dm-indigo" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Objection Intelligence
            </h1>
            <p className="text-sm text-dm-muted">
              Cross-deal patterns powered by Hindsight&apos;s opinion network
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-4 w-48 bg-dm-card-hover rounded mb-3" />
              <div className="h-3 w-full bg-dm-card-hover rounded mb-2" />
              <div className="h-3 w-3/4 bg-dm-card-hover rounded" />
            </div>
          ))}
        </div>
      ) : data?.status === "no-data" ? (
        <div className="glass-card p-12 text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-dm-muted opacity-50" />
          <h3 className="text-lg font-semibold text-dm-text mb-2">
            No patterns yet
          </h3>
          <p className="text-sm text-dm-muted max-w-md mx-auto">
            Log more interactions across multiple deals to start building
            cross-deal objection intelligence. DealMind learns which
            objection-handling approaches work best over time.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* AI Summary */}
          {data?.summary && (
            <div className="glass-card p-6 glow-indigo">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-dm-indigo" />
                <h2 className="text-sm font-semibold text-dm-text">
                  AI Analysis
                </h2>
                {data.rawOpinionCount > 0 && (
                  <span className="text-xs text-dm-muted font-mono">
                    Based on {data.rawOpinionCount} opinions
                  </span>
                )}
              </div>
              <p className="text-sm text-dm-muted leading-relaxed">
                {data.summary}
              </p>
            </div>
          )}

          {/* Opinion Cards */}
          {data?.insights?.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-dm-text uppercase tracking-wider">
                Pattern Insights
              </h2>
              {data.insights.map((insight: PatternInsight, i: number) => (
                <div
                  key={i}
                  className="glass-card p-5 animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs font-medium uppercase tracking-wider ${
                        CATEGORY_COLORS[insight.category] || CATEGORY_COLORS.other
                      }`}
                    >
                      {insight.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 text-dm-green" />
                      <span className="text-xs font-mono text-dm-muted">
                        {Math.round(insight.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-dm-text leading-relaxed">
                    {insight.text}
                  </p>
                  {/* Confidence bar */}
                  <div className="mt-3 h-1 bg-dm-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-dm-indigo to-purple-400 rounded-full transition-all duration-700"
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
