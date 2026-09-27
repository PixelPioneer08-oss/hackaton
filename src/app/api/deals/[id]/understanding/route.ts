import { NextResponse } from "next/server";
import { getDealUnderstanding, reflectMemory } from "@/lib/hindsight";
import { prisma } from "@/lib/prisma";

// GET /api/deals/[id]/understanding — Mental Model panel data
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params;
  try {
    // Verify deal exists and check interaction count
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { _count: { select: { interactions: true } } },
    });
    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    // Distinguish "no interactions logged" from "still computing"
    if (deal._count.interactions === 0) {
      return NextResponse.json({
        status: "no-interactions",
        content: null,
        message: "Log your first interaction to start building deal understanding.",
      });
    }

    // Try fetching mental model from Hindsight
    const understanding = await getDealUnderstanding(dealId);

    if (understanding && understanding.hasData && understanding.content) {
      return NextResponse.json({
        status: "ready",
        content: understanding.content,
        lastUpdated: understanding.lastUpdated,
        isStale: understanding.isStale,
      });
    }

    // Fallback: If Mental Model is still generating on Hindsight cloud, run a live reflection synthesis
    const reflectionPrompt = `Synthesize a concise prospect profile and deal understanding for ${deal.companyName}. Include key stakeholders, primary pain points, budget/pricing status, objections, and deal progress.`;
    const reflection = await reflectMemory(dealId, reflectionPrompt);

    if (reflection?.text) {
      return NextResponse.json({
        status: "ready",
        content: reflection.text,
        lastUpdated: new Date().toISOString(),
        isStale: false,
      });
    }

    // Mental model exists but hasn't finished computing yet
    return NextResponse.json({
      status: "building",
      content: null,
      message: "DealMind is building its understanding of this deal...",
    });
  } catch (e) {
    console.error("Failed to get deal understanding:", e);
    return NextResponse.json(
      { error: "Failed to get understanding" },
      { status: 500 }
    );
  }
}
