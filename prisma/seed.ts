import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================================
// SEED DATA: 3 deals × 4-6 interactions each
// Timestamps spread over ~6 weeks with a DELIBERATE CONTRADICTION
// for the live demo: Northwind's budget changes from $50K → $80K
// ============================================================

const DEALS = [
  {
    companyName: "Northwind Logistics",
    contactName: "Sarah Chen",
    stage: "Discovery",
  },
  {
    companyName: "Bluepeak Analytics",
    contactName: "Marcus Rivera",
    stage: "Proposal",
  },
  {
    companyName: "Ferro Manufacturing",
    contactName: "Priya Sharma",
    stage: "Negotiation",
  },
];

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(10, 0, 0, 0);
  return d;
}

// Northwind Logistics interactions (Discovery) — contains the deliberate contradiction
const NORTHWIND_INTERACTIONS = [
  {
    content:
      "Initial discovery call with Sarah Chen, VP of Operations at Northwind Logistics. She's frustrated with their current shipping optimization tool — says it takes 3 hours per day for her team to manually route deliveries. She mentioned a budget of around $50K for this initiative, described it as 'tight but workable.' Also evaluating Acme Corp's RouteMax platform. Key stakeholder is their CTO James Liu who will need to approve any technical integration.",
    summary: "Discovery call: $50K budget, evaluating Acme Corp, CTO approval needed",
    createdAt: daysAgo(42),
  },
  {
    content:
      "Follow-up call with Sarah. She ran our ROI calculator and was impressed — projected 40% time savings. However, she raised concerns about SOC2 compliance. Their legal team requires SOC2 Type II before any vendor can access their shipment data. She asked for our compliance documentation. Also mentioned that James Liu wants to see a live technical demo, not just slides. Sarah prefers async communication — said email follow-ups work better than calls for her schedule.",
    summary: "SOC2 compliance blocker, CTO wants live demo, async comms preferred",
    createdAt: daysAgo(35),
  },
  {
    content:
      "Quick check-in with Sarah via email thread. She forwarded our SOC2 docs to legal — they said review will take 2 weeks. Meanwhile, she shared that Acme Corp gave them a demo last week and 'it was fine but nothing special.' She also mentioned a new stakeholder: CFO David Park is now involved because any spend over $30K needs his sign-off. She's pushing internally to get the budget conversation done before Q4 planning freezes things.",
    summary: "Legal reviewing SOC2, Acme demo underwhelmed, CFO David Park now involved",
    createdAt: daysAgo(28),
  },
  {
    // DELIBERATE CONTRADICTION: Budget changes from $50K to $80K
    content:
      "Great call with Sarah today. Big news: she got budget approval bumped up to $80K. Says finance approved the increase because the ROI numbers were compelling — the 40% time savings translates to about $200K annual cost reduction for their team. Budget is no longer the blocker. She wants to schedule the technical demo for James Liu next week. SOC2 legal review came back clean — no issues. She also dropped that Acme Corp's pricing came in at $65K but with limited API access.",
    summary: "Budget increased to $80K, SOC2 cleared, Acme priced at $65K with limits",
    createdAt: daysAgo(14),
  },
  {
    content:
      "Technical demo with James Liu and Sarah. James was impressed with the API flexibility — said it's 'leagues ahead of what Acme showed us.' He had concerns about integration timeline: their legacy TMS system uses a custom REST API that would need a connector built. He estimated 3-4 weeks of their dev team's time. Sarah asked about implementation support — whether we include onboarding hours in the contract. James gave a verbal thumbs-up pending the integration plan.",
    summary: "CTO impressed, integration timeline concern, verbal approval pending plan",
    createdAt: daysAgo(7),
  },
];

