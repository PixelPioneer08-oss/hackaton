const STAGE_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Prospecting: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", dot: "bg-blue-400" },
  Discovery: { bg: "bg-purple-500/10", text: "text-purple-300", border: "border-purple-500/20", dot: "bg-purple-400" },
  Proposal: { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/20", dot: "bg-amber-400" },
  Negotiation: { bg: "bg-orange-500/10", text: "text-orange-300", border: "border-orange-500/20", dot: "bg-orange-400" },
  "Closed-Won": { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/20", dot: "bg-emerald-400" },
  "Closed-Lost": { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20", dot: "bg-rose-400" },
};

export function StageBadge({ stage }: { stage: string }) {
  const colors = STAGE_COLORS[stage] || STAGE_COLORS.Prospecting;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border} shadow-sm shrink-0`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} animate-pulse`} />
      {stage}
    </span>
  );
}
