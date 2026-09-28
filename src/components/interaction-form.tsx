"use client";

import { useState } from "react";
import { Send, Brain, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const SAMPLE_NOTES = [
  {
    label: "⚡ Pricing & Budget Call",
    text: "Follow-up call with VP of Purchasing. Discussed request for a 15% volume discount on annual enterprise plan. CFO David Park requires final contract approval before end of Q4. Competitor Salesforce offered a bundle discount, but prospect prefers our real-time AI memory capabilities.",
  },
  {
    label: "🛡️ Security & Technical Review",
    text: "Technical review call with Security Director Alex Vance. Reviewed SOC2 Type II compliance and data isolation guarantees. Alex inquired about custom memory retention policies and enterprise SSO integration via Okta.",
  },
];

export function InteractionForm({
  dealId,
  onSuccess,
}: {
  dealId: string;
  onSuccess: () => void;
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);

    const toastId = toast.loading("Processing memory with Hindsight AI…", {
      icon: <Brain className="w-4 h-4 text-dm-indigo animate-pulse" />,
    });

    try {
      const res = await fetch(`/api/deals/${dealId}/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error("Failed to log interaction");

      const data = await res.json();

      setTimeout(() => {
        toast.success(`DealBook learned: ${data.summary}`, {
          id: toastId,
          icon: <Brain className="w-4 h-4 text-dm-green" />,
          duration: 5000,
        });
        onSuccess();
      }, 3000);

      setContent("");
    } catch (e) {
      toast.error("Failed to log interaction", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
        <span className="text-xs font-semibold text-dm-muted">Call Notes & Transcripts</span>
        <span className="text-[10px] font-mono text-dm-indigo bg-dm-indigo/10 border border-dm-indigo/20 px-2 py-0.5 rounded-full font-bold">Auto-summarizing</span>
      </div>

      {/* Quick Sample Preset Buttons */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-dm-muted">
          <Sparkles className="w-3 h-3 text-dm-indigo" />
          <span>Quick Sample Presets:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_NOTES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setContent(sample.text)}
              className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-dm-indigo/20 border border-white/[0.08] hover:border-dm-indigo/30 text-dm-text hover:text-white transition-all cursor-pointer text-left"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Log call notes or transcripts (e.g. 'Sarah confirmed $80K budget approval from CFO David Park. CTO James Liu requested live tech demo next week...')"
        className="w-full h-36 px-4 py-3 bg-[#0B0F17] border border-white/[0.08] rounded-xl text-sm text-dm-text placeholder:text-dm-muted/40 resize-none focus:outline-none focus:border-dm-indigo/60 focus:ring-2 focus:ring-dm-indigo/20 transition-all leading-relaxed"
        disabled={loading}
      />
      
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-dm-indigo to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all duration-200 shadow-lg shadow-dm-indigo/25 active:scale-[0.98] cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Retaining Memory…</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Log Call Note & Retain Memory</span>
          </>
        )}
      </button>
    </form>
  );
}

