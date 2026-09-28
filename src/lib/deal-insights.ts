import { cached } from "./cache";
import { reflectMemory } from "./hindsight";
import { reflectSignals } from "./hindsight";
import { chatJSON } from "./groq";

export interface Brief {
  whereLeft: string;
  openObjections: string[];
  stakeholders: { name: string; role: string }[];
  suggestedTalkingPoints: string[];
  degraded?: boolean;
}

export interface Signal {
  type: string;
  description: string;
  firstMention: string;
  currentState: string;
  risk: "low" | "medium" | "high";
}
export interface SignalsResult {
  signals: Signal[];
  summary: string;
  degraded?: boolean;
}

export const getBrief = (dealId: string) =>
  cached<Brief>(`${dealId}:brief`, 60_000, async () => {
    const reflection = await reflectMemory(
      dealId,
      "Prepare a pre-call brief for this deal: where things left off, open objections, " +
        "stakeholders mentioned with their roles, and suggested talking points for the next call."
    );
    if (!reflection) {
      return { whereLeft: "", openObjections: [], stakeholders: [], suggestedTalkingPoints: [], degraded: true };
    }
    try {
      return await chatJSON<Brief>([
        {
          role: "system",
          content:
            "Convert the following sales deal analysis into strict JSON with exactly these keys: " +
            "whereLeft (string), openObjections (string array), stakeholders (array of {name, role}), " +
            "suggestedTalkingPoints (string array). Return ONLY the JSON object.",
        },
        { role: "user", content: reflection.text ?? JSON.stringify(reflection) },
      ]);
    } catch {
      return {
        whereLeft: reflection.text ?? "",
        openObjections: [],
        stakeholders: [],
        suggestedTalkingPoints: [],
      };
    }
  });

export const getSignals = (dealId: string) =>
  cached<SignalsResult>(`${dealId}:signals`, 60_000, async () => {
    const reflection = await reflectSignals(
      dealId,
      "Read through this deal's history with a skeptical eye. Has anything changed or " +
        "contradicted an earlier statement — budget, timeline, stakeholders, requirements? For " +
        "each one, note what was said first, what's said now, and how serious a concern it is. " +
        "Don't assume good faith — flag anything inconsistent even if it might have an innocent explanation."
    );
    if (!reflection) return { signals: [], summary: "Memory unavailable", degraded: true };
    try {
      return await chatJSON<SignalsResult>([
        {
          role: "system",
          content:
            'Convert the following analysis into strict JSON: { "signals": [{"type", "description", ' +
            '"firstMention", "currentState", "risk": "low"|"medium"|"high"}], "summary": string }. ' +
            "If no contradictions are found, return an empty signals array and say so in summary. Return ONLY the JSON.",
        },
        { role: "user", content: reflection.text ?? JSON.stringify(reflection) },
      ]);
    } catch {
      return { signals: [], summary: reflection.text ?? "Unable to structure." };
    }
  });
