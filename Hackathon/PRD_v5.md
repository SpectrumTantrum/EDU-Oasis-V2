**PRODUCT REQUIREMENTS DOCUMENT**

**FocusFlow 3D**

*AI-Powered Immersive Adaptive Learning Environment*

HKUST Hackathon 2026

24-Hour Build Plan \| Team Size: 6 Builders \| No Dedicated Pitch Role

**Version 5.0 \| February 28, 2026**

**Supabase + Vercel Edition**

**CONFIDENTIAL**

# **1. Executive Summary**

FocusFlow 3D is an AI-powered immersive learning platform that
transforms uploaded lecture materials into interactive 3D classroom
environments. Designed specifically for neurodivergent learners (ADHD,
autism, dyslexia), the platform adapts in real-time to each student's
knowledge state, cognitive energy, and preferred learning modality.

Unlike traditional study tools that rely on text-heavy interfaces,
FocusFlow leverages spatial memory, multi-modal content delivery, and AI
web scraping agents to create a learning experience that is engaging,
personalized, and always up-to-date.

**Version 5.0 Update:** This edition runs on Supabase (PostgreSQL
database, auth, storage, realtime) and Vercel (frontend hosting,
serverless functions, AI SDK), replacing the AWS cloud-native stack from
v4. This provides a faster developer experience, simpler infrastructure,
and a stack the team can ship confidently in 24 hours.

## **1.1 Target Awards**

  ------------------------------------------------------------------------
  **Award**             **Prize**     **Why We Win**
  --------------------- ------------- ------------------------------------
  RevisionDojo Future   HKD 15,000    Adaptive learning + neurodivergent
  of Learning                         focus + pedagogy

  OAX Foundation AI     HKD 15,000    AI content curation + web scraping
  EdTech                              agent + personalization

  Main Awards           HKD 20,000    Technical execution + innovation +
  (Champion)                          real-world impact

  HKUST EC Innovation   HKD 10,000    Startup potential + underserved
  Award                               market

  Total Potential       HKD 60,000+   One project, multiple awards through
                                      strategic framing
  ------------------------------------------------------------------------

## **1.2 Unique Value Proposition**

Our team includes members who are neurodivergent themselves. We are not
building for an abstract user persona --- we are the target user. This
lived experience gives us an authenticity advantage that no competitor
can replicate. Our pitch opens with: "We built this because we needed it
ourselves."

# **2. Problem Statement**

## **2.1 The Learning Crisis for Neurodivergent Students**

Approximately 15--20% of university students are neurodivergent (ADHD,
autism, dyslexia, or combinations). Current study tools are designed for
neurotypical brains: they assume sustained attention, linear processing,
and text-dominant learning. This creates a systematic disadvantage for
neurodivergent learners who may need shorter content chunks, multi-modal
explanations, spatial/visual learning, and flexible pacing.

## **2.2 The Content Freshness Problem**

In fast-moving fields such as AI, blockchain, and policy, textbook
content becomes outdated within months. Students study from static
materials while the field races ahead. There is no tool that proactively
curates and surfaces fresh, relevant content alongside course materials.

## **2.3 The Engagement Problem**

Traditional study tools (flashcard apps, PDF readers, LMS platforms) are
fundamentally passive and text-heavy. For students with attention
difficulties, these tools feel like punishment rather than support. The
learning medium itself needs to be reimagined to be inherently engaging
through spatial interaction, variety, and agency.

# **3. Solution Overview**

FocusFlow 3D is a web-based platform with three integrated systems that
work together to deliver an adaptive, immersive learning experience.
Version 5.0 runs on Supabase + Vercel.

## **3.1 System Architecture**

  ------------------------------------------------------------------------
  **System**       **Purpose**              **Key Technologies**
  ---------------- ------------------------ ------------------------------
  3D Classroom     Renders interactive 3D   React Three Fiber (R3F),
  Engine           environment; maps        Three.js, Next.js 14,
                   concepts to spatial      pre-built low-poly Blender
                   objects; handles user    models, hosted on Vercel
                   interactions             

  AI Adaptive      Tracks knowledge state,  TypeScript, Vercel AI SDK,
  Engine           cognitive state, and     Claude API via Vercel AI SDK,
                   learning preferences;    Supabase PostgreSQL for state,
                   determines next content  spaced repetition algorithm
                   and difficulty; drives   
                   room transformations     

  Web Scraper      Continuously discovers   Vercel serverless functions,
  Agent            fresh, relevant learning LLM-based quality scoring,
                   resources; ranks by      Supabase for caching results,
                   quality and recency;     async pipeline
                   populates the 3D         
                   bookshelf                
  ------------------------------------------------------------------------

