import { NextResponse } from "next/server";
import { getPatternOpinions, reflectPatterns } from "@/lib/hindsight";
import { structureOpinions } from "@/lib/groq";

// GET /api/patterns — Cross-deal objection intelligence (opinion-network-driven)
export async function GET() {
  try {
    // Step 1: Get raw opinions from Hindsight's opinion network
    const opinions = await getPatternOpinions();

    // Step 2: Get a reflection summary from the patterns bank
    let reflectionText: string | undefined;
    try {
      const reflection = await reflectPatterns(
        "What are the most common objection patterns across all deals? " +
        "Which response approaches correlate with deals that moved forward vs. those that stalled or were lost? " +
        "Provide actionable recommendations for handling each type of objection."
      );
      reflectionText = reflection?.text;
    } catch (e) {
      console.warn("Failed to reflect on patterns:", e);
    }

    // Step 3: Structure via Groq for display
    if (opinions.length > 0 || reflectionText) {
      const structured = await structureOpinions(opinions, reflectionText);
      return NextResponse.json({
        ...structured,
        rawOpinionCount: opinions.length,
        status: "ready",
      });
    }

    return NextResponse.json({
      insights: [],
      summary: "No patterns detected yet. Log more interactions across deals to build intelligence.",
      rawOpinionCount: 0,
      status: "no-data",
    });
  } catch (e) {
    console.error("Failed to fetch patterns:", e);
    return NextResponse.json(
      { error: "Failed to fetch patterns" },
      { status: 500 }
    );
  }
}