// Bluepeak Analytics interactions (Proposal) — champion departure risk
const BLUEPEAK_INTERACTIONS = [
  {
    content:
      "First meeting with Marcus Rivera, Head of Data Science at Bluepeak Analytics. They're a 200-person data analytics firm looking for an ML pipeline management solution. Marcus has been championing our product internally for months — he saw our talk at DataConf. Current pain: their data scientists spend 30% of time on infrastructure instead of modeling. Budget range mentioned: $120K-150K annually. Marcus reports to VP Engineering Anika Patel.",
    summary: "Champion intro, ML pipeline need, $120K-150K range, reports to VP Eng",
    createdAt: daysAgo(38),
  },
  {
    content:
      "Deep dive call with Marcus and two of his senior data scientists (Tom Wu, Lisa Okafor). They walked through their current stack: Airflow for orchestration, custom Kubernetes jobs for training, manual model registry. Pain points are clear — Tom said 'we lose a week every time we need to deploy a new model to production.' They're also evaluating Weights & Biases and MLflow but see us as the more integrated solution. Lisa asked about GPU cluster support — this is critical for their transformer models.",
    summary: "Tech deep dive, Airflow/K8s pain, evaluating W&B and MLflow, GPU critical",
    createdAt: daysAgo(31),
  },
  {
    content:
      "Bad news: Marcus told me in confidence that he's been approached by another company and might leave Bluepeak within the next 2 months. He said he'll still push our deal through before he goes, but warned that without him championing it internally, Anika Patel might deprioritize the initiative. He recommended I build a direct relationship with Anika now. He also mentioned that their Q1 budget is already allocated, so we need to close by end of this quarter or it slips to Q2.",
    summary: "Champion may leave in 2 months, need relationship with VP, Q1 budget risk",
    createdAt: daysAgo(24),
  },
  {
    content:
      "Had a productive call with Anika Patel (VP Engineering) — Marcus set it up. Anika is pragmatic: she sees the value but wants proof it works at their scale before committing. She proposed a 30-day paid POC at $15K that would convert to the full contract if successful. She also wants our security team to do a call with their CISO — apparently they had a vendor breach last year and are extra cautious now. Timeline: POC decision by end of month, full contract by end of quarter.",
    summary: "VP wants 30-day POC at $15K, CISO security call needed, breach history",
    createdAt: daysAgo(17),
  },
  {
    content:
      "Sent the POC proposal to Anika with a detailed scope: 3 workloads, dedicated support engineer, success criteria defined upfront. Marcus reviewed it first and gave feedback — he wants us to include a transformer fine-tuning pipeline as one of the workloads because that's their hardest current problem and will make the POC results more compelling internally. Tom Wu will be the technical lead on their side. CISO call scheduled for next Tuesday.",
    summary: "POC proposal sent with transformer pipeline, CISO call scheduled",
    createdAt: daysAgo(10),
  },
  {
    content:
      "CISO call went well — they were thorough but fair. Main asks: data encryption at rest and in transit (we already do both), audit logs for all model access (we have this), and a DPA signed before POC starts. Our legal is drafting the DPA now. Marcus confirmed he's still at Bluepeak for at least another 6 weeks — says the other opportunity is moving slowly. Anika sent a follow-up email saying 'the team is excited about the POC, let's get the paperwork done.'",
    summary: "CISO approved with DPA requirement, Marcus staying 6+ weeks, team excited",
    createdAt: daysAgo(3),
  },
];

// Ferro Manufacturing interactions (Negotiation) — pricing and competition
const FERRO_INTERACTIONS = [
  {
    content:
      "Kick-off call with Priya Sharma, Director of Digital Transformation at Ferro Manufacturing. They're a mid-market manufacturer ($500M revenue) looking to modernize their quality inspection process using computer vision. Current approach is manual inspection — 12 inspectors per shift, 8% defect miss rate. Priya has exec sponsorship from the COO. Initial budget discussion: they have $200K allocated but Priya warned that 'every vendor comes in over budget.' Also evaluating Zenith AI and Cognex.",
    summary: "QC modernization, $200K budget, evaluating Zenith AI and Cognex",
    createdAt: daysAgo(40),
  },
  {
    content:
      "Technical assessment visit to Ferro's plant in Detroit. Met with Priya and their plant manager Rob Kowalski. Saw the inspection line firsthand — the defect types are varied (cracks, discoloration, dimensional errors) and the lighting conditions are challenging. Rob is skeptical about AI accuracy — he's been in manufacturing for 25 years and has 'seen a lot of tech promises that didn't pan out.' He wants to see a proof on THEIR specific defect types, not generic demos. Priya is clearly the champion but Rob's buy-in is essential.",
    summary: "Plant visit, skeptical plant manager Rob, need custom defect proof",
    createdAt: daysAgo(33),
  },
  {
    content:
      "Presented our technical proposal to Priya, Rob, and their IT director Sandra Kim. Our solution came in at $240K — 20% over their stated budget. Priya was upfront: 'this is more than we planned for.' She asked if we can phase the rollout to bring the first-year cost under $200K. Sandra raised integration concerns with their MES (Manufacturing Execution System) — they use a legacy system from 2015 that doesn't have modern APIs. Zenith AI apparently quoted $180K but with a less comprehensive feature set. Rob said 'price matters less than whether it actually works.'",
    summary: "Pricing 20% over budget at $240K, MES integration concern, Zenith at $180K",
    createdAt: daysAgo(25),
  },
  {
    content:
      "Follow-up negotiation call with Priya. I proposed a phased approach: Phase 1 at $160K covers 2 inspection lines with core defect detection, Phase 2 at $95K adds the remaining lines plus predictive maintenance. This brings Year 1 under budget at $160K with full deployment in Year 2. Priya liked the structure but needs COO approval on the phased timeline. She also mentioned that Zenith's demo last week had accuracy issues — their model struggled with the discoloration defects that are Ferro's biggest problem. Rob was at the Zenith demo and was 'not impressed.'",
    summary: "Proposed phased pricing ($160K/$95K), Zenith demo had accuracy issues",
    createdAt: daysAgo(18),
  },
  {
    content:
      "Critical call today. Priya got COO approval for the phased approach, but with conditions: they want a 90-day performance guarantee with a right to terminate if accuracy doesn't hit 95% on their specific defect types. Sandra Kim also needs 40 hours of integration support for the MES connector included in the contract. Priya confirmed Zenith is out of the running — Rob killed it after the demo. We're the sole vendor now. Contract target: signed within 2 weeks. Priya asked for a final pricing package by Friday.",
    summary: "COO approved with 95% accuracy guarantee, Zenith eliminated, sole vendor",
    createdAt: daysAgo(8),
  },
];

