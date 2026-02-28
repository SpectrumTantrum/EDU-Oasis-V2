'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useEffect } from 'react';
import { useFocusFlowStore } from '@/store/useFocusFlowStore';
import { createClient } from '@/lib/supabase/client';
import { UploadPanel } from '@/components/panels/UploadPanel';
import { QuizPanel } from '@/components/panels/QuizPanel';
import { StudyPanel } from '@/components/panels/StudyPanel';
import { TutorPanel } from '@/components/panels/TutorPanel';
import { BookshelfPanel } from '@/components/panels/BookshelfPanel';
import { CognitiveCheckIn } from '@/components/panels/CognitiveCheckIn';
import { WhiteboardPanel } from '@/components/panels/WhiteboardPanel';
import { Button } from '@/components/ui/button';
import MasteryBar from '@/components/hud/MasteryBar';
import ControlsHint from '@/components/hud/ControlsHint';
import type { NPC } from '@/components/game/NPC';
import type { GameState } from '@/components/game/GameCanvas';

const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#e8e0d0] text-[#202020]">
      <div className="text-center font-mono">
        <div className="animate-spin w-8 h-8 border-4 border-[#4080c0] border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">Loading classroom...</p>
      </div>
    </div>
  ),
});

const DialogueBox = dynamic(() => import('@/components/game/DialogueBox'), {
  ssr: false,
});

// ─── Panel Overlay ──────────────────────────────────────────────────────────

function PanelOverlay() {
  const { activePanel, setActivePanel } = useFocusFlowStore();
  const close = useCallback(() => setActivePanel(null), [setActivePanel]);

  if (!activePanel) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        {activePanel === 'upload' && <UploadPanel onClose={close} />}
        {activePanel === 'whiteboard' && <WhiteboardPanel onClose={close} />}
        {activePanel === 'study' && <StudyPanel onClose={close} />}
        {activePanel === 'quiz' && <QuizPanel onClose={close} />}
        {activePanel === 'tutor' && <TutorPanel onClose={close} />}
        {activePanel === 'bookshelf' && <BookshelfPanel onClose={close} />}
        {activePanel === 'cognitive-checkin' && (
          <div className="bg-white dark:bg-neutral-950 p-6 rounded-xl">
            <CognitiveCheckIn onClose={close} />
          </div>
        )}
        {activePanel === 'challenge' && (
          <div className="bg-white dark:bg-neutral-950 p-6 rounded-xl text-center">
            <h3 className="text-xl font-semibold mb-4">Lab Challenges</h3>
            <p className="text-neutral-500 mb-4">Interactive challenges coming soon!</p>
            <Button onClick={close}>Close</Button>
          </div>
        )}
        {activePanel === 'progress' && (
          <div className="bg-white dark:bg-neutral-950 p-6 rounded-xl text-center">
            <h3 className="text-xl font-semibold mb-4">Progress Dashboard</h3>
            <ProgressSummary />
            <Button onClick={close} className="mt-4">
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressSummary() {
  const { learnerState, knowledgeGraph, getSessionMinutes } = useFocusFlowStore();
  const concepts = Object.entries(learnerState.concepts);
  const avgMastery =
    concepts.length > 0
      ? Math.round(concepts.reduce((s, [, c]) => s + c.mastery, 0) / concepts.length)
      : 0;
  const totalConcepts = knowledgeGraph?.concepts.length ?? 0;
  const mastered = concepts.filter(([, c]) => c.mastery >= 70).length;
  const minutes = getSessionMinutes();
  const weatherLabel = avgMastery >= 70 ? 'Sunny' : avgMastery >= 40 ? 'Cloudy' : 'Rainy';

  return (
    <div className="grid grid-cols-2 gap-4 text-left">
      <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
        <div className="text-sm font-medium">Overall Mastery ({weatherLabel})</div>
        <div className="text-2xl font-bold">{avgMastery}%</div>
      </div>
      <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
        <div className="text-sm font-medium">Concepts</div>
        <div className="text-2xl font-bold">
          {mastered}/{totalConcepts}
        </div>
      </div>
      <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
        <div className="text-sm font-medium">Time Studied</div>
        <div className="text-2xl font-bold">{minutes}m</div>
      </div>
      <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
        <div className="text-sm font-medium">State</div>
        <div className="text-2xl font-bold capitalize">{learnerState.cognitive_state}</div>
      </div>
    </div>
  );
}

// ─── Adaptive Engine Sync ───────────────────────────────────────────────────

function AdaptiveSync() {
  const {
    pendingEvents,
    clearEvents,
    knowledgeGraph,
    learnerState,
    sessionParams,
    setCurrentAction,
    setConceptLocks,
  } = useFocusFlowStore();

  useEffect(() => {
    if (pendingEvents.length === 0) return;
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch('/api/adaptive/knowledge-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: pendingEvents }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.learner_state) {
            useFocusFlowStore.getState().setLearnerState(data.learner_state);
          }
        }
        clearEvents();
      } catch {
        // Retry later
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [pendingEvents, clearEvents]);

  useEffect(() => {
    if (!sessionParams || !knowledgeGraph) return;
    const fetchNextAction = async () => {
      try {
        const res = await fetch('/api/adaptive/next-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            concepts: knowledgeGraph.concepts,
            learner_state: learnerState,
            session_params: sessionParams,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentAction(data);
          if (data.prerequisite_locks) setConceptLocks(data.prerequisite_locks);
        }
      } catch {
        // Silent fail
      }
    };
    fetchNextAction();
  }, [sessionParams, knowledgeGraph, learnerState, setCurrentAction, setConceptLocks]);

  return null;
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function Home() {
  const [dialogueNPC, setDialogueNPC] = useState<NPC | null>(null);
  const { setActivePanel, learnerState, startSession, setUserId } = useFocusFlowStore();

  useEffect(() => {
    startSession();
  }, [startSession]);

  // Hydrate auth user ID into the store
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, [setUserId]);

  const cognitiveState = learnerState.cognitive_state;
  const concepts = Object.entries(learnerState.concepts);
  const avgMastery =
    concepts.length > 0
      ? Math.round(concepts.reduce((s, [, c]) => s + c.mastery, 0) / concepts.length)
      : 0;

  const handleInteract = useCallback((npc: NPC) => {
    setDialogueNPC(npc);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleGameStateChange = useCallback((_state: GameState) => {}, []);

  const handleDialogueOption = useCallback(
    (panelId: string | null) => {
      setDialogueNPC(null);
      if (panelId) {
        setActivePanel(panelId);
      }
    },
    [setActivePanel],
  );

  const handleDialogueClose = useCallback(() => {
    setDialogueNPC(null);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        if (!dialogueNPC) {
          setActivePanel('progress');
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dialogueNPC, setActivePanel]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#1a1a2e] flex flex-col">
      <MasteryBar />

      <div className="flex-1 flex items-center justify-center relative">
        <div className="relative w-full max-w-[960px] mx-auto" style={{ aspectRatio: '4/3' }}>
          <GameCanvas
            onInteract={handleInteract}
            onStateChange={handleGameStateChange}
            cognitiveState={cognitiveState}
            avgMastery={avgMastery}
          />

          {dialogueNPC && (
            <DialogueBox
              npc={dialogueNPC}
              onSelectOption={handleDialogueOption}
              onClose={handleDialogueClose}
            />
          )}
        </div>
      </div>

      <ControlsHint />

      <PanelOverlay />

      <AdaptiveSync />
    </div>
  );
}
