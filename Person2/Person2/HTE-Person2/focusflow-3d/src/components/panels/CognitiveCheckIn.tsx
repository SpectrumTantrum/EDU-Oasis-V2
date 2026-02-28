"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFocusFlowStore } from "@/store/useFocusFlowStore";
import type { CognitiveState } from "@/rag/adaptive";

const STATES: { id: CognitiveState; label: string; emoji: string; desc: string }[] = [
  { id: "focused", label: "Focused", emoji: "🎯", desc: "I'm in the zone" },
  { id: "okay", label: "Okay", emoji: "🙂", desc: "Doing alright" },
  { id: "drifting", label: "Drifting", emoji: "🌊", desc: "Hard to concentrate" },
  { id: "done", label: "Done", emoji: "✅", desc: "Ready to wrap up" },
];

export function CognitiveCheckIn({ onClose }: { onClose?: () => void }) {
  const { learnerState, currentAction, sessionParams, setCognitiveState, setSessionParams } = useFocusFlowStore();
  const current = learnerState.cognitive_state;

  const handleSelect = async (state: CognitiveState) => {
    setCognitiveState(state);

    // Call adaptive engine
    try {
      const res = await fetch("/api/adaptive/cognitive-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          explicit_checkin: state,
          current_modality: currentAction?.modality ?? sessionParams?.preferred_modality ?? "step-by-step",
        }),
      });
      if (res.ok) {
        const params = await res.json();
        setSessionParams(params);
      }
    } catch {
      // Silently fail — local state already updated
    }

    onClose?.();
  };

  return (
    <Card className="p-4 rounded-xl max-w-sm mx-auto">
      <h3 className="text-lg font-semibold mb-3 text-center">How are you feeling?</h3>
      <div className="grid grid-cols-2 gap-2">
        {STATES.map((stateOption) => (
          <Button
            key={stateOption.id}
            variant={current === stateOption.id ? "default" : "secondary"}
            className="flex flex-col items-center gap-1 h-auto py-3"
            onClick={() => handleSelect(stateOption.id)}
          >
            <span className="text-2xl">{stateOption.emoji}</span>
            <span className="font-medium text-sm">{stateOption.label}</span>
            <span className="text-xs opacity-70">{stateOption.desc}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
}
