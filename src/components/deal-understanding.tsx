"use client";

import { useState, useEffect } from "react";
import { Sparkles, User, Building2, Loader2 } from "lucide-react";

export function DealUnderstanding({ dealId, interactionCount }: { dealId: string; interactionCount: number }) {
  const [data, setData] = useState<any>(null);
  const [contactData, setContactData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<"contact" | "company">("contact");

  useEffect(() => {
    async function fetch_all() {
      try {
        const [uRes, cRes] = await Promise.all([
          fetch(`/api/deals/${dealId}/understanding`),
          fetch(`/api/deals/${dealId}/contact`),
        ]);
        if (uRes.ok) setData(await uRes.json());
        if (cRes.ok) setContactData(await cRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetch_all();
  }, [dealId]);

  const observations = Array.isArray(contactData?.observations) ? contactData.observations : [];

  if (loading) {
    return (
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-dm-indigo" />
          <h3 className="text-sm font-semibold text-dm-text">Prospect Profile & Mental Model</h3>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-dm-card-hover rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-dm-card-hover rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-dm-card-hover rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-dm-indigo/15 text-dm-indigo border border-dm-indigo/30">
            {subTab === "company" ? (
              <Building2 className="w-5 h-5" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {subTab === "company"
                ? `${contactData?.companyName || "Company"} Details & Mental Model`
                : `${contactData?.contactName || "Key Contact"} Profile`}
            </h3>
            <p className="text-xs text-dm-muted">
              {subTab === "company"
                ? `Prospect priorities & deal synthesis for ${contactData?.companyName || "Company"}`
                : `Observation Facts & memory for ${contactData?.contactName || "Contact"} at ${contactData?.companyName || "Company"}`}
            </p>
          </div>
        </div>

        {/* Sub-toggle navigation buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl">
          <button
            onClick={() => setSubTab("contact")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === "contact"
                ? "bg-dm-indigo text-white shadow-sm shadow-dm-indigo/30 font-bold"
                : "text-dm-muted hover:text-white hover:bg-white/5"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Contact Person</span>
            {observations.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
                {observations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSubTab("company")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === "company"
                ? "bg-dm-indigo text-white shadow-sm shadow-dm-indigo/30 font-bold"
                : "text-dm-muted hover:text-white hover:bg-white/5"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Company Details</span>
          </button>
        </div>
      </div>

      {/* View 1: Contact Person Observation Facts */}
      {subTab === "contact" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-dm-indigo uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-dm-indigo inline-block" />
              Key Contact Observation Facts ({contactData?.contactName})
            </h4>
            <span className="text-[10px] text-dm-muted font-mono">Synthesized by Hindsight Engine</span>
          </div>

          {observations.length > 0 ? (
            <div className="max-h-[380px] overflow-y-auto custom-scrollbar pr-1.5 space-y-2 bg-white/[0.02] p-4 rounded-xl border border-white/[0.06]">
              {observations.map((obs: any, i: number) => (
                <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-dm-text/90 leading-relaxed py-0.5">
                  <span className="text-dm-indigo font-bold shrink-0 mt-0.5">•</span>
                  <span>{obs.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/[0.02] p-6 rounded-xl border border-white/[0.06] text-center">
              <p className="text-xs text-dm-muted">No observation facts extracted yet. Log call interactions to build contact facts.</p>
            </div>
          )}
        </div>
      )}

      {/* View 2: Company Details & Mental Model */}
      {subTab === "company" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-dm-indigo uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-dm-indigo" />
              Company Mental Model & Deal Priorities ({contactData?.companyName})
            </h4>
            {data?.lastUpdated && (
              <span className="text-[10px] text-dm-muted/60 font-mono">
                Updated {new Date(data.lastUpdated).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto custom-scrollbar pr-1.5 bg-white/[0.02] p-4 rounded-xl border border-white/[0.06] space-y-2">
            {data?.content ? (
              <p className="text-xs sm:text-sm text-dm-muted leading-relaxed whitespace-pre-line">
                {data.content}
              </p>
            ) : (
              <p className="text-xs text-dm-muted italic text-center py-4">
                Log interactions to automatically generate the company mental model and priorities.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


