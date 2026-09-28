import { NextRequest, NextResponse } from "next/server";
import { reflectMemory } from "@/lib/hindsight";
import { chatJSON } from "@/lib/groq";
import { cached } from "@/lib/cache";

interface CompetitorResult {
  competitors: { name: string; context: string; firstMentioned: string }[];
  degraded?: boolean;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await cached<CompetitorResult>(`${id}:competitors`, 60_000, async () => {
    const reflection = await reflectMemory(
      id,
      "Which competitors or alternative vendors has this prospect mentioned? For each, say what " +
        "the prospect said about them and roughly when it first came up."
    );
    if (!reflection) return { competitors: [], degraded: true };
    try {
      return await chatJSON<CompetitorResult>([
        {
          role: "system",
          content:
            'Convert this into strict JSON: { "competitors": [{"name", "context" (one sentence), ' +
            '"firstMentioned" (short date or call description)}] }. If none are mentioned, return ' +
            '{ "competitors": [] }. Return ONLY the JSON object.',
        },
        { role: "user", content: reflection.text ?? JSON.stringify(reflection) },
      ]);
    } catch {
      return { competitors: [] };
    }
  });
  return NextResponse.json(result);
}
