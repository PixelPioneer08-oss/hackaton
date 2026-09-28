import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBrief } from "@/lib/deal-insights";
import { getEvidence } from "@/lib/hindsight";
import { invalidateDeal } from "@/lib/cache";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params;
  try {
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { interactions: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

    if (deal.interactions.length === 0) {
      return NextResponse.json({
        whereLeft: "No interactions logged yet. Start by logging your first call notes.",
        openObjections: [],
        stakeholders: [],
        suggestedTalkingPoints: [
          "Introduce yourself and the value proposition",
          "Ask about their current pain points",
          "Identify the key decision makers",
        ],
        evidence: [],
      });
    }

    const fresh = new URL(req.url).searchParams.get("fresh") === "1";
    if (fresh) invalidateDeal(dealId);

    const [brief, evidence] = await Promise.all([
      getBrief(dealId),
      getEvidence(dealId, "objections, stakeholders, and next steps"),
    ]);

    return NextResponse.json({ ...brief, evidence });
  } catch (e) {
    console.error("Failed to generate brief:", e);
    return NextResponse.json({ error: "Failed to generate brief" }, { status: 500 });
  }
}
