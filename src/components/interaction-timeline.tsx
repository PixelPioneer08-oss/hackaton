"use client";

import { MessageSquare } from "lucide-react";

interface Interaction {
  id: string;
  content: string;
  summary: string | null;
  createdAt: string;
}

export function InteractionTimeline({ interactions }: { interactions: Interaction[] }) {
  if (interactions.length === 0) {
    return (
      <div className="glass-card p-8 text-center text-dm-muted">
        <MessageSquare className="w-8 h-8 mx-auto mb-3 text-dm-indigo opacity-60" />
        <p className="text-sm font-semibold text-white">No call notes logged yet</p>
        <p className="text-xs text-dm-muted mt-1">Log your first call to start building AI sales memory.</p>
      </div>
    );
  }

  return (
    <div className="max-h-[440px] overflow-y-auto custom-scrollbar pr-1 space-y-3">
      {interactions.map((interaction, index) => (
        <div
          key={interaction.id}
          className="glass-card p-4 hover:border-dm-indigo/30 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] text-dm-indigo bg-dm-indigo/10 border border-dm-indigo/20 px-2 py-0.5 rounded-full font-semibold">
              {new Date(interaction.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          {interaction.summary && (
            <p className="text-sm font-bold text-white mb-1.5 leading-snug">
              {interaction.summary}
            </p>
          )}
          <p className="text-xs text-dm-text/90 leading-relaxed font-sans">
            {interaction.content}
          </p>
        </div>
      ))}
    </div>
  );
}
