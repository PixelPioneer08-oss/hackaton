export interface HealthInput {
  daysSinceLastContact: number | null;
  stage: string;
  openObjections: number;
  signals: { risk: "low" | "medium" | "high" }[];
  stakeholderCount: number;
}

export interface HealthFactor {
  label: string;
  value: number;
  max: number;
  note: string;
}

export interface HealthResult {
  score: number;
  verdict: "Strong" | "At Risk" | "Critical";
  factors: HealthFactor[];
}

const STAGE_SCORE: Record<string, number> = {
  "Prospecting": 6,
  "Discovery": 10,
  "Demo": 15,
  "Proposal": 18,
  "Negotiation": 22,
  "Closed-Won": 25,
  "Closed-Lost": 0,
};

export function computeHealth(i: HealthInput): HealthResult {
  const d = i.daysSinceLastContact;
  const engagement =
    d === null ? 0 : d <= 3 ? 25 : d <= 7 ? 20 : d <= 14 ? 12 : d <= 30 ? 6 : 0;

  const momentum = STAGE_SCORE[i.stage] ?? 10;

  const high = i.signals.filter((s) => s.risk === "high").length;
  const med = i.signals.filter((s) => s.risk === "medium").length;
  const low = i.signals.filter((s) => s.risk === "low").length;
  const riskPenalty = i.openObjections * 5 + high * 8 + med * 4 + low * 1;
  const risk = Math.max(0, 25 - riskPenalty);

  const stakeholders = [5, 12, 19, 25][Math.min(i.stakeholderCount, 3)];

  const score = Math.min(100, engagement + momentum + risk + stakeholders);
  const verdict: "Strong" | "At Risk" | "Critical" = score >= 70 ? "Strong" : score >= 40 ? "At Risk" : "Critical";

  return {
    score,
    verdict,
    factors: [
      {
        label: "Engagement",
        value: engagement,
        max: 25,
        note: d === null ? "No contact recorded" : `Last contact ${d} day(s) ago`,
      },
      { label: "Momentum", value: momentum, max: 25, note: `Stage: ${i.stage}` },
      {
        label: "Risk",
        value: risk,
        max: 25,
        note: `${i.openObjections} open objection(s), ${high} high-risk signal(s)`,
      },
      {
        label: "Stakeholders",
        value: stakeholders,
        max: 25,
        note: `${i.stakeholderCount} stakeholder(s) identified`,
      },
    ],
  };
}
