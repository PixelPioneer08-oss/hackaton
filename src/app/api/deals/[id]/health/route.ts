import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBrief, getSignals } from "@/lib/deal-insights";
import { computeHealth } from "@/lib/health";
import { cached } from "@/lib/cache";
import { chat } from "@/lib/groq";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: { interactions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

  const [brief, signals] = await Promise.all([getBrief(id), getSignals(id)]);
  const partial = !!(brief.degraded || signals.degraded);

  const last = deal.interactions[0]?.createdAt;
  const daysSinceLastContact = last
    ? Math.floor((Date.now() - new Date(last).getTime()) / 86_400_000)
    : null;

  const health = computeHealth({
    daysSinceLastContact,
    stage: deal.stage,
    openObjections: brief.openObjections?.length ?? 0,
    signals: signals.signals ?? [],
    stakeholderCount: brief.stakeholders?.length ?? 0,
  });

  const summary = await cached(
    `${id}:health-summary:${health.score}`,
    300_000,
    async () => {
      try {
        const result = await chat(
          [
            {
              role: "system",
              content:
                "Write ONE sentence (max 25 words) telling a sales rep what most affects this deal's health. " +
                "Use only the factors given. Do not invent facts.",
            },
            {
              role: "user",
              content: `Score ${health.score}/100 (${health.verdict}). Factors: ${health.factors
                .map((f) => `${f.label} ${f.value}/${f.max} (${f.note})`)
                .join("; ")}`,
            },
          ],
          { temperature: 0.3, max_tokens: 100 }
        );
        return result.content;
      } catch {
        return `Deal health is ${health.verdict.toLowerCase()} at ${health.score}/100.`;
      }
    }
  );

  return NextResponse.json({ ...health, summary, partial });
}
