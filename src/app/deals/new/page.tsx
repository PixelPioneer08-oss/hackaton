"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, User, FileText, Loader2 } from "lucide-react";

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
    <div className="max-w-xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-dm-text mb-2">Create New Deal</h1>
      <p className="text-sm text-dm-muted mb-8">
        Set up a new deal and start building AI-powered memory.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Name */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-dm-text">
            <Building2 className="w-4 h-4 text-dm-indigo" />
            Company Name
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Northwind Logistics"
            className="w-full px-4 py-3 bg-dm-bg border border-dm-border rounded-xl text-sm text-dm-text placeholder:text-dm-muted/50 focus:outline-none focus:border-dm-indigo/50 focus:ring-1 focus:ring-dm-indigo/25 transition-all"
            disabled={loading}
          />
        </div>

        {/* Contact Name */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-dm-text">
            <User className="w-4 h-4 text-dm-indigo" />
            Contact Name
          </label>
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="e.g. Sarah Chen"
            className="w-full px-4 py-3 bg-dm-bg border border-dm-border rounded-xl text-sm text-dm-text placeholder:text-dm-muted/50 focus:outline-none focus:border-dm-indigo/50 focus:ring-1 focus:ring-dm-indigo/25 transition-all"
            disabled={loading}
          />
        </div>

        {/* Deal Stage */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-dm-text">Deal Stage</label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="w-full px-4 py-3 bg-dm-bg border border-dm-border rounded-xl text-sm text-dm-text focus:outline-none focus:border-dm-indigo/50 focus:ring-1 focus:ring-dm-indigo/25 transition-all appearance-none cursor-pointer"
            disabled={loading}
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* First Note (Optional) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-dm-text">
            <FileText className="w-4 h-4 text-dm-indigo" />
            First Interaction Note
            <span className="text-dm-muted font-normal">(optional)</span>
          </label>
          <textarea
            value={firstNote}
            onChange={(e) => setFirstNote(e.target.value)}
            placeholder="What happened on this call? Write it like you're telling a colleague — who said what, and why it matters."
            className="w-full h-32 px-4 py-3 bg-dm-bg border border-dm-border rounded-xl text-sm text-dm-text placeholder:text-dm-muted/50 resize-none focus:outline-none focus:border-dm-indigo/50 focus:ring-1 focus:ring-dm-indigo/25 transition-all"
            disabled={loading}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-dm-indigo hover:bg-dm-indigo-hover disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all duration-200 shadow-lg shadow-dm-indigo/25"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating Deal...
            </>
          ) : (
            "Create Deal & Open Workspace"
          )}
        </button>
      </form>
    </div>
  );
}
