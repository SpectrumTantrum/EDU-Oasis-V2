"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFocusFlowStore } from "@/store/useFocusFlowStore";

function getMasteryColor(m: number) {
  if (m >= 70) return "bg-green-500";
  if (m >= 30) return "bg-yellow-500";
  return "bg-red-500";
}

function getMasteryBorder(m: number) {
  if (m >= 70) return "border-green-400";
  if (m >= 30) return "border-yellow-400";
  return "border-red-400";
}

export function WhiteboardPanel({ onClose }: { onClose: () => void }) {
  const { knowledgeGraph, learnerState, conceptLocks, setActivePanel, setSelectedConceptId } = useFocusFlowStore();
  const concepts = knowledgeGraph?.concepts ?? [];

  const handleConceptClick = (conceptId: string) => {
    const locked = conceptLocks.find((l) => l.concept_id === conceptId)?.locked;
    if (locked) return;
    setSelectedConceptId(conceptId);
    setActivePanel("study");
  };

  return (
    <Card className="p-6 rounded-xl max-w-2xl mx-auto" style={{ maxHeight: "80vh", overflowY: "auto" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Concept Map</h3>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-200 text-xl">&times;</button>
      </div>

      {concepts.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">
          <p>No concepts yet. Upload course material first!</p>
          <Button className="mt-4" onClick={() => { onClose(); useFocusFlowStore.getState().setActivePanel("upload"); }}>
            Upload Material
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {concepts.map((c) => {
            const mastery = learnerState.concepts[c.concept_id]?.mastery ?? c.mastery;
            const locked = conceptLocks.find((l) => l.concept_id === c.concept_id)?.locked;
            return (
              <button
                key={c.concept_id}
                onClick={() => handleConceptClick(c.concept_id)}
                disabled={locked}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  locked
                    ? "border-neutral-300 dark:border-neutral-700 opacity-50 cursor-not-allowed"
                    : `${getMasteryBorder(mastery)} hover:shadow-md cursor-pointer`
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${locked ? "bg-neutral-400" : getMasteryColor(mastery)}`} />
                  <span className="font-medium text-sm truncate">{locked ? `🔒 ${c.name}` : c.name}</span>
                </div>
                <div className="text-xs text-neutral-500">
                  {locked ? "Prerequisites required" : `Mastery: ${mastery}%`}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