## **3.2 Tech Stack (Supabase + Vercel)**

  ------------------------------------------------------------------------
  **Layer**        **v4 (AWS)**             **v5 (Supabase + Vercel)**
  ---------------- ------------------------ ------------------------------
  Frontend Hosting AWS Amplify              Vercel (instant deploy,
                                            preview branches, edge
                                            network)

  Frontend         Next.js 14 + R3F +       Next.js 14 (App Router) +
  Framework        Tailwind CSS             React Three Fiber + Tailwind
                                            CSS (unchanged)

  Backend API      Amazon API Gateway + AWS Next.js API routes on Vercel
                   Lambda                   (serverless functions)

  AI / LLM         Amazon Bedrock (Claude,  Claude API via Vercel AI SDK
                   GPT-4, Llama)            (streaming built-in)

  AI SDK           AWS SDK v3 + Bedrock     Vercel AI SDK (TypeScript,
                   Runtime                  streaming, tool use)

  Database         Amazon DynamoDB          Supabase PostgreSQL
                                            (relational, real-time
                                            subscriptions, Row-Level
                                            Security ready for production)

  File Storage     Amazon S3                Supabase Storage
                                            (S3-compatible, presigned
                                            URLs, CDN)

  Real-time /      API Gateway WebSocket    Vercel AI SDK streaming +
  Streaming                                 Supabase Realtime (WebSocket
                                            subscriptions)

  Search API       Amazon Kendra / Lambda + Vercel serverless functions +
  (Scraper)        external APIs            external search APIs
                                            (SerpAPI/Tavily)

  Agent            AWS Step Functions +     Vercel serverless functions
  Orchestration    Lambda                   with async chaining / Inngest
                                            (optional)

  Authentication   Amazon Cognito (mock)    Supabase Auth (mock for
                                            hackathon, production-ready
                                            with OAuth, magic links)

  Monitoring       Amazon CloudWatch        Vercel Analytics + Supabase
                                            Dashboard + console logging

  CDN              Amazon CloudFront        Vercel Edge Network
                                            (automatic, zero-config)

  State Management Zustand + DynamoDB       React Context + Zustand
                                            (client) + Supabase PostgreSQL
                                            (server persistence)

  Deployment       AWS Amplify + SAM/CDK    Vercel (git push to deploy,
                                            zero-config)
  ------------------------------------------------------------------------

## **3.3 Stack Rationale**

The migration from AWS to Supabase + Vercel provides critical advantages
for a 24-hour hackathon:

- **Vercel AI SDK** provides streaming LLM responses, tool calling, and
  multi-model support with 5 lines of code --- no Lambda/WebSocket
  plumbing needed.

- **Supabase** gives us PostgreSQL, auth, file storage, and real-time
  subscriptions from a single dashboard with instant setup. No IAM
  roles, no DynamoDB table provisioning, no CloudFront distributions.

- **Next.js API routes on Vercel** deploy as serverless functions
  automatically. No API Gateway configuration, no Lambda cold start
  tuning.

- **Vercel Edge Network** serves 3D assets globally with zero-config
  CDN. No CloudFront setup.

- **Supabase PostgreSQL** supports relational queries (JOINs for concept
  prerequisites), JSON columns, and real-time subscriptions --- features
  DynamoDB lacks.

- **RevisionDojo recommends Vercel AI SDK** (per hackathon resource
  page), aligning with award strategy.

- **Developer velocity:** git push = deployed. The team can focus on
  features, not infrastructure.

# **4. 3D Classroom Specification**

The 3D classroom is a stylized, low-poly virtual room rendered in the
browser via React Three Fiber. Each object in the room serves as an
interactive learning hotspot. 3D assets are served via Vercel's Edge
Network for optimal loading performance.

## **4.1 Interactive Objects**

  ------------------------------------------------------------------------
  **Object**   **Learning Function**          **Interaction Behavior**
  ------------ ------------------------------ ----------------------------
  Whiteboard   Displays concept map. Nodes    Click node → AI explanation
               color-coded by mastery: red    panel. Hover → mastery
               (0--30%), yellow (31--69%),    tooltip. Rearranges as
               green (70--100%). Click a node mastery changes.
               to get an AI explanation via   
               Claude.                        

  Desk         Personal workspace. Pending    Click → adaptive study
               assignments, current study     session. Papers glow when
               session, AI-generated notes.   review due. Clutter
               Papers represent active review decreases with mastery.
               items.                         

  Bookshelf    Populated by AI web scraper    Click book → resource
               agent. Each book = curated     preview. New books glow.
               resource (article, video,      Weak-topic books promoted to
               paper). Ranked by relevance    front.
               and freshness.                 

  Lab Bench    Hands-on challenges. CS: code  Click → challenge panel.
               challenges, drag-and-drop      Difficulty adapts based on
               sorting. Other subjects:       mastery. Completion updates
               labeling, matching,            state in Supabase.
               sequencing.                    

  Quiz Board   AI-generated quizzes via       Click → quiz modal. Adapts
               Claude. Prioritizes 30--70%    in real-time. Tracks error
               mastery zone (zone of proximal patterns. Spaced repetition.
               development) for max learning  
               impact.                        

  Window       Progress dashboard as the      Click → full dashboard
               room's outside view. Mastery   overlay. Weather improves
               overview, streak, time         with progress (visual
               studied, next review schedule. metaphor).

  AI Tutor     Floating avatar serving as     Click → chat panel with
               adaptive tutor powered by      streaming responses.
               Claude via Vercel AI SDK.      Initiates check-ins. Adapts
               Knows learning style, weak     language/depth to learner
               areas, energy state.           profile.
  ------------------------------------------------------------------------

## **4.2 Room Adaptation Behaviors**

- **Deep Focus Mode:** Room dims, fewer distractions, ambient sounds
  soften, tutor backs off. Triggered by "Focused" check-in or behavioral
  signals.

- **Drift Mode:** Objects glow to invite interaction, tutor suggests lab
  bench, more stimulating environment. Triggered by "Drifting" check-in.

