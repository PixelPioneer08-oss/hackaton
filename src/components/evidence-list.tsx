"use client";
import { useState } from "react";
import { ChevronDown, Database } from "lucide-react";

export function EvidenceList({ items }: { items: { text: string; date?: string }[] }) {
  const [open, setOpen] = useState(true);
  if (!items?.length) return null;

  return (
    <div className="mt-4 border-t border-white/[0.08] pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs font-semibold text-dm-indigo hover:text-white transition-colors cursor-pointer mb-2.5"
      >
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />
        <Database className="h-3.5 w-3.5 text-dm-indigo" />
        <span>Evidence from Hindsight Memory ({items.length})</span>
      </button>

      {open && (
        <div className="space-y-2.5">
          {items.map((e, i) => {
            // Parse main fact vs metadata (e.g. | When: ... | Involving: ...)
            const rawParts = (e.text || "").split(/\s*\|\s*/);
            const mainText = rawParts[0];
            const metaTags = rawParts.slice(1);

            return (
              <div key={i} className="rounded-xl bg-black/40 border border-white/[0.08] p-3 text-xs leading-relaxed space-y-2">
                <div className="flex items-start gap-2.5">
                  {e.date && (
                    <span className="shrink-0 font-mono text-[10px] font-bold text-indigo-300 bg-dm-indigo/25 border border-dm-indigo/40 px-2 py-0.5 rounded-md">
                      {new Date(e.date).toLocaleDateString("en-GB")}
                    </span>
                  )}
                  <p className="text-dm-text/95 font-medium leading-relaxed flex-1">
                    {mainText}
                  </p>
                </div>

                {metaTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/[0.04]">
                    {metaTags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-mono text-dm-muted bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

