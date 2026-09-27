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
      <div className="glass-card p-6 hover:bg-dm-card-hover glow-indigo-hover transition-all duration-300 cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-dm-text group-hover:text-white transition-colors">
            {companyName}
          </h3>
          <StageBadge stage={stage} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-dm-muted">
            <User className="w-3.5 h-3.5" />
            {contactName}
          </div>
          <div className="flex items-center gap-2 text-sm text-dm-muted">
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="font-mono text-xs">{interactionCount} interactions</span>
          </div>
          {lastInteractionAt && (
            <div className="flex items-center gap-2 text-sm text-dm-muted">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono text-xs">Last: {timeAgo(lastInteractionAt)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
