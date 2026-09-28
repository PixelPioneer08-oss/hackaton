import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSignals } from "@/lib/deal-insights";
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
      include: { _count: { select: { interactions: true } } },
    });
    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

    if (deal._count.interactions < 2) {
      return NextResponse.json({
        signals: [],
        summary: "Need at least 2 interactions to detect drift patterns.",
        status: "insufficient-data",
        evidence: [],
      });
    }

    const fresh = new URL(req.url).searchParams.get("fresh") === "1";
    if (fresh) invalidateDeal(dealId);

    const [signalsResult, evidence] = await Promise.all([
      getSignals(dealId),
      getEvidence(dealId, "budget timeline stakeholders requirements changes"),
    ]);

    return NextResponse.json({ ...signalsResult, status: "analyzed", evidence });
  } catch (e) {
    console.error("Failed to detect drift signals:", e);
    return NextResponse.json({ error: "Failed to analyze signals" }, { status: 500 });
  }
}
