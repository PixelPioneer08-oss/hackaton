"use client";

import { useState } from "react";
import { Send, Brain, Loader2, MessageCircle } from "lucide-react";

interface QA {
  question: string;
  answer: string;
  sources: number;
}

export function AskDealMind({ dealId }: { dealId: string }) {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<QA[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const q = question;
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch(`/api/deals/${dealId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      if (res.ok) {
        const data = await res.json();
        setHistory((prev) => [...prev, { question: q, answer: data.answer, sources: data.sources }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-4 h-4 text-dm-indigo" />
        <h3 className="text-sm font-semibold text-dm-text">Ask DealMind</h3>
      </div>

      {history.length > 0 && (
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {history.map((qa, i) => (
            <div key={i} className="space-y-2 animate-fade-in">
              <div className="flex items-start gap-2">
                <span className="text-xs text-dm-indigo mt-0.5">Q:</span>
                <p className="text-sm text-dm-text">{qa.question}</p>
              </div>
              <div className="flex items-start gap-2 pl-4">
                <Brain className="w-3.5 h-3.5 text-dm-indigo mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-dm-muted leading-relaxed">{qa.answer}</p>
                  {qa.sources > 0 && (
                    <span className="text-xs text-dm-muted/50 font-mono mt-1 inline-block">
                      Based on {qa.sources} memories
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAsk} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder='"What pricing pushback has this prospect given us?"'
          className="flex-1 px-4 py-2.5 bg-dm-bg border border-dm-border rounded-xl text-sm text-dm-text placeholder:text-dm-muted/50 focus:outline-none focus:border-dm-indigo/50 focus:ring-1 focus:ring-dm-indigo/25 transition-all"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-4 py-2.5 rounded-xl bg-dm-indigo hover:bg-dm-indigo-hover disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all shadow-lg shadow-dm-indigo/25"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
