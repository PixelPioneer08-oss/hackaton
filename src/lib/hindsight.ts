import { HindsightClient } from "@vectorize-io/hindsight-client";

// --- Client Initialization ---
const client = new HindsightClient({
  baseUrl: process.env.HINDSIGHT_BASE_URL || "https://api.hindsight.vectorize.io",
  apiKey: process.env.HINDSIGHT_API_TOKEN,
});

// --- Health Check with TTL (45s, not permanent) ---
let memoryEnabled: boolean | null = null;
let lastChecked = 0;
const HEALTH_TTL_MS = 45_000;

export async function checkMemoryHealth(): Promise<boolean> {
  const now = Date.now();
  if (memoryEnabled !== null && now - lastChecked < HEALTH_TTL_MS) {
    return memoryEnabled;
  }
  try {
    await client.getVersion();
    memoryEnabled = true;
  } catch (e) {
    console.warn("⚠ Hindsight unreachable — running in degraded mode", e);
    memoryEnabled = false;
  }
  lastChecked = now;
  return memoryEnabled;
}

export function isMemoryEnabled(): boolean {
  return memoryEnabled === true;
}

// Force a recheck (for the manual retry button in the "Memory offline" banner)
export async function resetHealthCheck(): Promise<boolean> {
  memoryEnabled = null;
  lastChecked = 0;
  return checkMemoryHealth();
}

// ============================================================
// BANK SETUP
// ============================================================

// Standard per-deal bank: neutral disposition, used for brief/ask/understanding/contact.
export async function setupDealBank(
  dealId: string,
  companyName: string
): Promise<any> {
  if (!(await checkMemoryHealth())) return null;
  try {
    return await client.createBank(`deal-${dealId}`, {
      name: companyName,
      mission:
        "Track sales interactions for this deal: pricing objections, competitor mentions, " +
        "stakeholder names and roles, timeline commitments, and buying signals.",
      disposition: { skepticism: 3, literalism: 3, empathy: 3 },
    });
  } catch (e: any) {
    // Ignore "already exists" — treat as idempotent setup
    console.warn(`Bank setup skipped/exists for deal-${dealId}`);
    return null;
  }
}

// Signals bank: same content, deliberately skeptical/literal disposition.
// Per the Hindsight paper, these parameters bias reflect() toward 
// "reluctance to accept unsupported statements" and "close attention to exact wording" —
// architecturally suited to contradiction detection.
export async function setupSignalsBank(
  dealId: string,
  companyName: string
): Promise<any> {
  if (!(await checkMemoryHealth())) return null;
  try {
    return await client.createBank(`deal-${dealId}-signals`, {
      name: `${companyName} (signals)`,
      mission:
        "Track the same sales interactions, but reason about them with maximum scrutiny. " +
        "Focus on detecting contradictions, changed positions, and drift from earlier statements.",
      disposition: { skepticism: 5, literalism: 5, empathy: 1 },
    });
  } catch {
    return null;
  }
}

// Shared bank for cross-deal objection intelligence — opinions form and reinforce here.
export async function setupPatternsBank(): Promise<any> {
  if (!(await checkMemoryHealth())) return null;
  try {
    return await client.createBank("org-sales-patterns", {
      name: "Sales Org Patterns",
      mission:
        "Track objections raised across all deals and which response approaches correlate with " +
        "deals that progressed vs. stalled or were lost. Form and reinforce opinions about which " +
        "objection-handling approaches actually work.",
      disposition: { skepticism: 4, literalism: 2, empathy: 2 },
    });
  } catch {
    return null;
  }
}

// ============================================================
// RETAIN (Write Memory)
// ============================================================

export async function writeMemory(
  dealId: string,
  content: string,
  opts: { timestamp?: Date | string; context?: string } = {}
): Promise<any> {
  if (!(await checkMemoryHealth())) return null;
  try {
    return await client.retain(`deal-${dealId}`, content, {
      timestamp: opts.timestamp,
      context: opts.context,
      metadata: { dealId },
    });
  } catch (e) {
    console.error(`⚠ Failed to write memory to deal-${dealId}:`, e);
    return null;
  }
}

export async function writeSignalsMemory(
  dealId: string,
  content: string,
  opts: { timestamp?: Date | string } = {}
): Promise<any> {
  if (!(await checkMemoryHealth())) return null;
  try {
    return await client.retain(`deal-${dealId}-signals`, content, {
      timestamp: opts.timestamp,
      metadata: { dealId },
    });
  } catch (e) {
    console.error(`⚠ Failed to write to signals bank deal-${dealId}-signals:`, e);
    return null;
  }
}

export async function writePatternMemory(
  content: string,
  opts: { dealId: string; timestamp?: Date | string }
): Promise<any> {
  if (!(await checkMemoryHealth())) return null;
  try {
    return await client.retain("org-sales-patterns", content, {
      timestamp: opts.timestamp,
      metadata: { dealId: opts.dealId },
    });
  } catch (e) {
    console.error("⚠ Failed to write to patterns bank:", e);
    return null;
  }
}

// ============================================================
// RECALL / REFLECT
// ============================================================

export async function queryMemory(
  dealId: string,
  question: string
): Promise<any | null> {
  if (!(await checkMemoryHealth())) return null;
  try {
    return await client.recall(`deal-${dealId}`, question, {
      budget: "mid",
      maxTokens: 4096,
    });
  } catch (e: any) {
    if (e?.message?.includes("not found")) {
      console.log(`Bank deal-${dealId} not found, auto-creating...`);
      await setupDealBank(dealId, "Deal");
      try {
        return await client.recall(`deal-${dealId}`, question, { budget: "mid", maxTokens: 4096 });
      } catch { return null; }
    }
    console.error(`⚠ Failed to recall from deal-${dealId}:`, e);
    return null;
  }
}