async function main() {
  console.log("🧠 DealBook Seed Script");
  console.log("======================\n");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.interaction.deleteMany();
  await prisma.deal.deleteMany();

  const allInteractions: Array<{
    dealId: string;
    content: string;
    summary: string;
    createdAt: Date;
  }> = [];

  // Create deals and interactions
  for (let i = 0; i < DEALS.length; i++) {
    const dealData = DEALS[i];
    const interactions =
      i === 0
        ? NORTHWIND_INTERACTIONS
        : i === 1
          ? BLUEPEAK_INTERACTIONS
          : FERRO_INTERACTIONS;

    console.log(`\n📋 Creating deal: ${dealData.companyName}`);
    const deal = await prisma.deal.create({ data: dealData });

    for (const interaction of interactions) {
      const created = await prisma.interaction.create({
        data: {
          dealId: deal.id,
          content: interaction.content,
          summary: interaction.summary,
          createdAt: interaction.createdAt,
        },
      });
      allInteractions.push({
        dealId: deal.id,
        content: interaction.content,
        summary: interaction.summary,
        createdAt: interaction.createdAt,
      });
      console.log(
        `  ✓ Interaction: ${interaction.summary?.substring(0, 60)}...`
      );
    }
  }

  console.log(`\n✅ Seeded ${DEALS.length} deals with ${allInteractions.length} interactions`);

  // --- Hindsight Memory Seeding ---
  console.log("\n🧠 Attempting Hindsight memory seeding...");

  try {
    // Dynamic import to avoid issues if the package isn't installed
    const hindsight = await import("../src/lib/hindsight");

    const healthy = await hindsight.checkMemoryHealth();
    if (!healthy) {
      console.warn("⚠ Hindsight is not reachable. Skipping memory seeding.");
      console.log("  Run the seed script again once Hindsight is configured.\n");
      return;
    }

    // Setup banks
    const deals = await prisma.deal.findMany();
    console.log("\nSetting up memory banks...");

    await hindsight.setupPatternsBank();
    console.log("  ✓ Patterns bank created");

    for (const deal of deals) {
      await hindsight.setupDealBank(deal.id, deal.companyName);
      console.log(`  ✓ Deal bank: deal-${deal.id}`);

      await hindsight.setupSignalsBank(deal.id, deal.companyName);
      console.log(`  ✓ Signals bank: deal-${deal.id}-signals`);
    }

    // Retain all interactions with correct timestamps
    console.log("\nRetaining interactions in memory (this may take a minute)...");
    let writeCount = 0;

    for (const interaction of allInteractions) {
      try {
        // Write to per-deal bank with explicit timestamp
        await hindsight.writeMemory(interaction.dealId, interaction.content, {
          timestamp: interaction.createdAt,
        });

        // Write to signals bank with explicit timestamp
        await hindsight.writeSignalsMemory(interaction.dealId, interaction.content, {
          timestamp: interaction.createdAt,
        });

        // Write to patterns bank with explicit timestamp
        await hindsight.writePatternMemory(interaction.content, {
          dealId: interaction.dealId,
          timestamp: interaction.createdAt,
        });

        writeCount++;
        console.log(
          `  ✓ [${writeCount}/${allInteractions.length}] ${interaction.summary?.substring(0, 50)}...`
        );

        // Brief pause between retains to respect processing
        await new Promise((r) => setTimeout(r, 500));
      } catch (e: any) {
        console.warn(
          `  ⚠ Skipped: ${interaction.summary?.substring(0, 50)}... (${e?.message})`
        );
      }
    }

    // Initialize mental models
    console.log("\nInitializing deal understanding (mental models)...");
    for (const deal of deals) {
      try {
        await hindsight.initDealUnderstanding(deal.id);
        console.log(`  ✓ Mental model initiated for ${deal.companyName}`);
      } catch (e: any) {
        console.warn(`  ⚠ Mental model skipped for ${deal.companyName}: ${e?.message}`);
      }
    }

    console.log(`\n✅ Hindsight seeding complete: ${writeCount * 3} total writes across 3 bank types`);
  } catch (e: any) {
    console.warn(`\n⚠ Hindsight seeding failed: ${e?.message}`);
    console.log("  Prisma data is intact. Hindsight can be seeded separately.\n");
  }

  console.log("\n🎉 Seed complete! Run `npm run dev` to start DealBook.\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
