"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";

export function ContactProfile({ dealId }: { dealId: string }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/deals/${dealId}/contact`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, [dealId]);

  const observations = Array.isArray(data?.observations) ? data.observations : [];

  if (!data || observations.length === 0) {
    return null; // Don't render anything if no observations yet
  }

  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-dm-indigo/10 text-dm-indigo border border-dm-indigo/20">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">{data.contactName}</h3>
            <p className="text-xs text-dm-muted">Key Contact at {data.companyName}</p>
          </div>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-dm-indigo/10 text-dm-indigo border border-dm-indigo/20 font-semibold">
          Observation Facts ({observations.length})
        </span>
      </div>

      {/* Internal Scroller Box */}
      <div className="max-h-[460px] overflow-y-auto custom-scrollbar pr-1.5 space-y-2.5">
        {observations.map((obs: any, i: number) => (
          <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-dm-text/90 leading-relaxed">
            <span className="text-dm-indigo font-bold shrink-0 mt-0.5">•</span>
            <span>{obs.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
