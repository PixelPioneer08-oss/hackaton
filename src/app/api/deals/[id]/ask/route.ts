import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reflectMemory, getEvidence } from "@/lib/hindsight";
import { chat } from "@/lib/groq";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params;
  const { question, mode = "compare" } = await req.json();
  if (!question?.trim()) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }
  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

  const stateless = async () => {
    try {
      const result = await chat([
        {
          role: "system",
          content:
            "You are a sales assistant with NO record of past calls on this deal. You only know " +
            "the basics provided. If you lack specifics, say so and give general advice. 2-4 sentences.",
        },
        {
          role: "user",
          content: `Deal: ${deal.companyName}. Contact: ${deal.contactName}. Stage: ${deal.stage}.\n\nQuestion: ${question}`,
        },
      ], { temperature: 0.3, max_tokens: 500 });
      return { answer: result.content };
    } catch {
      return { answer: "Unable to generate an answer right now." };
    }
  };

  const withMemory = async () => {
    const reflection = await reflectMemory(dealId, question);
    if (!reflection) {
      return { answer: "Memory is currently unavailable.", evidence: [], degraded: true };
    }
    let answer = reflection.text ?? "No answer available.";
    try {
      const refined = await chat([
        {
          role: "system",
          content: "Rephrase the following into a clear, direct answer to the user's question, in 2-4 sentences. Be specific and cite facts.",
        },
        { role: "user", content: `Question: ${question}\n\nAnalysis: ${reflection.text}` },
      ], { temperature: 0.3, max_tokens: 500 });
      answer = refined.content;
    } catch {}
    const evidence = await getEvidence(dealId, question);
    return { answer, evidence };
  };

  if (mode === "stateless") return NextResponse.json({ stateless: await stateless() });
  if (mode === "memory") return NextResponse.json({ memory: await withMemory() });

  // Default: compare mode — run both in parallel
  const [s, m] = await Promise.all([stateless(), withMemory()]);
  return NextResponse.json({ stateless: s, memory: m });
}
