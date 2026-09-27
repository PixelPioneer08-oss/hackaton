import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  setupDealBank,
  setupSignalsBank,
  writeMemory,
  writeSignalsMemory,
  writePatternMemory,
  initDealUnderstanding,
} from "@/lib/hindsight";
import { summarizeInteraction } from "@/lib/groq";

// GET /api/deals — List all deals with latest interaction date
export async function GET() {
  try {
    const deals = await prisma.deal.findMany({
      include: {
        interactions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
        _count: { select: { interactions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const dealsWithMeta = deals.map((deal) => ({
      id: deal.id,
      companyName: deal.companyName,
      contactName: deal.contactName,
      stage: deal.stage,
      createdAt: deal.createdAt,
      lastInteractionAt: deal.interactions[0]?.createdAt || null,
      interactionCount: deal._count.interactions,
    }));

    return NextResponse.json(dealsWithMeta);
  } catch (e) {
    console.error("Failed to fetch deals:", e);
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 });
  }
}

// POST /api/deals — Create a new deal
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyName, contactName, stage, firstNote } = body;

    if (!companyName || !contactName || !stage) {
      return NextResponse.json(
        { error: "companyName, contactName, and stage are required" },
        { status: 400 }
      );
    }

    // Create deal in DB
    const deal = await prisma.deal.create({
      data: { companyName, contactName, stage },
    });

    // Setup all three Hindsight banks (non-blocking)
    setupDealBank(deal.id, companyName).catch(() => {});
    setupSignalsBank(deal.id, companyName).catch(() => {});

    // Initialize mental model (background job)
    initDealUnderstanding(deal.id).catch(() => {});

    // If first note provided, create the interaction
    if (firstNote && firstNote.trim()) {
      let summary: string | undefined;
      try {
        summary = await summarizeInteraction(firstNote);
      } catch {
        summary = undefined;
      }

      const now = new Date();
      await prisma.interaction.create({
        data: {
          dealId: deal.id,
          content: firstNote,
          summary,
        },
      });

      // Write to all three Hindsight banks with timestamp
      writeMemory(deal.id, firstNote, { timestamp: now }).catch(() => {});
      writeSignalsMemory(deal.id, firstNote, { timestamp: now }).catch(() => {});
      writePatternMemory(firstNote, { dealId: deal.id, timestamp: now }).catch(() => {});
    }

    return NextResponse.json(deal, { status: 201 });
  } catch (e) {
    console.error("Failed to create deal:", e);
    return NextResponse.json({ error: "Failed to create deal" }, { status: 500 });
  }
}
