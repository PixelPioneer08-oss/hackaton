const STAGE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Prospecting: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
  Discovery: { bg: "bg-purple-500/10", text: "text-purple-400", dot: "bg-purple-400" },
  Proposal: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  Negotiation: { bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-400" },
  "Closed-Won": { bg: "bg-green-500/10", text: "text-green-400", dot: "bg-green-400" },
  "Closed-Lost": { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
};

export function StageBadge({ stage }: { stage: string }) {
  const colors = STAGE_COLORS[stage] || STAGE_COLORS.Prospecting;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {stage}
    </span>
  );
}
