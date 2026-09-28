import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeMemory, writeSignalsMemory, writePatternMemory } from "@/lib/hindsight";
import { summarizeInteraction } from "@/lib/groq";
import { invalidateDeal } from "@/lib/cache";

// POST /api/deals/[id]/interactions — Log a new interaction
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params;
  try {
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      );
    }

    // Verify deal exists
    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    // Step 1: Generate summary via Groq
    let summary: string | undefined;
    try {
      summary = await summarizeInteraction(content);
    } catch (e) {
      console.warn("Failed to summarize interaction:", e);
      summary = undefined;
    }

    // Step 2: Save interaction to Prisma
    const now = new Date();
    const interaction = await prisma.interaction.create({
      data: {
        dealId,
        content,
        summary,
      },
    });

    // Step 3: Write to all three Hindsight banks with explicit timestamp
    // Per-deal bank (neutral disposition — for briefs, Q&A, understanding)
    writeMemory(dealId, content, { timestamp: now }).catch(() => {});

    // Signals bank (skeptical/literal disposition — for contradiction detection)
    writeSignalsMemory(dealId, content, { timestamp: now }).catch(() => {});

    // Shared patterns bank (for cross-deal opinion network)
    writePatternMemory(content, {
      dealId,
      timestamp: now,
    }).catch(() => {});

    // Invalidate cached insights so next fetch gets fresh data
    invalidateDeal(dealId);

    return NextResponse.json({
      interaction,
      summary: summary || "New interaction logged",
      processingMemory: true,
    });
  } catch (e) {
    console.error("Failed to create interaction:", e);
    return NextResponse.json(
      { error: "Failed to create interaction" },
      { status: 500 }
    );
  }
}
