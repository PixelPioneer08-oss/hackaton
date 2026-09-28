"use client";
import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

const R = 52;
const C = 2 * Math.PI * R;

export function DealHealth({ dealId, refreshKey }: { dealId: string; refreshKey?: number }) {
  const [data, setData] = useState<any>(null);
  const [showRules, setShowRules] = useState(false);
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    setData(null);
    setAnimated(0);
    fetch(`/api/deals/${dealId}/health`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ error: true }));
  }, [dealId, refreshKey]);

  useEffect(() => {
    if (data?.score !== undefined) {
      const timer = setTimeout(() => setAnimated(data.score), 100);
      return () => clearTimeout(timer);
    }
  }, [data?.score]);

  if (!data) {
    return (
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-dm-indigo" />
          <h3 className="text-sm font-semibold text-dm-text">Deal Health Score</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-[120px] h-[120px] rounded-full bg-white/[0.04] animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-16 bg-dm-card-hover rounded animate-pulse" />
            <div className="h-3 w-24 bg-dm-card-hover rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-dm-muted" />
          <h3 className="text-sm font-semibold text-dm-text">Deal Health Score</h3>
        </div>
        <p className="text-xs text-dm-muted">Health score unavailable.</p>
      </div>
    );
  }

  const color = data.score >= 70 ? "#22C55E" : data.score >= 40 ? "#F59E0B" : "#EF4444";

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-dm-indigo" />
          <h3 className="text-sm font-semibold text-dm-text">Deal Health Score</h3>
        </div>
        <span
          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
          style={{ color, borderColor: `${color}33`, backgroundColor: `${color}15` }}
        >
          {data.verdict}
        </span>
      </div>

      <div className="flex items-center gap-5">
        <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90 shrink-0">
          <circle cx="60" cy="60" r={R} stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
          <circle
            cx="60" cy="60" r={R} stroke={color} strokeWidth="10" fill="none" strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C - (animated / 100) * C}
            style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
          {/* Score text in center */}
          <text
            x="60" y="60" textAnchor="middle" dominantBaseline="central"
            fill={color} fontSize="28" fontWeight="700"
            style={{ transform: "rotate(90deg)", transformOrigin: "center" }}
          >
            {data.score}
          </text>
        </svg>
        <div className="flex-1">
          <p className="text-xs sm:text-sm text-dm-muted leading-relaxed">{data.summary}</p>
          {data.partial && (
            <p className="mt-1 text-[11px] text-amber-400">⚠ Some inputs unavailable — score is partial.</p>
          )}
        </div>
      </div>

      {/* Factor bars */}
      <div className="space-y-2.5">
        {data.factors?.map((f: any) => (
          <div key={f.label}>
            <div className="flex justify-between text-xs text-dm-muted mb-1">
              <span className="font-medium">{f.label}</span>
              <span className="font-mono">{f.value}/{f.max}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${(f.value / f.max) * 100}%`, background: color }}
              />
            </div>
            <p className="text-[11px] text-dm-muted/70 mt-0.5">{f.note}</p>
          </div>
        ))}
      </div>

      {/* How is this calculated */}
      <button
        onClick={() => setShowRules(!showRules)}
        className="text-xs text-dm-indigo hover:text-dm-indigo-hover transition-colors cursor-pointer"
      >
        {showRules ? "Hide calculation rules" : "How is this calculated?"}
      </button>
      {showRules && (
        <p className="text-[11px] text-dm-muted leading-relaxed bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
          Four factors, up to 25 points each. <strong>Engagement:</strong> days since last contact.
          <strong> Momentum:</strong> pipeline stage progression. <strong>Risk:</strong> 25 minus
          points for open objections and drift signals. <strong>Stakeholders:</strong> how many
          people are identified. The one-line summary is AI-written; the number is purely rule-based.
        </p>
      )}
    </div>
  );
}

export function CompactDealHealth({ dealId, refreshKey }: { dealId: string; refreshKey?: number }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/deals/${dealId}/health`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => null);
  }, [dealId, refreshKey]);

  if (!data || data.error) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] animate-pulse">
        <Activity className="w-4 h-4 text-dm-indigo" />
        <span className="text-xs font-semibold text-dm-muted">Health: --</span>
      </div>
    );
  }

  const color = data.score >= 70 ? "#22C55E" : data.score >= 40 ? "#F59E0B" : "#EF4444";

  return (
    <div
      className="flex items-center gap-2 px-3 py-1 rounded-xl border transition-all shadow-sm shrink-0"
      style={{
        backgroundColor: `${color}12`,
        borderColor: `${color}35`,
      }}
    >
      <Activity className="w-4 h-4 shrink-0" style={{ color }} />
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-dm-muted">Health:</span>
        <span className="text-sm font-extrabold font-mono" style={{ color }}>
          {data.score}/100
        </span>
        <span
          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ml-0.5"
          style={{ color, borderColor: `${color}44`, backgroundColor: `${color}25` }}
        >
          {data.verdict}
        </span>
      </div>
    </div>
  );
}

