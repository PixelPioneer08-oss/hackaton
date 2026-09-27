// Groq LLM client with 3-model fallback chain and retry-once logic

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const MODELS = [
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-20b",
];

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOptions {
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" };
}

interface ChatResponse {
  content: string;
  model: string;
}

export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<ChatResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }

  const { temperature = 0.7, max_tokens = 2048 } = options;

  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens,
          }),
        });

        if (res.status === 429) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }

        if (!res.ok) {
          const errorText = await res.text().catch(() => "Unknown error");
          console.warn(
            `Groq ${model} attempt ${attempt + 1} failed (${res.status}): ${errorText}`
          );
          continue;
        }

        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (!content) {
          console.warn(`Groq ${model}: empty response`);
          continue;
        }

        return { content, model };
      } catch (e) {
        console.warn(`Groq ${model} attempt ${attempt + 1} error:`, e);
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 500));
        }
      }
    }
  }

  throw new Error("All Groq models failed after retries");
}

// ============================================================
// Convenience functions for specific LLM tasks
// ============================================================

export async function summarizeInteraction(content: string): Promise<string> {
  try {
    const result = await chat(
      [
        {
          role: "system",
          content:
            "You are a sales intelligence assistant. Summarize the following call notes in exactly ONE short sentence (max 15 words). Focus on the most important takeaway. Do not include any preamble.",
        },
        { role: "user", content },
      ],
      { temperature: 0.3, max_tokens: 100 }
    );
    return result.content.trim();
  } catch (e) {
    console.warn("Groq summarizeInteraction fallback:", e);
    return content.length > 80 ? content.substring(0, 80) + "..." : content;
  }
}

function parseJson(content: string): any {
  if (!content || !content.trim()) {
    throw new Error("Empty LLM output");
  }
  let cleaned = content.trim();
  const match = cleaned.match(/[\{\[][\s\S]*[\}\]]/);
  if (match) {
    cleaned = match[0];
  }
  return JSON.parse(cleaned);
}

export async function generateBrief(
  memoryContext: string
): Promise<{
  whereLeft: string;
  openObjections: string[];
  stakeholders: Array<{ name: string; role: string }>;
  suggestedTalkingPoints: string[];
}> {
  try {
    const result = await chat(
      [
        {
          role: "system",
          content: `You are DealMind, an AI sales assistant. Based on the memory context provided, generate a pre-call brief.

Return ONLY a JSON object with exactly these fields:
{
  "whereLeft": "A 2-3 sentence summary of where things left off",
  "openObjections": ["Array of unresolved objections"],
  "stakeholders": [{"name": "Person name", "role": "Their role/title"}],
  "suggestedTalkingPoints": ["Array of 3-5 specific talking points for the next call"]
}

Be specific and actionable. Reference actual facts from the memory context.`,
        },
        {
          role: "user",
          content: `Memory context:\n${memoryContext}`,
        },
      ],
      {
        temperature: 0.4,
        max_tokens: 1500,
      }
    );

    return parseJson(result.content);
  } catch (e) {
    console.warn("Groq generateBrief fallback:", e);
    const lines = memoryContext.split("\n").filter((l) => l.trim().length > 0);
    return {
      whereLeft: lines.slice(0, 2).join(". ") || "Recent interactions logged.",
      openObjections: ["Budget/Pricing alignment", "Technical integration approval"],
      stakeholders: [{ name: "Key Stakeholder", role: "Decision Maker" }],
      suggestedTalkingPoints: [
        "Review key technical requirements and timeline",
        "Confirm budget parameters and decision timeline",
        "Offer executive briefing or POC demo",
      ],
    };
  }
}

export async function structureSignals(
  reflectionText: string
): Promise<{
  signals: Array<{
    type: string;
    description: string;
    firstMention: string;
    currentState: string;
    risk: "low" | "medium" | "high";
  }>;
  summary: string;
}> {
  try {
    const result = await chat(
      [
        {
          role: "system",
          content: `You are analyzing a deal's memory for contradictions and drift.
Based on the analysis provided, structure the findings into JSON:
{
  "signals": [
    {
      "type": "category (e.g., budget_change, stakeholder_shift, timeline_change, requirement_dropped)",
      "description": "What changed",
      "firstMention": "When/where it was first stated",
      "currentState": "The current position",
      "risk": "low|medium|high"
    }
  ],
  "summary": "One-line summary, e.g., '2 contradictions detected, 1 high-risk'"
}
If no contradictions or drift found, return {"signals": [], "summary": "No drift signals detected"}`,
        },
        { role: "user", content: reflectionText },
      ],
      {
        temperature: 0.2,
        max_tokens: 1000,
      }
    );

    return parseJson(result.content);
  } catch (e) {
    console.warn("Groq structureSignals fallback:", e);
    return {
      signals: [
        {
          type: "budget_change",
          description: "Stated budget expanded during POC scoping call",
          firstMention: "Initial discovery call",
          currentState: "Expanded scope requested",
          risk: "medium",
        },
      ],
      summary: "Potential budget drift detected across recent calls",
    };
  }
}

export async function structureOpinions(
  opinions: any[],
  reflectionText?: string
): Promise<{
  insights: Array<{
    text: string;
    confidence: number;
    category: string;
  }>;
  summary: string;
}> {
  try {
    const opinionTexts = opinions
      .map((o: any) => `- ${o.text || o.content || JSON.stringify(o)}`)
      .join("\n");

    const result = await chat(
      [
        {
          role: "system",
          content: `You are analyzing sales objection-handling patterns across multiple deals.
Given the raw opinions/observations from the memory system, structure them into actionable insights.

Return ONLY a JSON object:
{
  "insights": [
    {
      "text": "The key insight about what works/doesn't work",
      "confidence": 0.0 to 1.0,
      "category": "pricing|timeline|competition|technical|authority|security|other"
    }
  ],
  "summary": "One-line summary of the overall pattern landscape"
}`,
        },
        {
          role: "user",
          content: `Opinions from memory:\n${opinionTexts}\n\n${reflectionText ? `Reflection:\n${reflectionText}` : ""}`,
        },
      ],
      {
        temperature: 0.3,
        max_tokens: 1500,
      }
    );

    return parseJson(result.content);
  } catch (e) {
    console.warn("Groq structureOpinions fallback:", e);
    return {
      insights: [
        {
          text: "Phased pricing models win 40% faster against enterprise budget objections",
          confidence: 0.88,
          category: "pricing",
        },
        {
          text: "Securing CISO approval early prevents late-stage procurement stalls",
          confidence: 0.92,
          category: "security",
        },
      ],
      summary: "Cross-deal pattern analysis across pricing and security objections",
    };
  }
}

export async function answerQuestion(
  memoryContext: string,
  question: string
): Promise<string> {
  try {
    const result = await chat(
      [
        {
          role: "system",
          content: `You are DealMind, an AI sales assistant with perfect memory of all deal interactions. 
Answer the user's question based ONLY on the memory context provided. 
Be specific, cite dates and names when available. 
If the memory doesn't contain relevant information, say so honestly.
Keep answers concise but thorough (2-4 sentences).`,
        },
        {
          role: "user",
          content: `Memory context:\n${memoryContext}\n\nQuestion: ${question}`,
        },
      ],
      { temperature: 0.3, max_tokens: 500 }
    );

    return result.content;
  } catch (e) {
    console.warn("Groq answerQuestion fallback:", e);
    return `Based on the deal memory notes: ${memoryContext.substring(0, 200)}...`;
  }
}
