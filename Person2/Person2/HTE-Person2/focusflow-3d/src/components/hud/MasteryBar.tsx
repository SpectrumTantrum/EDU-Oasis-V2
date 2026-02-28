'use client';

import { useFocusFlowStore } from '@/store/useFocusFlowStore';
import UserMenu from './UserMenu';

export default function MasteryBar() {
  const { learnerState, knowledgeGraph, getSessionMinutes } = useFocusFlowStore();
  const concepts = Object.entries(learnerState.concepts);
  const avgMastery =
    concepts.length > 0
      ? Math.round(concepts.reduce((sum, [, c]) => sum + c.mastery, 0) / concepts.length)
      : 0;
  const totalConcepts = knowledgeGraph?.concepts.length ?? 0;
  const mastered = concepts.filter(([, c]) => c.mastery >= 70).length;
  const minutes = getSessionMinutes();

  const barColor =
    avgMastery >= 70 ? '#50b050' : avgMastery >= 40 ? '#e0c030' : '#e05050';

  const cognitiveState = learnerState.cognitive_state;
  const stateLabel =
    cognitiveState === 'focused' ? 'Focused' :
    cognitiveState === 'drifting' ? 'Drifting' :
    cognitiveState === 'done' ? 'Done' : 'Okay';

  return (
    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
      <div className="flex items-center justify-between px-3 py-2 bg-[#202020]/80 backdrop-blur-sm pointer-events-auto">
        {/* Left: Title */}
        <div className="flex items-center gap-2">
          <span className="text-white text-xs font-bold font-mono tracking-wide">
            FocusFlow 2D
          </span>
          {totalConcepts > 0 && (
            <span className="text-[10px] text-white/50 font-mono">
              {mastered}/{totalConcepts} mastered
            </span>
          )}
        </div>

        {/* Center: Mastery bar */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/70 font-mono">Mastery</span>
          <div className="w-32 h-3 bg-[#404040] rounded-full overflow-hidden border border-[#606060]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${avgMastery}%`, backgroundColor: barColor }}
            />
          </div>
          <span className="text-[10px] text-white font-mono font-bold w-8 text-right">
            {avgMastery}%
          </span>
        </div>

        {/* Right: Session info + user */}
        <div className="flex items-center gap-3">
          <UserMenu />
          <span className="text-[10px] text-white/60 font-mono">{minutes}m</span>
          <span
            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
            style={{
              color: '#fff',
              backgroundColor:
                cognitiveState === 'focused' ? '#4080c0' :
                cognitiveState === 'drifting' ? '#e0a030' :
                cognitiveState === 'done' ? '#50b050' : '#808080',
            }}
          >
            {stateLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
