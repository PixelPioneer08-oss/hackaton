import { NextResponse } from "next/server";
import { getContactObservation } from "@/lib/hindsight";
import { prisma } from "@/lib/prisma";

// GET /api/deals/[id]/contact — Contact profile from observation network
// Observations are auto-synthesized by Hindsight in the background — free, near-instant
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params;
  try {
    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    const observations = await getContactObservation(dealId, deal.contactName);

    if (observations.length > 0) {
      return NextResponse.json({
        contactName: deal.contactName,
        companyName: deal.companyName,
        observations: observations.map((o: any) => ({
          text: o.text || o.content || "",
          type: o.fact_type || o.type || "observation",
          confidence: o.confidence,
        })),
        status: "ready",
      });
    }

    // No observations yet — either no interactions or still consolidating
    return NextResponse.json({
      contactName: deal.contactName,
      companyName: deal.companyName,
      observations: [],
      status: "no-observations",
    });
  } catch (e) {
    console.error("Failed to get contact profile:", e);
    return NextResponse.json(
      { error: "Failed to get contact profile" },
      { status: 500 }
    );
  }
}
