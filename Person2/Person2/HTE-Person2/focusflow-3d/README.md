# FocusFlow

**AI-powered immersive adaptive learning for neurodivergent students**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Vercel AI SDK](https://img.shields.io/badge/AI_SDK-6.0-blue?logo=vercel)](https://sdk.vercel.ai)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-brown)](https://zustand-demo.pmnd.rs)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org)

---

## What is FocusFlow?

FocusFlow is an immersive 2D adaptive learning platform designed specifically for neurodivergent learners. Upload any PDF or text, and the AI extracts a knowledge graph of concepts. Learners explore them inside an interactive pixel-art classroom where an adaptive engine tracks mastery through spaced repetition, adjusts difficulty and modality in real time based on cognitive state, and transforms the environment to support focus.

**Key differentiators:**

- **Interactive 2D classroom** - Explore a pixel-art classroom with keyboard controls, interact with NPCs at stations (whiteboard, desk, bookshelf, lab bench) to open learning panels
- **Real-time adaptive engine** - Mastery scoring with Ebbinghaus time decay, prerequisite locking, and zone-of-proximal-development concept selection
- **Multi-modal explanations** - Visual, analogy, step-by-step, and Socratic modes adapt to each learner's preference
- **Cognitive-state awareness** - Explicit check-ins + implicit behavioral signals adjust chunk size, difficulty, and visual effects

Built at **HKUST Hackathon 2026** by a 6-person team.

---

## Features

- **PDF/text upload** - Auto-extract knowledge graph of concepts with prerequisite edges
- **2D interactive classroom** - Pixel-art tile map with keyboard-controlled player, NPC dialogue, and interactive stations
- **Adaptive mastery tracking** - Spaced repetition with Ebbinghaus decay curve
- **4 explanation modes** - Visual, analogy, step-by-step, Socratic
- **Prerequisite locking** - Concepts lock until prerequisites reach 70% mastery
- **Cognitive state tracking** - Focused / okay / drifting / done with behavioral signals
- **AI tutor chat** - Streaming responses powered by multi-provider LLM abstraction
- **Quiz generation** - Difficulty scaling (easy / medium / hard) with mastery updates
- **Resource bookshelf** - Web search integration for supplementary learning materials
- **Session analytics** - Progress dashboard with mastery weather, time tracked, concepts mastered
- **Energy check-in** - Quick self-report that adjusts adaptive parameters
- **Demo mode** - Pre-cached responses for offline demos without API keys

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14.2 |
| UI Library | React | 18 |
| Language | TypeScript | 5 |
| Rendering | HTML5 Canvas (2D) | - |
| State | Zustand | 5.0 |
| AI/LLM | Vercel AI SDK | 6.0 |
| LLM Providers | Minimax, OpenAI, Anthropic, Ollama, Bedrock | - |
| Styling | Tailwind CSS | 3.4 |
| UI Components | Radix UI, Lucide icons, CVA | - |
| Storage | Vercel Blob, AWS S3 (fallback) | - |
| Validation | Zod | 4.3 |
| PDF Parsing | pdf-parse | 2.4 |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                          # Main page — 2D game canvas + HUD + panels + adaptive sync
│   ├── layout.tsx                        # Root layout
│   ├── globals.css                       # Tailwind globals
│   └── api/
│       ├── ingest/route.ts               # PDF/text → knowledge graph extraction
│       ├── quiz/route.ts                 # Quiz question generation
│       ├── explain/route.ts              # Multi-modal concept explanation
│       ├── tutor/route.ts                # AI tutor streaming chat
│       ├── upload/route.ts               # PDF upload (Blob / S3 / base64)
│       ├── search/route.ts               # Bookshelf resource search
│       ├── session-summary/route.ts      # Learning session summary
│       ├── llm-test/route.ts             # LLM connectivity check
│       └── adaptive/
│           ├── knowledge-state/route.ts  # Mastery updates from interaction events
│           ├── cognitive-state/route.ts  # Cognitive assessment from signals
│           └── next-action/route.ts      # Decision engine — next concept + room commands
├── components/
│   ├── game/
│   │   ├── GameCanvas.tsx                # 2D pixel-art classroom — HTML5 Canvas game loop
│   │   ├── DialogueBox.tsx               # NPC dialogue overlay with options
│   │   ├── Player.ts                     # Player movement and sprite logic
│   │   ├── NPC.ts                        # NPC definitions and behavior
│   │   ├── TileMap.ts                    # Tile map rendering (ground, furniture, doors)
│   │   ├── Camera.ts                     # 2D camera follow logic
│   │   ├── SpriteSheet.ts               # Sprite sheet utilities
│   │   └── InteractionManager.ts        # NPC proximity detection and interaction
│   ├── hud/
│   │   ├── MasteryBar.tsx                # Mastery progress HUD bar
│   │   └── ControlsHint.tsx             # First-visit keyboard controls hint
│   ├── panels/
│   │   ├── UploadPanel.tsx               # PDF/text upload form
│   │   ├── WhiteboardPanel.tsx           # Knowledge graph concept explorer
│   │   ├── StudyPanel.tsx                # Explanation viewer (4 modes)
│   │   ├── QuizPanel.tsx                 # Quiz interface with scoring
│   │   ├── TutorPanel.tsx                # AI tutor chat with streaming
│   │   ├── BookshelfPanel.tsx            # Resource search & bookmarks
│   │   └── EnergyCheckIn.tsx             # Cognitive state self-report
│   └── ui/
│       ├── button.tsx                    # shadcn/ui button (CVA)
│       ├── card.tsx                      # shadcn/ui card
│       ├── badge.tsx                     # shadcn/ui badge
│       ├── progress.tsx                  # shadcn/ui progress bar
│       ├── label.tsx                     # shadcn/ui label
│       ├── radio-group.tsx               # shadcn/ui radio group
│       └── input.tsx                     # shadcn/ui input
├── lib/
│   ├── adaptive.ts                       # Adaptive engine core — mastery, decay, locks, next-action
│   ├── llm.ts                            # Multi-provider LLM abstraction
│   ├── types.ts                          # Shared TypeScript interfaces
│   ├── ingest.ts                         # Knowledge graph extraction logic
│   ├── cache.ts                          # In-memory LRU cache
│   ├── demo-cache.ts                     # Demo fallback file reader
│   ├── bedrock.ts                        # AWS Bedrock helper
│   └── utils.ts                          # Tailwind cn() merge utility
└── store/
    └── useFocusFlowStore.ts              # Zustand store — full learner model

public/
└── demo-cache/
    ├── ingest.json                       # Pre-cached knowledge graph
    ├── adaptive-knowledge-state.json     # Pre-cached mastery state
    ├── adaptive-cognitive-state.json     # Pre-cached cognitive assessment
    └── adaptive-next-action.json         # Pre-cached next action decision
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                        │
│                                                                 │
│  ┌──────────────────┐  interact  ┌──────────────────────────┐   │
│  │  2D Game Canvas   │ ────────► │    Panel Overlay (React)  │   │
│  │  - TileMap        │           │    - Upload / Whiteboard  │   │
│  │  - Player + NPCs  │           │    - Study / Quiz / Tutor │   │
│  │  - DialogueBox    │           │    - Bookshelf / Progress │   │
│  │  - Camera         │           └──────────┬───────────────┘   │
│  └──────────────────┘                       │                   │
│                                             │ fetch()           │
│  ┌──────────────────────────────────────────┘                   │
│  │  Zustand Store (useFocusFlowStore)                           │
│  │  - knowledgeGraph, learnerState, conceptRecords              │
│  │  - sessionParams, currentAction, conceptLocks                │
│  │  - pendingEvents → debounced flush to API                    │
│  └──────────────────────────────────────────┐                   │
│                                             │                   │
│  ┌──────────────────┐                       │                   │
│  │  AdaptiveSync     │ ◄────────────────────┘                   │
│  │  (useEffect loop) │                                          │
│  └────────┬─────────┘                                           │
└───────────┼─────────────────────────────────────────────────────┘
            │ POST /api/adaptive/*
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js API Routes (Server)                 │
│                                                                 │
│  /api/ingest ──────► extractKnowledgeGraphFromText() ──► LLM    │
│  /api/quiz ────────► generateObject() + Zod schema ───► LLM    │
│  /api/explain ─────► generateText() with mode prompts ► LLM    │
│  /api/tutor ───────► streamText() with learner context ► LLM   │
│  /api/upload ──────► Vercel Blob / S3 / base64                  │
│  /api/search ──────► Demo cache / P3 FastAPI proxy              │
│  /api/session-summary ► generateText() ───────────────► LLM    │
│                                                                 │
│  /api/adaptive/knowledge-state ► computeMasteryUpdate()         │
│  /api/adaptive/cognitive-state ► assessCognitive()              │
│  /api/adaptive/next-action ────► decideNextAction()             │
│                                                                 │
│  LLM Abstraction (lib/llm.ts):                                  │
│  Minimax → OpenAI → Anthropic → Ollama → Bedrock                │
└─────────────────────────────────────────────────────────────────┘
```

**Adaptive Engine Loop:**

```
  User interacts (quiz answer, explanation read, check-in)
       │
       ▼
  InteractionEvent pushed to Zustand pendingEvents
       │
       ▼ (debounced 1s)
  POST /api/adaptive/knowledge-state
       │  → computeMasteryUpdate() per event
       │  → applyTimeDecay() (Ebbinghaus)
       │  → computePrerequisiteLocks()
       │
       ▼
  POST /api/adaptive/cognitive-state
       │  → assessCognitive(explicit, implicit signals)
       │  → returns SessionParams (chunk_size, difficulty_bias, modality)
       │
       ▼
  POST /api/adaptive/next-action
       │  → decideNextAction() — ZPD-first concept selection
       │  → returns NextAction + RoomCommands
       │
       ▼
  Game canvas reacts: visual effects change, concepts lock/unlock
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+ (comes with Node)

### Install & Run

```bash
# Clone the repository
git clone <repo-url>
cd Person2/HTE-Person2/focusflow-3d

# Install dependencies
npm install --legacy-peer-deps

# Copy environment template
cp .env.example .env.local

# Configure at least one LLM provider in .env.local (see below)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the classroom.

### Demo Mode (no API keys needed)

Set `DEMO_FALLBACK=1` in `.env.local` to use pre-cached responses. The ingest, quiz, explain, session-summary, and adaptive endpoints will return demo JSON files from `public/demo-cache/`.

```bash
echo "DEMO_FALLBACK=1" >> .env.local
npm run dev
```

---

## Environment Variables

Create `.env.local` from `.env.example`. You only need **one** LLM provider configured.

| Variable | Required | Description |
|----------|----------|-------------|
| `MINIMAX_API_KEY` | One provider required | Minimax API key (recommended — cheapest) |
| `MINIMAX_MODEL_ID` | No | Fast model (default: `MiniMax-M2.1-lightning`) |
| `MINIMAX_CHAT_MODEL_ID` | No | Chat model (default: `MiniMax-M2.1`) |
| `OPENAI_API_KEY` | One provider required | OpenAI API key |
| `OPENAI_MODEL_ID` | No | Fast model (default: `gpt-4o-mini`) |
| `OPENAI_CHAT_MODEL_ID` | No | Chat model (default: `gpt-4o`) |
| `ANTHROPIC_API_KEY` | One provider required | Anthropic API key |
| `ANTHROPIC_MODEL_ID` | No | Fast model (default: `claude-3-5-haiku-20241022`) |
| `ANTHROPIC_CHAT_MODEL_ID` | No | Chat model (default: `claude-3-5-sonnet-20241022`) |
| `LLM_PROVIDER` | No | Force a specific provider: `minimax`, `openai`, `anthropic`, `ollama`, `bedrock` |
| `OLLAMA_MODEL_ID` | No | Ollama local model (default: `llama3.2`) |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob token for PDF storage |
| `NEXT_PUBLIC_S3_BUCKET` | No | S3 bucket name (fallback storage) |
| `DEMO_FALLBACK` | No | Set to `1` for offline demo mode |

**Provider priority** (auto-detected from keys): Minimax > OpenAI > Anthropic > Ollama > Bedrock

---

## API Reference

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ingest` | POST | PDF/text → knowledge graph extraction via LLM |
| `/api/quiz` | POST | Generate quiz questions for a concept + difficulty |
| `/api/explain` | POST | Multi-modal explanation (visual/analogy/step-by-step/socratic) |
| `/api/tutor` | POST | AI tutor streaming chat with learner context |
| `/api/upload` | POST | PDF file upload (Vercel Blob / S3 / base64) |
| `/api/search` | GET | Bookshelf resource search by topics |
| `/api/session-summary` | POST | Generate learning session summary |
| `/api/llm-test` | GET | Test current LLM provider connectivity |

### Adaptive Engine Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/adaptive/knowledge-state` | POST | Process interaction events, update mastery scores |
| `/api/adaptive/cognitive-state` | POST | Assess cognitive state from check-in + behavioral signals |
| `/api/adaptive/next-action` | POST | Decide next concept, difficulty, modality, and room commands |

### Key Endpoint Details

<details>
<summary><code>POST /api/ingest</code></summary>

**Body:** `{ "pdfBase64"?: string, "text"?: string }` or multipart PDF upload

**Returns:** `KnowledgeGraph` — array of `ConceptNode` objects with prerequisite edges

Supports demo fallback via `DEMO_FALLBACK=1`.
</details>

<details>
<summary><code>POST /api/quiz</code></summary>

**Body:**
```json
{
  "concept_id": "binary-search",
  "concept_name": "Binary Search",
  "difficulty": "easy" | "medium" | "hard",
  "count": 3
}
```

**Returns:** `{ questions: QuizQuestion[] }` — each with question text, 4 options, correct index, and explanation
</details>

<details>
<summary><code>POST /api/explain</code></summary>

**Body:**
```json
{
  "concept_id": "binary-search",
  "concept_name": "Binary Search",
  "mode": "visual" | "analogy" | "step-by-step" | "socratic",
  "context": "optional additional context"
}
```

**Returns:** `{ explanation: string, mode: string }`
</details>

<details>
<summary><code>POST /api/adaptive/knowledge-state</code></summary>

**Body:**
```json
{
  "user_id": "demo-user",
  "events": [
    { "type": "quiz_correct", "concept_id": "c1", "difficulty": "medium" },
    { "type": "quiz_incorrect", "concept_id": "c2", "error_pattern": "off-by-one" },
    { "type": "explanation_read", "concept_id": "c3" }
  ]
}
```

**Returns:** `{ updates: MasteryDelta[], learner_state: LearnerStateSnapshot }`
</details>

<details>
<summary><code>POST /api/adaptive/next-action</code></summary>

**Body:**
```json
{
  "concepts": [{ "concept_id": "c1", "name": "...", "mastery": 45, ... }],
  "learner_state": { "concepts": {...}, "cognitive_state": "okay" },
  "session_params": { "cognitive_state": "okay", "chunk_size": "medium", ... }
}
```

**Returns:** `NextAction` — includes `next_concept_id`, `difficulty`, `modality`, `activity`, `room_commands[]`, and `reasoning`
</details>

---

## Adaptive Learning Engine

The adaptive engine (`src/lib/adaptive.ts`) implements the PRD's learning model.

### Mastery Scoring

Points are earned/lost per interaction:

| Event | Easy | Medium | Hard |
|-------|------|--------|------|
| Quiz correct | +10 | +12 | +15 |
| Challenge complete | +15 | +17 | +20 |
| Explanation read | +5 | +5 | +5 |
| Quiz incorrect | -5 | -5 | -5 |

Mastery is clamped to 0-100.

### Time Decay (Ebbinghaus)

```
decayRate = max(0, 1 - mastery/150)
decayed = mastery - daysSince * decayRate * 3
```

High-mastery concepts decay slower. No decay within the first hour.

### Prerequisite Locking

Concepts with prerequisites are **locked** until all prerequisites reach **70% mastery**. Locked concepts display a lock icon and cannot be opened.

### Cognitive State Assessment

The engine combines explicit self-reports and implicit behavioral signals:

| Signal | Inference |
|--------|-----------|
| Chunk time < 30% of average | Focused |
| Chunk time > 200% of average | Drifting |
| 3+ "explain differently" requests | Drifting |
| Fast + correct quiz | Focused |
| Fast + incorrect quiz | Drifting |

**Session parameters** adjust based on cognitive state:

| State | Chunk Size | Difficulty | Modality |
|-------|-----------|------------|----------|
| Focused | Long | Harder | Keep current |
| Okay | Medium | Normal | Keep current |
| Drifting | Short | Easier | Switch to visual |
| Done | Short | Easy | Suggest break |

### Next-Action Decision

The ZPD-first algorithm:

1. Filter out locked concepts
2. Apply time decay to all mastery scores
3. Prioritize **Zone of Proximal Development** (30-70% mastery)
4. Then **needs review** (1-29%), then **fresh** (0%)
5. Sort by lowest mastery first (most benefit)
6. Decide activity: explanation (low mastery) → quiz (50%+) → challenge (drifting + 30%+) → review
7. Emit room commands based on cognitive state

### Room Commands

| Command | Trigger | Effect |
|---------|---------|--------|
| `deep_focus` | Focused state | Dim ambient light to 70% |
| `drift_mode` | Drifting state | Increase glow intensity to 80% |
| `neutral` | Okay state | Normal lighting |
| `session_end` | Done state | End session, generate summary |
| `lock_concept` | Unmet prerequisites | Lock icon on NPC |
| `unlock_concept` | Prerequisites met | Remove lock |

---

## 2D Classroom

The classroom (`src/components/game/GameCanvas.tsx`) is a pixel-art HTML5 Canvas game with keyboard-controlled player movement and NPC interactions.

### Interactive NPCs

Players walk around the classroom and press Space/Enter near NPCs to interact. Each NPC opens a dialogue box with options that launch learning panels:

| NPC | Panel | Purpose |
|-----|-------|---------|
| Whiteboard | `whiteboard` | Knowledge graph concept explorer |
| Desk | `study` | Explanation viewer (4 modes) |
| Bookshelf | `bookshelf` | Resource search & bookmarks |
| Lab Bench | `challenge` | Hands-on challenges |
| Quiz Board | `quiz` | Quiz interface |
| AI Tutor | `tutor` | AI tutor chat |

### Cognitive-State Effects

- **Focused:** Vignette overlay reduces visual noise
- **Drifting:** Warm overlay re-engages attention; NPC animations speed up
- **Done:** Sepia overlay suggests session end

---

## Team

| Person | Role | Contribution |
|--------|------|-------------|
| Person 1 | Game Assets | Classroom tile map, sprite sheets, NPC art |
| Person 2 | AI Backend | API routes (ingest, quiz, explain, tutor, upload, session-summary), multi-LLM abstraction |
| Person 3 | Web Scraper | FastAPI search server (DuckDuckGo/Exa integration) |
| Person 4 | Frontend UI | All 7 panel components with shadcn/ui |
| Person 5 | UX / A11y | Energy check-in, progress dashboard, design system |
| Person 6 | Integration & Adaptive | Adaptive engine, Zustand store, 2D game canvas, API integration |

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables on Vercel dashboard
# (or use vercel env add)
```

**Required Vercel settings:**
- Build command: `next build`
- Output directory: `.next`
- Install command: `npm install --legacy-peer-deps`
- Node.js version: 20.x

### Environment Variables on Vercel

Add at minimum one LLM provider key (`MINIMAX_API_KEY`, `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY`). For demo presentations, set `DEMO_FALLBACK=1` to skip LLM calls entirely.

For PDF storage, add `BLOB_READ_WRITE_TOKEN` from Vercel Storage.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run test:api` | Test API endpoints |
| `npm run precache` | Pre-generate demo cache files |

---

## License

MIT
