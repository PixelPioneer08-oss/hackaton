import { PrismaClient } from "@prisma/client";

// Dynamic import to avoid build errors if hindsight env vars aren't set
async function getHindsight() {
  return await import("../src/lib/hindsight");
}

const prisma = new PrismaClient();
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return d;
};

const NOTES = [
  {
    offset: 42,
    content:
      "First discovery call with Sarah Chen, VP Procurement. Budget is around $50K, and finance is concerned about the cost relative to their current vendor spend. Also evaluating AcmeCRM as an alternative.",
    summary: "Discovery call: $50K budget, evaluating AcmeCRM",
  },
  {
    offset: 35,
    content:
      "Sarah mentioned they're also evaluating AcmeCRM as an alternative. She said our onboarding process looked faster in the demo. CTO James Liu wants to see a technical deep-dive.",
    summary: "AcmeCRM comparison, CTO wants deep-dive",
  },
  {
    offset: 28,
    content:
      "Sarah wants implementation completed within 30 days of signing — she has an internal deadline tied to their Q4 planning cycle. CFO David Park is now involved for anything over $30K.",
    summary: "30-day implementation deadline, CFO involved",
  },
  {
    offset: 21,
    content:
      "Finance flagged that ROI needs to be demonstrated in the proposal before they'll approve — Sarah asked for a case study from a similar-sized logistics company. SOC2 compliance review underway.",
    summary: "ROI proof needed, SOC2 review in progress",
  },
  {
    offset: 10,
    content:
      "Sarah called to say $80K has been approved for the project — budget isn't the blocker anymore, and she wants to move to contract terms. SOC2 cleared. AcmeCRM quoted $65K but with limited API access.",
    summary: "Budget increased to $80K, SOC2 cleared, AcmeCRM at $65K",
  },
];

async function main() {
  const label = new Date().toISOString().slice(11, 16); // HH:MM for uniqueness
  const companyName = `Northwind Logistics (rehearsal ${label})`;

  console.log(`\n🧠 DealBook Demo Rehearsal Script`);
  console.log(`================================\n`);
  console.log(`Creating deal: ${companyName}`);

  const deal = await prisma.deal.create({
    data: {
      companyName,
      contactName: "Sarah Chen",
      stage: "Negotiation",
    },
  });

  // Create interactions in Prisma
  for (const n of NOTES) {
    await prisma.interaction.create({
      data: {
        dealId: deal.id,
        content: n.content,
        summary: n.summary,
        createdAt: daysAgo(n.offset),
      },
    });
    console.log(`  ✓ Interaction: ${n.summary}`);
  }

  // Try Hindsight seeding
  try {
    const hindsight = await getHindsight();
    const healthy = await hindsight.checkMemoryHealth();

    if (healthy) {
      console.log(`\n🧠 Seeding Hindsight memory...`);
      await hindsight.setupDealBank(deal.id, companyName);
      await hindsight.setupSignalsBank(deal.id, companyName);
      console.log(`  ✓ Memory banks created`);

      for (const n of NOTES) {
        const ts = daysAgo(n.offset);
        await hindsight.writeMemory(deal.id, n.content, { timestamp: ts });
        await hindsight.writeSignalsMemory(deal.id, n.content, { timestamp: ts });
        await new Promise((r) => setTimeout(r, 500));
      }
      console.log(`  ✓ ${NOTES.length} interactions retained in memory`);

      await hindsight.initDealUnderstanding(deal.id);
      console.log(`  ✓ Mental model initiated`);
    } else {
      console.warn(`  ⚠ Hindsight unreachable — DB-only mode`);
    }
  } catch (e: any) {
    console.warn(`  ⚠ Hindsight seeding skipped: ${e?.message}`);
  }

  console.log(`\n✅ Rehearsal deal created!`);
  console.log(`   URL: http://localhost:3000/deals/${deal.id}`);
  console.log(`\n💡 Wait 20-30 seconds for Hindsight processing before rehearsing.`);
  console.log(`\n🎬 Demo script:`);
  console.log(`   1. Open the deal workspace`);
  console.log(`   2. Show 10-Sec Brief → note the evidence panel`);
  console.log(`   3. Show Ask AI → compare with/without memory`);
  console.log(`   4. Log a contradictory note: "Sarah said budget was cut back to $45K"`);
  console.log(`   5. Watch auto-jump to Signals → drift detected!`);
  console.log(`   6. Show Deal Health Score change`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
