import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/deals/[id] — Fetch deal with all interactions
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        interactions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json(deal);
  } catch (e) {
    console.error("Failed to fetch deal:", e);
    return NextResponse.json({ error: "Failed to fetch deal" }, { status: 500 });
  }
}

// PATCH /api/deals/[id] — Update deal stage/outcome
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { stage } = body;

    const deal = await prisma.deal.update({
      where: { id },
      data: { ...(stage ? { stage } : {}) },
    });

    return NextResponse.json(deal);
  } catch (e) {
    console.error("Failed to update deal:", e);
    return NextResponse.json({ error: "Failed to update deal" }, { status: 500 });
  }
}
