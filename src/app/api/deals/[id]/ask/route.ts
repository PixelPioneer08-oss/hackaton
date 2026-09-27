import { NextResponse } from "next/server";
import { queryMemory, reflectMemory } from "@/lib/hindsight";
import { answerQuestion } from "@/lib/groq";
import { prisma } from "@/lib/prisma";

// POST /api/deals/[id]/ask — Free-form Q&A against deal memory
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params;
  try {
    const body = await request.json();
    const { question } = body;

    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 }
      );
    }

    // Verify deal exists
    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    // Try Hindsight reflect first (best quality)
    const reflection = await reflectMemory(dealId, question);
    if (reflection?.text) {
      return NextResponse.json({
        answer: reflection.text,
        sources: reflection.based_on?.memories?.length || 0,
        method: "hindsight-reflect",
      });
    }

    // Fallback: recall from Hindsight
    const recalled = await queryMemory(dealId, question);
    const factsList = recalled?.results || recalled?.facts || [];
    if (factsList.length > 0) {
      const memoryContext = factsList
        .map((f: any) => f.text || f.content || JSON.stringify(f))
        .join("\n");
      const answer = await answerQuestion(memoryContext, question);
      return NextResponse.json({
        answer,
        sources: factsList.length,
        method: "hindsight-recall+groq",
      });
    }

    // Final fallback: use raw interactions from DB
    const interactions = await prisma.interaction.findMany({
      where: { dealId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    if (interactions.length === 0) {
      return NextResponse.json({
        answer:
          "No interactions have been logged for this deal yet. Start by logging your first call notes!",
        sources: 0,
        method: "none",
      });
    }

    const rawContext = interactions
      .map((i) => `[${i.createdAt.toISOString().split("T")[0]}] ${i.content}`)
      .join("\n\n");

    const answer = await answerQuestion(rawContext, question);
    return NextResponse.json({
      answer,
      sources: interactions.length,
      method: "db-fallback",
    });
  } catch (e) {
    console.error("Failed to answer question:", e);
    return NextResponse.json(
      { error: "Failed to process question" },
      { status: 500 }
    );
  }
}
