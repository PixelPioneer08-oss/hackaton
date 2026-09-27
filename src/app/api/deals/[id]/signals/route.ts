import { NextResponse } from "next/server";
import { reflectSignals } from "@/lib/hindsight";
import { structureSignals } from "@/lib/groq";
import { prisma } from "@/lib/prisma";

// GET /api/deals/[id]/signals — Contradiction/drift detection
// Uses the skeptical/literal signals bank for disposition-tuned reasoning
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params;
  try {
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { _count: { select: { interactions: true } } },
    });
    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    if (deal._count.interactions < 2) {
      return NextResponse.json({
        signals: [],
        summary: "Need at least 2 interactions to detect drift patterns.",
        status: "insufficient-data",
      });
    }

    // Step 1: Reflect against the skeptical/literal signals bank
    const driftPrompt = `Analyze all memories in this deal for contradictions, changed positions, or drift from earlier statements.

Look specifically for:
- Budget or pricing figures that changed between interactions
- Stakeholders who appeared or disappeared from the conversation
- Timeline or deadline shifts
- Requirements that were stated initially but later dropped or changed
- Decision criteria that evolved
- Competitor mentions that appeared or changed

For each signal found, note:
1. What specifically changed
2. When it was first mentioned (cite the date/interaction)
3. What the current stated position is
4. How risky this drift is for the deal

If nothing contradictory is found, say so clearly.`;

    const reflection = await reflectSignals(dealId, driftPrompt);

    if (reflection?.text) {
      // Step 2: Structure via Groq (reflect returns freeform text, not JSON)
      const structured = await structureSignals(reflection.text);
      return NextResponse.json({ ...structured, status: "analyzed" });
    }

    // Fallback: raw DB analysis via Groq
    const interactions = await prisma.interaction.findMany({
      where: { dealId },
      orderBy: { createdAt: "asc" },
    });

    const rawContext = interactions
      .map((i) => `[${i.createdAt.toISOString().split("T")[0]}] ${i.content}`)
      .join("\n\n");

    const structured = await structureSignals(`Interactions timeline:\n${rawContext}`);
    return NextResponse.json({ ...structured, status: "analyzed-fallback" });
  } catch (e) {
    console.error("Failed to detect drift signals:", e);
    return NextResponse.json({ error: "Failed to analyze signals" }, { status: 500 });
  }
}
