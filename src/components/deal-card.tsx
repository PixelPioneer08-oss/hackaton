import Link from "next/link";
import { StageBadge } from "./stage-badge";
import { Clock, User, MessageSquare } from "lucide-react";

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
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export function DealCard({ id, companyName, contactName, stage, lastInteractionAt, interactionCount }: DealCardProps) {
  return (
    <Link href={`/deals/${id}`}>
      <div className="glass-card glass-card-hover p-6 sm:p-7 cursor-pointer group flex flex-col justify-between h-full min-h-[220px]">
        <div>
          <div className="flex items-center justify-between gap-3 mb-5">
            <h3 className="text-xl font-extrabold text-white group-hover:text-dm-indigo transition-colors tracking-tight truncate">
              {companyName}
            </h3>
            <StageBadge stage={stage} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-sm text-dm-text font-medium">
              <div className="p-1.5 rounded-lg bg-dm-indigo/10 text-dm-indigo border border-dm-indigo/20 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <span className="font-semibold text-white">{contactName}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-dm-muted">
              <div className="p-1.5 rounded-lg bg-white/5 text-dm-muted shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="font-mono text-xs">{interactionCount} interactions logged</span>
            </div>
            {lastInteractionAt && (
              <div className="flex items-center gap-2.5 text-sm text-dm-muted">
                <div className="p-1.5 rounded-lg bg-white/5 text-dm-muted shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="font-mono text-xs">Last call: {timeAgo(lastInteractionAt)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-dm-muted group-hover:text-dm-indigo transition-colors">
          <span className="font-semibold">Open Deal Workspace</span>
          <span className="font-bold text-sm">→</span>
        </div>
      </div>
    </Link>
  );
}