export async function reflectMemory(
  dealId: string,
  question: string
): Promise<any | null> {
  if (!(await checkMemoryHealth())) return null;
  try {
    return await client.reflect(`deal-${dealId}`, question, {
      budget: "high",
    });
  } catch (e: any) {
    if (e?.message?.includes("not found")) {
      console.log(`Bank deal-${dealId} not found, auto-creating...`);
      await setupDealBank(dealId, "Deal");
      try {
        return await client.reflect(`deal-${dealId}`, question, { budget: "high" });
      } catch { return null; }
    }
    console.error(`⚠ Failed to reflect on deal-${dealId}:`, e);
    return null;
  }
}

// Signals-specific reflect: runs against the skeptical/literal bank
export async function reflectSignals(
  dealId: string,
  question: string
): Promise<any | null> {
  if (!(await checkMemoryHealth())) return null;
  try {
    return await client.reflect(`deal-${dealId}-signals`, question, {
      budget: "high",
    });
  } catch (e: any) {
    if (e?.message?.includes("not found")) {
      console.log(`Signals bank deal-${dealId}-signals not found, auto-creating...`);
      await setupSignalsBank(dealId, "Deal");
      try {
        return await client.reflect(`deal-${dealId}-signals`, question, { budget: "high" });
      } catch { return null; }
    }
    console.error(`⚠ Failed to reflect on signals bank:`, e);
    return null;
  }
}

export async function reflectPatterns(
  question: string
): Promise<any | null> {
  if (!(await checkMemoryHealth())) return null;
  try {
    return await client.reflect("org-sales-patterns", question, {
      budget: "high",
    });
  } catch (e: any) {
    if (e?.message?.includes("not found")) {
      await setupPatternsBank();
      try {
        return await client.reflect("org-sales-patterns", question, { budget: "high" });
      } catch { return null; }
    }
    console.error("⚠ Failed to reflect on patterns bank:", e);
    return null;
  }
}

// ============================================================
// OBSERVATION NETWORK — free, auto-synthesized entity profiles
// ============================================================

export async function getContactObservation(
  dealId: string,
  contactName: string
): Promise<any[]> {
  if (!(await checkMemoryHealth())) return [];
  try {
    const result = await client.recall(`deal-${dealId}`, contactName, {
      types: ["observation"],
      budget: "low",
    });
    return result?.results ?? (result as any)?.facts ?? [];
  } catch (e: any) {
    if (e?.message?.includes("not found")) {
      console.log(`Bank deal-${dealId} not found, auto-creating...`);
      await setupDealBank(dealId, "Deal");
      try {
        const result = await client.recall(`deal-${dealId}`, contactName, {
          types: ["observation"],
          budget: "low",
        });
        return result?.results ?? (result as any)?.facts ?? [];
      } catch { return []; }
    }
    console.error(`⚠ Failed to get contact observation:`, e);
    return [];
  }
}

// ============================================================
// OPINION NETWORK — cross-deal objection handling intelligence
// ============================================================

export async function getPatternOpinions(): Promise<any[]> {
  if (!(await checkMemoryHealth())) return [];
  try {
    const result = await client.recall(
      "org-sales-patterns",
      "objection handling approaches and their effectiveness",
      {
        types: ["opinion"],
        budget: "high",
      }
    );
    return result?.results ?? (result as any)?.facts ?? [];
  } catch (e) {
    console.error("⚠ Failed to get pattern opinions:", e);
    return [];
  }
}

// ============================================================
// MENTAL MODELS
// ============================================================

export async function initDealUnderstanding(dealId: string): Promise<any> {
  if (!(await checkMemoryHealth())) return null;
  try {
    return await client.createMentalModel(`deal-${dealId}`, "deal-understanding",
      "What do we know about this prospect's profile, priorities, buying signals, key " +
      "stakeholders, objections raised, competitors mentioned, and preferred communication style? " +
      "Synthesize into a concise prospect profile.",
      { tags: ["auto-generated"] }
    );
  } catch (e: any) {
    // Ignore if already exists
    if (!e?.message?.includes("already exists") && !e?.message?.includes("409")) {
      console.warn(`⚠ Failed to create mental model for deal-${dealId}:`, e?.message);
    }
    return null;
  }
}

export async function getDealUnderstanding(
  dealId: string
): Promise<{ building: boolean; hasData: boolean; content?: string; lastUpdated?: string; isStale?: boolean }> {
  if (!(await checkMemoryHealth())) return { building: false, hasData: false };
  try {
    const models = await client.listMentalModels(`deal-${dealId}`, {
      detail: "content",
    });
    const model = models?.items?.find((m: any) => m.name === "deal-understanding");
    if (!model) {
      initDealUnderstanding(dealId).catch(() => {});
      return { building: true, hasData: false }; // creation in flight
    }
    if (!model.content || model.content.trim().startsWith("Generating content")) {
      return { building: true, hasData: false }; // computing
    }
    return {
      building: false,
      hasData: true,
      content: model.content,
      lastUpdated: model.last_refreshed_at || model.created_at || "",
      isStale: model.is_stale || false,
    };
  } catch (e) {
    console.error(`⚠ Failed to get mental model for deal-${dealId}:`, e);
    return { building: false, hasData: false };
  }
}

export interface Evidence {
  text: string;
  date?: string;
}

export async function getEvidence(dealId: string, query: string, limit = 5): Promise<Evidence[]> {
  const res = await queryMemory(dealId, query);
  const items: any[] = (res as any)?.results ?? [];
  return items
    .slice(0, limit)
    .map((r) => ({
      text: r.text ?? r.content ?? "",
      date: r.occurred_start ?? r.mentioned_at ?? r.timestamp ?? undefined,
    }))
    .filter((e) => e.text);
}
