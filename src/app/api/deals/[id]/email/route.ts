import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateEmailDraft } from "@/lib/groq";
import { queryMemory } from "@/lib/hindsight";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: { interactions: { orderBy: { createdAt: "desc" } } },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    let memoryText = "";

    try {
      const recalled = await queryMemory(params.id, "follow up next steps budget objections decision makers");
      if (recalled && Array.isArray(recalled.memories)) {
        memoryText = recalled.memories.map((m: any) => m.text || m.content).join("\n");
      }
    } catch (e) {
      console.warn("Hindsight recall fallback for email:", e);
    }

    if (!memoryText && deal.interactions.length > 0) {
      memoryText = deal.interactions.map((i: any) => i.content).join("\n");
    }

    const draft = await generateEmailDraft(
      deal.companyName,
      deal.contactName,
      memoryText || "Initial deal setup"
    );

    const emailDomain = deal.companyName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";
    const firstName = deal.contactName.toLowerCase().replace(/\s+/g, ".");
    const recipientEmail = `${firstName}@${emailDomain}`;

    return NextResponse.json({
      recipient: `${deal.contactName} <${recipientEmail}>`,
      subject: draft.subject,
      body: draft.body,
      keyPointsAddressed: draft.keyPointsAddressed,
    });
  } catch (e) {
    console.error("Failed to generate email draft:", e);
    return NextResponse.json(
      { error: "Failed to generate email draft" },
      { status: 500 }
    );
  }
}
