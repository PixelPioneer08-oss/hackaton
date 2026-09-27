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
      <div className="text-center py-12 text-dm-muted">
        <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No interactions logged yet.</p>
        <p className="text-xs mt-1">Log your first call to start building memory.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {interactions.map((interaction, index) => (
        <div
          key={interaction.id}
          className="glass-card p-4 animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs text-dm-muted">
              {new Date(interaction.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          {interaction.summary && (
            <p className="text-sm font-medium text-dm-indigo mb-2">
              {interaction.summary}
            </p>
          )}
          <p className="text-sm text-dm-muted leading-relaxed line-clamp-3">
            {interaction.content}
          </p>
        </div>
      ))}
    </div>
  );
}
