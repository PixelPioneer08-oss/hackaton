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
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <User className="w-4 h-4 text-dm-indigo" />
        <h3 className="text-sm font-semibold text-dm-text">{data.contactName}</h3>
        <span className="text-xs text-dm-muted">at {data.companyName}</span>
      </div>
      <div className="space-y-2">
        {observations.map((obs: any, i: number) => (
          <p key={i} className="text-sm text-dm-muted leading-relaxed">
            {obs.text}
          </p>
        ))}
      </div>
    </div>
  );
}
