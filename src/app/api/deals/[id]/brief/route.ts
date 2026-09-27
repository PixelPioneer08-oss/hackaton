import { NextResponse } from "next/server";
import { reflectMemory } from "@/lib/hindsight";
import { generateBrief } from "@/lib/groq";
import { prisma } from "@/lib/prisma";

// GET /api/deals/[id]/brief — Generate pre-call brief
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params;
  try {
    // Verify deal exists
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { interactions: { orderBy: { createdAt: "desc" }, take: 5 } },
    });
    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    if (deal.interactions.length === 0) {
      return NextResponse.json({
        whereLeft: "No interactions logged yet. Start by logging your first call notes.",
        openObjections: [],
        stakeholders: [],
        suggestedTalkingPoints: [
          "Introduce yourself and DealMind's value proposition",
          "Ask about their current pain points",
          "Identify the key decision makers",
        ],
      });
    }

    // Step 1: Get memory context from Hindsight reflect
    const reflectionPrompt = `Provide a comprehensive summary for a sales rep preparing for their next call with ${deal.contactName} at ${deal.companyName}. 
Include: 
1. Where the conversation last left off
2. Any unresolved objections or concerns
3. All stakeholders mentioned and their roles
4. Key talking points and strategy for the next call
Be specific — cite actual details from the interactions.`;

    const reflection = await reflectMemory(dealId, reflectionPrompt);

    if (reflection?.text) {
      // Step 2: Structure via Groq
      const brief = await generateBrief(reflection.text);
      return NextResponse.json(brief);
    }

    // Fallback: Use raw interaction data if Hindsight is unavailable
    const recentNotes = deal.interactions
      .map((i) => `[${i.createdAt.toISOString().split("T")[0]}] ${i.content}`)
      .join("\n\n");

    const brief = await generateBrief(recentNotes);
    return NextResponse.json(brief);
  } catch (e) {
    console.error("Failed to generate brief:", e);
    return NextResponse.json(
      { error: "Failed to generate brief" },
      { status: 500 }
    );
  }
}
