"use client";

import { useState, useEffect } from "react";
import { Mail, RefreshCw, Copy, Check, Sparkles, Send } from "lucide-react";
import { toast } from "sonner";

interface EmailData {
  recipient: string;
  subject: string;
  body: string;
  keyPointsAddressed: string[];
}

export function EmailDraft({ dealId }: { dealId: string }) {
  const [data, setData] = useState<EmailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  async function fetchEmailDraft() {
    setLoading(true);
    try {
      const res = await fetch(`/api/deals/${dealId}/email`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch email draft:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmailDraft();
  }, [dealId]);

  function handleCopy() {
    if (!data) return;
    const fullText = `To: ${data.recipient}\nSubject: ${data.subject}\n\n${data.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success("Email draft copied to clipboard!", { duration: 3000 });
    setTimeout(() => setCopied(false), 2500);
  }

  if (loading) {
    return (
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-dm-text">Follow-Up Email Draft</h3>
        </div>
        <div className="space-y-3 animate-pulse">
          <div className="h-4 w-48 bg-dm-card-hover rounded" />
          <div className="h-4 w-full bg-dm-card-hover rounded" />
          <div className="h-32 w-full bg-dm-card-hover rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const keyPoints = Array.isArray(data.keyPointsAddressed) ? data.keyPointsAddressed : [];

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-dm-indigo" />
          <h3 className="text-sm font-semibold text-dm-text">Follow-Up Email Draft</h3>
          <span className="text-[10px] font-mono text-dm-indigo bg-dm-indigo/10 border border-dm-indigo/20 px-2 py-0.5 rounded-full font-bold">
            AI Generated
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-dm-muted hover:text-white border border-white/[0.08] transition-all cursor-pointer"
            title="Copy email to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-dm-green" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Email"}</span>
          </button>
          <button
            onClick={fetchEmailDraft}
            className="p-1.5 rounded-xl hover:bg-white/5 text-dm-muted hover:text-dm-text transition-colors cursor-pointer"
            title="Regenerate email draft"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recipient & Subject Header Fields */}
      <div className="space-y-2 bg-[#0B0F17] p-3.5 rounded-xl border border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-dm-muted w-14 shrink-0">To:</span>
          <span className="font-mono text-dm-indigo font-medium text-xs">{data.recipient}</span>
        </div>
        <div className="flex items-center gap-2 text-xs border-t border-white/[0.04] pt-2">
          <span className="font-bold text-dm-muted w-14 shrink-0">Subject:</span>
          <span className="font-semibold text-white text-xs">{data.subject}</span>
        </div>
      </div>

      {/* Email Body Text */}
      <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-4 bg-[#0B0F17] rounded-xl border border-white/[0.06] text-xs sm:text-sm text-dm-text leading-relaxed whitespace-pre-line font-sans">
        {data.body}
      </div>

      {/* Key Points Addressed Pills */}
      {keyPoints.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-dm-muted">
            <Sparkles className="w-3 h-3 text-dm-indigo" />
            <span>Key Points Addressed in Email:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {keyPoints.map((point, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-dm-indigo/10 border border-dm-indigo/20 text-dm-text font-medium"
              >
                ✓ {point}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
