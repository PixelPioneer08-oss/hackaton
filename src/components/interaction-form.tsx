"use client";

import { useState } from "react";
import { Send, Brain, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

    // Show processing toast immediately
    const toastId = toast.loading("Processing memory…", {
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

      // Wait 3s for Hindsight to process the retain, then show the "learned" toast
      setTimeout(() => {
        toast.success(`DealMind learned: ${data.summary}`, {
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
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What happened on this call? Write it like you're telling a colleague — who said what, and why it matters. (e.g. 'Sarah raised budget concerns again — now saying $80K instead of the $50K from our first call, says it's due to Q4 approval timing...')"
        className="w-full h-36 px-4 py-3 bg-dm-bg border border-dm-border rounded-xl text-sm text-dm-text placeholder:text-dm-muted/50 resize-none focus:outline-none focus:border-dm-indigo/50 focus:ring-1 focus:ring-dm-indigo/25 transition-all"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-dm-indigo hover:bg-dm-indigo-hover disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all duration-200 shadow-lg shadow-dm-indigo/25"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Log Interaction
          </>
        )}
      </button>
    </form>
  );
}
