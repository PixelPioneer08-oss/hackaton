# 🧠 DealBook — AI Sales Call Memory Agent

> **Hackathon Entry:** AI Agents That Learn Using Hindsight  
> **Track:** Sales & Revenue — Deal Intelligence Agent  
> **Tech Stack:** Next.js 14, TypeScript, Hindsight Memory SDK (`@vectorize-io/hindsight-client`), Groq LLM API (`llama-3.3-70b-versatile`), Prisma, SQLite, Tailwind CSS.

---

## 🎯 Problem Statement & Solution

**The Business Problem:**  
B2B sales reps waste 15–20 minutes before every call re-reading scattered CRM notes to recall past discussions, objections raised, stakeholder preferences, and promised terms.

**The DealBook Solution:**  
DealBook is an AI sales assistant that uses Vectorize's **Hindsight memory layer** to remember every interaction per deal automatically. Before every call, DealBook briefs the rep in 10 seconds with:
1. **10-Second Executive Pre-Call Brief:** Background summary, unresolved objections, key decision-makers, and top 3 tactical talking points.
2. **Disposition-Tuned Contradiction & Drift Detection:** Detects shifting positions across calls (e.g. Budget shift from **$50K on Sep 1** to **$80K on Oct 5**).
3. **Contact & Company Observation Profiles:** Zero-prompt entity profiles automatically synthesized for key decision-makers.
4. **Cross-Deal Objection Intelligence:** Learns which objection-handling tactics work best over time using Hindsight's Opinion Network.
5. **Grounded RAG Chat ("Ask DealBook"):** Instant memory-grounded Q&A for reps during deal prep.

---

## 🔬 How Hindsight Memory is Used

Hindsight is the core intelligence layer of DealBook, not an add-on feature:

- **Retain (`client.retain`):** Every logged interaction is stored with explicit historical timestamps (`timestamp` parameter) to maintain chronological fidelity for drift detection.
- **Recall (`client.recall`):** Used for targeted retrieval of buying signals, entity observations (`types: ["observation"]`), and opinion network patterns (`types: ["opinion"]`).
- **Reflect (`client.reflect`):** Conducts agentic synthesis for pre-call briefs and disposition-tuned signal reflection (`skeptical: true`).
- **Mental Models (`client.createMentalModel`):** Auto-initiates background mental models (`deal-understanding`) for real-time prospect profile updates.
- **Bank Scoping Strategy:**
  - `deal-{id}`: Main per-deal memory bank (neutral disposition for briefs & Q&A).
  - `deal-{id}-signals`: Dedicated signals bank (skeptical disposition for literal drift detection).
  - `org-sales-patterns`: Shared organization bank (opinion network for cross-deal objection intelligence).

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                              DealBook UI                               │
│  - Pipeline Dashboard & Win/Loss Metrics                              │
│  - Multi-Tab Workspace (Timeline, Brief, Signals, Ask Chat, etc.)       │
│  - Objection Patterns (Cross-Deal Opinion Network Intelligence)        │
└───────────────────┬────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            Next.js 14 APIs                             │
│  /api/deals/[id]/brief          -> Pre-Call Brief & Temporal Drift     │
│  /api/deals/[id]/signals        -> Contradiction & Risk Detection      │
│  /api/deals/[id]/contact        -> Observation Network Profiles        │
│  /api/deals/[id]/understanding  -> Mental Model Prospect Synthesis     │
│  /api/deals/[id]/ask            -> Grounded RAG Memory Chat            │
│  /api/patterns                  -> Cross-Deal Opinion Intelligence     │
└───────────────────┬──────────────────────────────────┬─────────────────┘
                    │                                  │
                    ▼                                  ▼
┌────────────────────────────────────────┐ ┌─────────────────────────────┐
│       Hindsight Memory Engine          │ │       SQLite + Prisma       │
│  - `@vectorize-io/hindsight-client`    │ │  - Relational backup & DB   │
│  - Retain / Recall / Reflect           │ │  - Fast timeline queries    │
│  - Mental Models & Observations        │ └─────────────────────────────┘
└────────────────────────────────────────┘
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js >= 18
- npm

### 2. Environment Setup
Create a `.env` file in the project root:
```env
DATABASE_URL="file:./dev.db"
HINDSIGHT_API_TOKEN="your_hindsight_token"
HINDSIGHT_BASE_URL="https://api.hindsight.vectorize.io"
GROQ_API_KEY="your_groq_api_key"
```
*(Note: DealBook includes a zero-crash Degraded Mode that gracefully serves structured fallback responses if API keys are unconfigured during local testing.)*

### 3. Database Migration & Seed
Run Prisma migrations and seed the 3 realistic enterprise deals (16 interactions):
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎬 60-Second Demo Story

1. **Open Dashboard:** View active pipeline deals (*Northwind Logistics*, *Bluepeak Analytics*, *Ferro Manufacturing*).
2. **Click Northwind Logistics:** Open the deal workspace.
3. **View Pre-Call Brief:** Instantly review key talking points, stakeholders (*Marcus Vance*, *Elena Rostova*), and unresolved objections.
4. **Log a Contradictory Interaction:** Enter a new call note: *"Marcus stated budget cap is now $50K maximum, down from $80K."*
5. **Watch Hindsight Detect Drift:** Observe the **Drift Signals** card flag a **HIGH RISK Budget Change** ($80K → $50K shift) using historical temporal memory.
6. **Ask DealBook:** Query *"What were their security requirements?"* to see grounded memory RAG in action.

---

## 🏆 Judging Criteria Alignment

- **Innovation (30%):** Solves a high-value $50/mo enterprise B2B sales workflow with proactive memory briefing rather than a generic chatbot.
- **Use of Hindsight Memory (25%):** Central star of the product utilizing Retain, Recall, Reflect, Observations, Opinions, and Mental Models.
- **Technical Implementation (20%):** Clean Next.js 14 App Router, TypeScript, Prisma, robust Groq fallback chain, and defensive UI error handling.
- **User Experience (15%):** Dark SaaS theme (`#0B0F17`), responsive tabbed layout, dynamic badges, glassmorphism cards.
- **Real-world Impact (10%):** Eliminates 15-20 minutes of manual prep per call for sales reps.
