"use client";

import { useState } from "react";
import { Send, Brain, Loader2, MessageCircle, Sparkles } from "lucide-react";

interface QA {
  question: string;
  answer: string;
  sources: number;
}

const SAMPLE_QUESTIONS = [
  "What pricing pushback has this prospect given us?",
  "Who are the key decision makers and their concerns?",
  "What competitors or timeline risks were discussed?",
];

export function AskDealBook({ dealId }: { dealId: string }) {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<QA[]>([]);
  const [loading, setLoading] = useState(false);

  async function submitQuestion(qText: string) {
    if (!qText.trim() || loading) return;

    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch(`/api/deals/${dealId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: qText }),
      });

      if (res.ok) {
        const data = await res.json();
        setHistory((prev) => [...prev, { question: qText, answer: data.answer, sources: data.sources }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    submitQuestion(question);
  }

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-dm-indigo" />
          <h3 className="text-sm font-semibold text-dm-text">Ask DealBook AI Assistant</h3>
        </div>
        <span className="text-[10px] font-mono text-dm-indigo bg-dm-indigo/10 border border-dm-indigo/20 px-2 py-0.5 rounded-full font-bold">
          Hindsight Recall
        </span>
      </div>

      {/* Suggested Quick Questions */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-dm-muted">
          <Sparkles className="w-3 h-3 text-dm-indigo" />
          <span>Suggested Questions:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((sq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => submitQuestion(sq)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-dm-indigo/20 border border-white/[0.08] hover:border-dm-indigo/30 text-dm-text hover:text-white transition-all text-left cursor-pointer disabled:opacity-50"
            >
              "{sq}"
            </button>
          ))}
        </div>
      </div>

      {history.length > 0 && (
        <div className="space-y-3 mb-4 max-h-72 overflow-y-auto custom-scrollbar pr-1">
          {history.map((qa, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-[#0B0F17] border border-white/[0.06] space-y-2.5 animate-fade-in">
              <div className="flex items-start gap-2">
                <span className="text-xs font-bold text-dm-indigo mt-0.5">Q:</span>
                <p className="text-xs sm:text-sm font-semibold text-white">{qa.question}</p>
              </div>
              <div className="flex items-start gap-2 pl-3 border-l-2 border-dm-indigo/40">
                <Brain className="w-3.5 h-3.5 text-dm-indigo mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm text-dm-muted leading-relaxed">{qa.answer}</p>
                  {qa.sources > 0 && (
                    <span className="text-[10px] text-dm-indigo/80 font-mono mt-1.5 inline-block bg-dm-indigo/10 px-2 py-0.5 rounded">
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
          placeholder="Ask anything about this deal's memory..."
          className="flex-1 px-4 py-2.5 bg-[#0B0F17] border border-dm-border rounded-xl text-xs sm:text-sm text-dm-text placeholder:text-dm-muted/40 focus:outline-none focus:border-dm-indigo/60 focus:ring-1 focus:ring-dm-indigo/25 transition-all"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-dm-indigo to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all shadow-lg shadow-dm-indigo/25 cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
