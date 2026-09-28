import Link from "next/link";
import { StageBadge } from "./stage-badge";
import { Clock, User, Brain, Building2, ArrowRight } from "lucide-react";

interface DealCardProps {
  id: string;
  companyName: string;
  contactName: string;
  stage: string;
  lastInteractionAt: string | null;
  interactionCount: number;
}

function timeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} wks ago`;
  return `${Math.floor(diffDays / 30)} mos ago`;
}

export function DealCard({ id, companyName, contactName, stage, lastInteractionAt, interactionCount }: DealCardProps) {
  const initials = companyName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link href={`/deals/${id}`}>
      <div className="glass-card p-6 cursor-pointer group flex flex-col justify-between h-full min-h-[230px] border border-white/[0.08] hover:border-dm-indigo/50 hover:shadow-xl hover:shadow-dm-indigo/15 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden">
        {/* Subtle glow background element */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-dm-indigo/10 rounded-full blur-2xl group-hover:bg-dm-indigo/25 transition-all duration-300 pointer-events-none" />

        <div>
          {/* Header Row with Avatar & Title */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dm-indigo/30 to-purple-600/30 border border-dm-indigo/30 flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-inner">
                {initials}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-dm-indigo transition-colors tracking-tight truncate">
                  {companyName}
                </h3>
                <p className="text-xs text-dm-muted truncate">Enterprise Prospect</p>
              </div>
            </div>
            <StageBadge stage={stage} />
          </div>

          {/* Details Stack */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2.5 text-xs text-dm-text font-medium bg-white/[0.03] p-2 rounded-xl border border-white/[0.05]">
              <div className="p-1 rounded-md bg-dm-indigo/15 text-dm-indigo shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-dm-muted">Contact:</span>
              <span className="font-semibold text-white truncate">{contactName}</span>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs bg-emerald-500/[0.05] p-2 rounded-xl border border-emerald-500/15">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Brain className="w-3.5 h-3.5 shrink-0" />
                <span>Calls Remembered:</span>
              </div>
              <span className="font-mono font-bold text-white bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                {interactionCount} calls
              </span>
            </div>

            {lastInteractionAt && (
              <div className="flex items-center justify-between gap-2 text-xs text-dm-muted bg-white/[0.02] p-2 rounded-xl border border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Last Call:</span>
                </div>
                <span className="font-mono text-dm-muted/90">{timeAgo(lastInteractionAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card Action Footer */}
        <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-dm-muted group-hover:text-dm-indigo transition-colors">
          <span>Open Deal Workspace</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform text-dm-indigo" />
        </div>
      </div>
    </Link>
  );
}