- **Mastery Progression:** Desk clutter reduces, whiteboard organizes,
  window view brightens as concepts go from red to green.

- **Prerequisite Locking:** Doors/areas grayed out when prerequisites
  unmet. Unlocking feels like game progression.

# **5. Adaptive Learning Engine**

The adaptive engine is the intelligence layer that drives all
personalization. It maintains a real-time learner model persisted in
Supabase PostgreSQL and decides what to teach, how to teach it, and when
to intervene. LLM calls are routed through Vercel AI SDK to Claude.

## **5.1 Layer 1: Knowledge State Tracking**

**5.1.1 Data Model (Supabase PostgreSQL Schema)**

  ------------------------------------------------------------------------
  **Field**        **Type**           **Description**
  ---------------- ------------------ ------------------------------------
  id               uuid (PK)          Auto-generated primary key

  concept_id       text               Unique identifier (e.g.,
                                      \"binary_search\")

  user_id          uuid (FK →         Learner identifier from Supabase
                   auth.users)        Auth

  mastery          integer (0--100)   Current mastery score. 0 = never
                                      seen, 100 = fully mastered

  attempts         integer            Total quiz/exercise attempts for
                                      this concept

  last_seen        timestamptz        When this concept was last
                                      studied/reviewed

  error_patterns   text\[\]           Specific misconceptions (e.g.,
                                      \"off-by-one\", \"base case
                                      confusion\")

  preferred_mode   text               Best modality: visual, analogy,
                                      step-by-step, socratic

  prerequisites    text\[\]           Concept IDs that must reach \>70%
                                      mastery before this unlocks
  ------------------------------------------------------------------------

**5.1.2 Mastery Update Rules**

- Correct quiz answer: mastery += 10--15 (scaled by difficulty)

- Incorrect quiz answer: mastery -= 5 (never below 0); error pattern
  logged

- Completed explanation read: mastery += 5

- Clicked "explain differently": mastery unchanged; modality preference
  updated

- Completed hands-on challenge: mastery += 15--20

- Time decay: mastery slowly decreases if not reviewed (spaced
  repetition curve)

## **5.2 Layer 2: Cognitive State Adaptation**

Tracks how the student's brain is performing right now --- not just what
they know. This is the neurodivergent-specific differentiator.

**5.2.1 Explicit Check-ins**

  ------------------------------------------------------------------------
  **State**    **System Response**            **Room Behavior**
  ------------ ------------------------------ ----------------------------
  Focused      Longer, deeper chunks. Harder  Room dims. Ambient sounds
               quizzes. Fewer interruptions.  soften. Tutor backs off.

  Okay         Maintain current settings.     Room stays neutral.
               Standard chunks and            
               difficulty.                    

  Drifting     Shorter chunks, more visual    Objects glow. Tutor suggests
               content, interactive           activity change. More
               challenges. Suggest lab bench. stimulating.

  Done         Generate session summary.      Calming state. Progress
               Schedule next review.          summary at window.
               Celebrate progress.            
  ------------------------------------------------------------------------

**5.2.2 Implicit Behavioral Signals**

  ------------------------------------------------------------------------
  **Signal**            **Interpretation**     **System Action**
  --------------------- ---------------------- ---------------------------
  Time on chunk \< 30%  Skimming or already    Increase difficulty or skip
  avg                   familiar               to quiz

  Time on chunk \> 200% Stuck or confused      Offer simpler explanation
  avg                                          or switch modality

  3+ \"explain          Current modality not   Switch to preferred mode;
  differently\" clicks  working                flag as difficult

  Fast + correct quiz   Strong mastery, fluent Boost score; suggest
  answers               recall                 advancing

  Slow + correct        Understanding but not  Schedule additional
                        fluent                 practice

  Fast + incorrect      Guessing or careless   Suggest slowing down;
                                               re-present concept
  ------------------------------------------------------------------------

## **5.3 Layer 3: Learning Path Adaptation**

**5.3.1 Prerequisite-Aware Sequencing**

The AI extracts concept dependencies from uploaded material using Claude
via Vercel AI SDK. If a student attempts a concept without mastering
prerequisites (\>70%), the system redirects them. In 3D: locked
doors/grayed areas that unlock when prerequisites are met.

**5.3.2 Multi-Modal Rotation**

Four explanation modes per concept: visual diagram/analogy, step-by-step
breakdown, real-world example, Socratic questioning. The system learns
which mode works best for each student and leads with it.

**5.3.3 Spaced Repetition with Spatial Context**

Unlike Anki, FocusFlow brings students back to the 3D location where
they first learned the concept. Spatial context triggers memory recall
(memory palace effect).

## **5.4 Adaptive Engine Architecture**

  ---------------------------------------------------------------------------
  **Function**             **Responsibility**           **Technology**
  ------------------------ ---------------------------- ---------------------
  updateKnowledgeState()   Receives interaction events. Next.js API route +
                           Updates mastery scores,      Supabase PostgreSQL
                           error patterns, modality     
                           preferences.                 

  assessCognitiveState()   Analyzes check-in responses  Next.js API route +
                           and behavioral signals.      Claude via Vercel AI
                           Returns cognitive state and  SDK
                           session parameters.          

  getNextAction()          Determines: next content,    Next.js API route +
                           difficulty, modality, chunk  Claude + Supabase
                           size, room transformation    query
                           instructions.                
  ---------------------------------------------------------------------------

# **6. AI Web Scraper Agent**

## **6.1 Agent Pipeline**

- **Step 1 --- Topic Extraction:** Claude extracts core topics from
  uploaded material stored in Supabase Storage.

- **Step 2 --- Search Execution:** Vercel serverless function queries
  web search APIs (SerpAPI/Tavily) targeting articles, papers, YouTube,
  docs, Stack Overflow.

- **Step 3 --- Quality Scoring:** Each result scored on relevance,
  recency, authority, and educational value using Claude.

- **Step 4 --- Curation:** Top results surfaced on 3D bookshelf, ordered
  by composite score. Weak-topic resources promoted. Results stored in
  Supabase.

- **Step 5 --- Continuous Refresh:** In production, Vercel Cron Jobs
  trigger periodic re-scraping. New discoveries get "New!" tag and glow
  animation.

## **6.2 Pitch Angle**

*"Your textbook is from 2022. The field moved on yesterday. Our agent
makes sure you never study outdated information."*

# **7. Team Roles and Responsibilities**

Six team members, all builders, no dedicated pitch role. Demo and
presentation tasks are distributed by domain: the person who built it
explains it.

## **7.0 Role Overview and Demo Distribution**

  -----------------------------------------------------------------------------
  **Person**   **Build Role**   **Demo/Pitch                **Submission Copy**
                                Responsibility**            
  ------------ ---------------- --------------------------- -------------------
  P1           3D World Builder Records 3D walkthrough      3D/engagement
                                video; writes spatial       section of all
                                memory talking points       submissions

  P2           AI Backend Lead  Pre-caches APIs for demo;   Main Awards
                                creates architecture        submission copy
                                slides; runs live demo      

  P3           Web Scraper      Caches scraper results for  OAX Foundation
               Agent            demo; researches            submission copy
                                competitors and market      
                                stats                       

  P4           Frontend / Core  Builds quiz, study session, RevisionDojo
               Panels           bookshelf, upload panels;   submission copy
                                takes polished screenshots  

  P5           UX, Design &     Designs pitch deck; creates Pitch deck design
               A11y             before/after visuals;       for all awards
                                accessibility audit         

  P6           Adaptive Engine  Demo coordinator; writes    HKUST EC submission
               & Integration    pitch script; runs          copy
                                rehearsal; handles          
                                submission upload           
  -----------------------------------------------------------------------------

## **7.1 Person 1: 3D World Builder**

  -----------------------------------------------------------------------
  **Attribute**      **Details**
  ------------------ ----------------------------------------------------
  Core Skills        React Three Fiber, Three.js, Blender (basic), 3D
                     interaction design

  Primary Output     Functional 3D classroom with 7 interactive objects,
                     visual feedback, room adaptation animations

  Demo Role          Records 3D walkthrough demo video (best camera
                     angles); writes spatial memory pitch talking points
  -----------------------------------------------------------------------

**Hour-by-Hour Tasks**

  -------------------------------------------------------------------------
  **Hours**   **Task**
  ----------- -------------------------------------------------------------
  0--2        Load pre-built low-poly classroom model into R3F. Set up
              camera controls. Verify browser rendering.

  2--6        Make all 7 objects clickable with hover highlights and click
              animations. Implement event dispatch (onClick → React state).
              Add labels/tooltips.

  6--10       Visual feedback: whiteboard color-coding (red/yellow/green),
              bookshelf glow, desk paper stacking, quiz board pins.

  10--14      Room adaptation: deep focus mode (dimming), drift mode
              (glowing/stimulating), prerequisite door locking/unlocking.

  14--16      Polish: ambient lighting, particle effects, smooth camera
              transitions, performance optimization.

  16--18      DEMO: Screen record the 3D walkthrough. Multiple takes with
              best camera angles for each interaction.

  18--20      DEMO: Edit footage. Write spatial memory and engagement
              talking points. Prepare 3D Q&A answers.

  20--24      Bug fixes. Support final demo recording. Final visual polish.
  -------------------------------------------------------------------------

## **7.2 Person 2: AI Backend Lead**

  -----------------------------------------------------------------------
  **Attribute**      **Details**
  ------------------ ----------------------------------------------------
  Core Skills        TypeScript, Vercel AI SDK, Claude API, Next.js API
                     routes, prompt engineering

  Primary Output     Content ingestion pipeline, quiz generation API,
                     multi-modal explanation API, AI tutor chat endpoint
                     --- all on Next.js API routes with Vercel AI SDK

  Demo Role          Runs the live demo; pre-caches APIs; creates
                     architecture slides; drafts Main Awards submission
  -----------------------------------------------------------------------

**Hour-by-Hour Tasks**

  -------------------------------------------------------------------------
  **Hours**   **Task**
  ----------- -------------------------------------------------------------
  0--2        Set up Next.js API routes. Configure Claude API key with
              Vercel AI SDK. Create upload endpoint (Supabase Storage).
              Test basic streaming LLM call.

  2--8        Build content ingestion: Supabase Storage upload → Claude
              concept extraction via Vercel AI SDK → knowledge graph with
              prerequisites. Output: structured JSON to Supabase
              PostgreSQL.

  8--12       Build quiz generation API route (concept + difficulty →
              Claude → questions). Build multi-modal explanation API route
              (concept + mode → explanation).

  12--16      Build AI tutor chat with streaming via Vercel AI SDK useChat
              hook. Integrate with learner model in Supabase. Build session
              summary generation.

  16--18      DEMO: Pre-cache all API responses in Supabase for demo
              content. Create technical architecture slide content.

  18--20      DEMO: Write Main Awards submission copy. Prepare technical
              Q&A answers. Test live demo with cached fallbacks.

  20--24      Optimize for speed. Ensure fallback responses cached in
              Supabase. Final bug fixes.
  -------------------------------------------------------------------------

## **7.3 Person 3: AI Agent / Web Scraper**

  -----------------------------------------------------------------------
  **Attribute**      **Details**
  ------------------ ----------------------------------------------------
  Core Skills        TypeScript/Python, web scraping, API integration,
                     async programming

  Primary Output     Web scraper agent: discovers resources,
                     quality-scores with Claude, surfaces via bookshelf
                     API from Supabase

  Demo Role          Caches scraper results for demo in Supabase;
                     researches competitors; writes OAX Foundation
                     submission copy
  -----------------------------------------------------------------------

**Hour-by-Hour Tasks**

  -------------------------------------------------------------------------
  **Hours**   **Task**
  ----------- -------------------------------------------------------------
  0--2        Set up web search API (SerpAPI/Tavily). Build basic search
              function in Next.js API route: topic in, results out.

  2--8        Build agent loop: topic list → search queries → execute →
              parse. Quality scoring: relevance (Claude via Vercel AI SDK),
              recency, authority.

  8--12       Build curation API: top N resources per topic from Supabase,
              sorted by score. Content type detection. AI summaries per
              resource.

  12--16      Integrate with P2's topic extraction. Auto-trigger scraper on
              upload. Build "refresh" endpoint.

  16--18      DEMO: Pre-run scraper for demo topics and cache results in
              Supabase. Research competitor landscape (Quizlet, Anki,
              Notion AI).

  18--20      DEMO: Write OAX Foundation submission copy (content freshness
              angle). Compile market size statistics.

  20--24      Ensure scraper reliable for demo with cached fallback from
              Supabase. Bug fixes.
  -------------------------------------------------------------------------

## **7.4 Person 4: Frontend / Core Interaction Panels**

  -----------------------------------------------------------------------
  **Attribute**      **Details**
  ------------------ ----------------------------------------------------
  Core Skills        React, Next.js, Tailwind CSS, component
                     architecture, API integration

  Primary Output     Core interaction panels: quiz modal, study session
                     panel, bookshelf browser, upload/onboarding screen,
                     AI tutor chat

  Demo Role          Takes polished screenshots; writes RevisionDojo
                     submission copy (adaptive learning + neurodivergent
                     UX angle)
  -----------------------------------------------------------------------

**Hour-by-Hour Tasks**

  -------------------------------------------------------------------------
  **Hours**   **Task**
  ----------- -------------------------------------------------------------
  0--2        Set up overlay panel system (modal container rendering above
              3D scene). Coordinate with P5 on shared component library and
              design tokens.

  2--8        Build quiz modal (question display, answer input, feedback
              animation). Build study session panel (content chunks,
              "explain differently" with 4 modes, session progress). Build
              upload screen (Supabase Storage presigned URL upload).

  8--14       Build bookshelf browser (resource cards, type icons,
              relevance scores, AI summaries, link-out). Build AI tutor
              chat panel with streaming responses via Vercel AI SDK
              useChat.

  14--16      Connect all panels to live APIs (replace hardcoded data).
              Integration testing with P1's 3D click events.

  16--18      DEMO: Take polished screenshots of all panels. Ensure UI is
              pixel-perfect for pitch deck and submission.

  18--20      DEMO: Write RevisionDojo submission copy (adaptive learning +
              neurodivergent UX + pedagogy angle).

  20--24      Final panel polish. Ensure everything renders for demo. Bug
              fixes.
  -------------------------------------------------------------------------

## **7.5 Person 5: UX, Design & Accessibility Lead**

  -----------------------------------------------------------------------
  **Attribute**      **Details**
  ------------------ ----------------------------------------------------
  Core Skills        UI/UX design, accessibility (a11y), Tailwind CSS,
                     Figma/Canva, presentation design, responsive design

  Primary Output     Design system, progress dashboard, energy check-in
                     UI, session summary view, neurodivergent-friendly
                     theming, accessibility compliance, pitch deck slides

  Demo Role          Designs and builds the pitch deck; creates
                     before/after visuals and impact slides; runs
                     accessibility audit
  -----------------------------------------------------------------------

**Hour-by-Hour Tasks**

  -------------------------------------------------------------------------
  **Hours**   **Task**
  ----------- -------------------------------------------------------------
  0--2        Create shared design system with P4: color palette (calm,
              neurodivergent-friendly), typography (dyslexia-friendly font
              options), spacing tokens, component styles in Tailwind.

  2--8        Build progress dashboard (mastery overview, streak, time
              studied, next review schedule, weather metaphor). Build
              energy check-in UI (clean, non-intrusive 4-option selector
              with animations).

  8--14       Build session summary view (exportable notes in
              bullet/mind-map/narrative format). Build high-contrast mode
              toggle and dyslexia-friendly font switcher. Responsive layout
              adjustments.

  14--16      Full accessibility audit: keyboard navigation, screen reader
              support, ARIA labels, color contrast (WCAG AA). Fix issues
              across all panels.

  16--18      DEMO: Design and build pitch deck slides (Canva/Google
              Slides). Create before/after comparison visuals. Design
              problem/impact statistics slides.

  18--20      DEMO: Finalize pitch deck with real screenshots from P4.
              Create any additional visual assets. Support P6 with pitch
              narrative layout.

  20--24      Final design polish across all panels and the pitch deck. Bug
              fixes on accessibility issues.
  -------------------------------------------------------------------------

## **7.6 Person 6: Adaptive Engine, Integration & Demo Coordinator**

  -----------------------------------------------------------------------
  **Attribute**      **Details**
  ------------------ ----------------------------------------------------
  Core Skills        Full-stack TypeScript, Zustand/Context, Supabase
                     client, system architecture, project coordination

  Primary Output     Adaptive engine (3 core API routes), Zustand store,
                     Supabase schema setup, end-to-end integration, demo
                     coordination

  Demo Role          Demo coordinator: owns pitch script, runs rehearsal,
                     writes HKUST EC submission, handles final submission
                     upload to all 4 awards
  -----------------------------------------------------------------------

**Hour-by-Hour Tasks**

  --------------------------------------------------------------------------
  **Hours**   **Task**
  ----------- --------------------------------------------------------------
  0--2        Deploy skeleton to Vercel. Set up Supabase project: create
              PostgreSQL tables (learner model schema), configure storage
              buckets. Define API route contracts for all members.

  2--8        Build updateKnowledgeState() API route: receives interaction
              events, updates mastery/errors/modality in Supabase
              PostgreSQL. Build mastery color-coding logic.

  8--14       Build assessCognitiveState() and getNextAction() API routes.
              Decision engine: content selection, difficulty, modality,
              chunk size, room transformation commands via Claude.

  14--16      Build spaced repetition scheduler. Prerequisite locking logic.
              Connect adaptive engine to P1's 3D room. E2E integration
              testing.

  16--18      DEMO: Write full pitch script narrative. Collect pitch content
              from all members. Begin assembling final pitch with P5.

  18--20      DEMO: Write HKUST EC submission copy (startup angle). Run full
              team demo rehearsal --- time it, identify weak points, fix
              flow.

  20--22      Final E2E integration. Verify Vercel deployment stable. Fix
              critical bugs from rehearsal.

  22--24      SUBMIT: Upload demo video to all 4 award categories with
              tailored copy. Verify submissions. Backup everything.
  --------------------------------------------------------------------------

# **8. Master Timeline (24 Hours)**

  ----------------------------------------------------------------------------------------
  **Phase**   **P1: 3D** **P2: AI**  **P3:         **P4:         **P5:         **P6:
                                     Scraper**     Frontend**    UX/A11y**     Engine**
  ----------- ---------- ----------- ------------- ------------- ------------- -----------
  0--2h       Load 3D    API setup + Search API    Panel system  Design system Vercel +
              model      AI SDK                                                Supabase

  2--8h       Clicks +   Ingestion   Agent +       Quiz + study  Dashboard +   Knowledge
              anims      pipe        scoring                     checkin       state

  8--14h      Visual     Quiz +      Curation API  Bookshelf +   Summary +     Cognitive
              feedback   explain                   chat          a11y          state

  14--16h     Room adapt Tutor +     Integration   API connect   A11y audit    Spaced rep
                         streaming                                             

  16--18h     Record     Cache APIs  Cache +       Screenshots   Pitch deck    Pitch
              video                  research                                  script

  18--20h     Edit + Q&A Main Awards OAX copy      RevDojo copy  Deck finalize HKUST EC
                                                                               copy

  20--22h     Bug fixes  Bug fixes   Bug fixes     Bug fixes     Design polish E2E +
                                                                               rehearsal

  22--24h     Final      Final       Cache         Final polish  Deck polish   SUBMIT ALL
              polish     polish      fallback                                  
  ----------------------------------------------------------------------------------------

Yellow rows (16--20h): Demo/pitch phase. All members transition from
building to presenting. No new features after hour 16. Red rows
(22--24h): Final submission window.

## **8.1 Critical Milestones**

  -------------------------------------------------------------------------
  **Hour**   **Milestone**                               **Gate**
  ---------- ------------------------------------------- ------------------
  Hour 2     3D room renders with clickable objects.     GO / NO-GO
             Claude returns LLM response via Vercel AI   
             SDK. Vercel deployed. Supabase tables       
             created.                                    

  Hour 8     Full pipeline: upload PDF to Supabase       DEMO CHECK
             Storage → concepts on whiteboard. Quiz      
             modal with Claude-generated questions.      

  Hour 14    Adaptive features visible: mastery colors,  DEMO CHECK
             energy check-in, bookshelf populated by     
             scraper.                                    

  Hour 16    FEATURE FREEZE. All members transition to   FREEZE
             demo/pitch. Product must be demo-ready.     

  Hour 20    All submission copy written. Demo video     PITCH READY
             recorded. Pitch deck complete. Rehearsal    
             done.                                       

  Hour 22    All submissions uploaded. Backup copies     SUBMITTED
             saved.                                      
  -------------------------------------------------------------------------

# **9. MVP vs. Stretch Features**

## **9.1 Must-Have (Build or Don't Submit)**

1.  3D classroom with at least 5 working interactive objects

2.  Content upload pipeline (PDF → Supabase Storage → Claude concept
    extraction → knowledge graph)

3.  Knowledge state tracking with visual mastery indicators
    (red/yellow/green) persisted in Supabase PostgreSQL

4.  Adaptive quiz difficulty based on mastery score (Claude-generated)

5.  Energy check-in that changes content delivery (chunk size, mode)

6.  "Explain Differently" with at least 3 modalities via Claude

7.  Web scraper agent populating the bookshelf

8.  Demo video and submissions for all 4 award categories

## **9.2 Should-Have (If Time Permits)**

- Room visual adaptation (deep focus / drift mode environment changes)

- Prerequisite locking/unlocking with door animations

- Spaced repetition scheduling across sessions

- Session summary export (bullet points, mind map, narrative)

- Implicit behavioral signal tracking (time-on-task, click patterns)

- High-contrast mode and dyslexia-friendly font switcher

## **9.3 Skip Entirely**

- Real user authentication (use mock login via Supabase Auth)

- Row-Level Security (disable for hackathon --- production concern only)

- Mobile app (responsive web is fine)

- Gamification/points/leaderboards

- Social/collaborative features

- VR/AR integration

- ML models for prediction (rule-based logic is fine for demo)

# **10. Demo and Pitch Strategy**

## **10.1 Pitch Script (3--5 Minutes)**

**The Hook (30 seconds)**

*"Raise your hand if you've ever zoned out staring at a study app. Now
imagine walking into a classroom built from your actual lecture slides.
The whiteboard shows your key concepts. The bookshelf has resources an
AI agent found this morning. You click the lab bench and a challenge
appears. Your AI tutor suggests a break --- because it knows you have
ADHD, like I do. We built FocusFlow because every study tool we tried
was designed for neurotypical brains. Learning should be a place you
explore, not a page you scroll."*

**The Problem (30 seconds)**

Show a wall of lecture slides. 15--20% of university students are
neurodivergent. Current tools assume sustained attention and
text-dominant learning. Result: disengagement and poor outcomes for
smart students.

**The Live Demo (2 minutes)**

Upload real CS slides to Supabase Storage. Show concepts populating the
whiteboard via Claude extraction. Click a concept → AI explanation. Hit
"explain differently" → visual analogy. Quiz board → answer wrong →
mastery drops in Supabase. Energy check-in → "Drifting" → room
transforms. Bookshelf → fresh scraped resources.

**The Impact (30 seconds)**

*"1 in 5 university students are neurodivergent. The adaptive learning
market reaches \$8 billion by 2028. Every university needs this."*

**The Close (30 seconds)**

*"No two students will ever see the same classroom. Because no two
brains learn the same way."*

## **10.2 Submission Strategy**

- **RevisionDojo (P4):** Lead with pedagogy, neurodivergent-first UX,
  zone of proximal development, multi-modal learning, accessibility.
  Note: built with Vercel AI SDK as recommended.

- **OAX Foundation (P3):** Lead with AI web scraper, content freshness,
  intelligent curation, personalized learning paths.

- **Main Awards (P2):** Lead with technical execution, 3D + adaptive +
  AI agents, clean architecture, real-world impact.

- **HKUST EC (P6):** Lead with entrepreneurial potential, \$8B market,
  underserved neurodivergent audience, growth beyond hackathon.

## **10.3 Q&A Preparation**

  -----------------------------------------------------------------------
  **Likely Question**    **Prepared Answer**
  ---------------------- ------------------------------------------------
  How is this different  Three differentiators: spatial memory (concepts
  from existing tools?   in places), active content curation (AI
                         scraper), neurodivergent-first design (not an
                         afterthought).

  What's the business    Freemium B2C + B2B university licensing.
  model?                 Adaptive engine data is the moat.

  How does 3D add        Spatial memory is real neuroscience (memory
  educational value?     palace). 40% better recall. Spatial interaction
                         more engaging for ADHD brains.

  Can it scale to other  Content pipeline is subject-agnostic. Upload any
  subjects?              PDF. Claude extracts concepts. 3D objects work
                         for any domain.

  Low-end devices?       Lightweight low-poly runs on any modern browser.
                         Vercel Edge Network ensures fast loading
                         globally. 2D fallback preserves all adaptive
                         features.

  Why Supabase + Vercel? Speed of development: Supabase gives us
                         PostgreSQL, auth, storage, and real-time from
                         one dashboard. Vercel AI SDK gives us streaming
                         LLM responses in 5 lines. We shipped a complete
                         product in 24 hours because we weren't fighting
                         infrastructure.
  -----------------------------------------------------------------------

# **11. Pre-Hackathon Checklist**

## **11.1 Assets**

- Download/build low-poly classroom 3D model (Sketchfab)

- Prepare individual object models or extraction plan

- Create Figma mockups of all UI panels

- Prepare sample lecture PDF for demo

## **11.2 Technical (Supabase + Vercel Setup)**

- GitHub repo with Next.js 14 + React Three Fiber boilerplate

- Vercel project created and connected to GitHub repo

- Supabase project created with PostgreSQL tables (learner model schema)

- Supabase Storage buckets created (pdf-uploads, scraper-cache)

- Claude API key obtained and added to Vercel environment variables

- Web search API key obtained (SerpAPI or Tavily)

- Vercel AI SDK installed and streaming endpoint tested

- R3F tested with classroom model loading

- Zustand store with learner model schema matching Supabase tables

- Supabase client configured in Next.js (supabase-js)

- RLS disabled on all tables (hackathon only)

## **11.3 Team**

- Every member reads this PRD and understands their role + demo
  responsibilities

- API contracts agreed: Next.js API route endpoints, request/response
  shapes, Supabase table schemas

- Slack/Discord channel set up

- Git branching strategy agreed (one branch per person, merge at
  milestones)

- Decide who delivers the live pitch (strongest speaker + personal
  story)

- Supabase project access shared with all team members

- Plan food, caffeine, and break schedules

# **12. Risk Management**

  ------------------------------------------------------------------------------
  **Risk**        **Severity**   **Mitigation**           **Fallback**
  --------------- -------------- ------------------------ ----------------------
  3D takes too    HIGH           Room \"good enough\" by  2D isometric view with
  long                           hour 6. No polish until  same interactions.
                                 hour 14.                 Adaptive features
                                                          still work.

  LLM slow during HIGH           Pre-cache responses in   Pre-recorded demo
  demo                           Supabase. Use Vercel AI  video backup. Cached
                                 SDK streaming for        fallbacks from
                                 progressive loading.     Supabase.

  Integration     HIGH           P6 runs integration      Demo features
  breaks at hr 16                checks at hours 8, 14,   independently with
                                 16.                      mock data from
                                                          Supabase.

  Pitch quality   HIGH           P6 coordinates. Clear    Pre-recorded video
  without                        ownership in Section     instead of live demo.
  dedicated lead                 7.0. Hard freeze at hour Shorter pitch.
                                 16.                      

  P4/P5 frontend  MEDIUM         Clear split: P4 = core   Either person can pick
  overlap                        panels, P5 =             up the other's work if
                                 dashboard/design/a11y.   needed.
                                 Shared design system     
                                 from hour 0.             

  Web scraper     MEDIUM         Cache aggressively in    Pre-cached results
  rate limited                   Supabase. Pre-run for    from Supabase for
                                 demo topics.             demo.

  Supabase free   MEDIUM         Monitor usage in         Local JSON fallback
  tier limits                    Supabase dashboard.      files served from
                                 Database and storage     public directory.
                                 free tiers are generous  
                                 for demo.                

  Burnout at hour MEDIUM         15-min breaks every 4    Feature freeze early.
  16                             hours. Hour 16 shift to  Perfect what exists.
                                 demo is a mental reset.  
  ------------------------------------------------------------------------------

# **13. Success Criteria**

## **13.1 Minimum Viable Demo**

- Upload PDF to Supabase Storage → concepts appear on 3D whiteboard via
  Claude extraction

- Click concept → AI explanation from Claude with "explain differently"
  in 3+ modes

- Quiz board adapts difficulty based on mastery (Supabase PostgreSQL
  state)

- Energy check-in visibly changes session (chunk size, content type)

- Bookshelf shows real resources from web scraper

- Demo video recorded and submitted to all 4 award categories

## **13.2 Award-Winning Demo**

All of the above, plus:

- Room visually adapts to cognitive state (focus vs drift)

- Prerequisite locking creates game-like progression

- AI tutor proactively suggests activities via Claude

- Session summaries are exportable

- Accessibility features (high contrast, dyslexia fonts) are live

- Pitch tells a compelling personal neurodivergent story

- Live demo runs smoothly with no visible failures

# **14. Technology Stack Summary**

Complete list of technologies used in FocusFlow 3D v5 and their roles:

  ------------------------------------------------------------------------
  **Technology**     **Role in FocusFlow 3D**           **Replaces (v4
                                                        AWS)**
  ------------------ ---------------------------------- ------------------
  Vercel             Frontend hosting, serverless API   AWS Amplify +
                     routes, edge network CDN, CI/CD    CloudFront +
                     via git push                       Lambda + API
                                                        Gateway

  Vercel AI SDK      Streaming LLM responses, tool      AWS SDK v3 +
                     calling, useChat React hook,       Bedrock Runtime +
                     multi-model support                API Gateway
                                                        WebSocket

  Claude API         Content extraction, quiz           Amazon Bedrock
                     generation, explanations,          (same models,
                     tutoring, quality scoring          different access
                                                        path)

  Next.js 14         Full-stack React framework with    Next.js 14
                     App Router, API routes, server     (unchanged)
                     components                         

  React Three Fiber  3D classroom rendering,            React Three Fiber
                     interactive objects, animations    (unchanged)

  Supabase           Learner state persistence, mastery Amazon DynamoDB
  PostgreSQL         data, session history, scraper     
                     results, concept graphs with       
                     relational queries                 

  Supabase Storage   PDF uploads, 3D asset hosting,     Amazon S3
                     scraper cache, pre-cached demo     
                     responses                          

  Supabase Auth      User authentication (mock for      Amazon Cognito
                     hackathon, production-ready with   
                     OAuth/magic links)                 

  Supabase Realtime  WebSocket subscriptions for live   API Gateway
                     state updates                      WebSocket

  Zustand            Client-side state management for   Zustand
                     learner model and UI state         (unchanged)

  Tailwind CSS       Utility-first styling,             Tailwind CSS
                     neurodivergent-friendly theming,   (unchanged)
                     responsive design                  

  SerpAPI / Tavily   Web search API for scraper agent   Same (external
                                                        search APIs)

  Vercel Cron Jobs   Scheduled triggers for periodic    Amazon EventBridge
                     content refresh (production)       
  ------------------------------------------------------------------------
