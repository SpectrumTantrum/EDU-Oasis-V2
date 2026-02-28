'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { NPC } from './NPC';

interface DialogueBoxProps {
  npc: NPC;
  onSelectOption: (panelId: string | null) => void;
  onClose: () => void;
}

const CHAR_DELAY = 25; // ms per character

export default function DialogueBox({ npc, onSelectOption, onClose }: DialogueBoxProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [textComplete, setTextComplete] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const charIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const fullText = npc.greeting;

  // Typewriter effect
  useEffect(() => {
    charIndexRef.current = 0;
    setDisplayedText('');
    setTextComplete(false);
    setShowOptions(false);
    setSelectedIndex(0);

    timerRef.current = setInterval(() => {
      charIndexRef.current++;
      if (charIndexRef.current >= fullText.length) {
        setDisplayedText(fullText);
        setTextComplete(true);
        clearInterval(timerRef.current);
      } else {
        setDisplayedText(fullText.slice(0, charIndexRef.current));
      }
    }, CHAR_DELAY);

    return () => clearInterval(timerRef.current);
  }, [fullText]);

  // Show options after text completes
  useEffect(() => {
    if (textComplete) {
      const t = setTimeout(() => setShowOptions(true), 200);
      return () => clearTimeout(t);
    }
  }, [textComplete]);

  const skipText = useCallback(() => {
    clearInterval(timerRef.current);
    setDisplayedText(fullText);
    setTextComplete(true);
  }, [fullText]);

  const confirmSelection = useCallback(() => {
    const opt = npc.options[selectedIndex];
    if (opt.panelId === null) {
      onClose();
    } else {
      onSelectOption(opt.panelId);
    }
  }, [npc.options, selectedIndex, onSelectOption, onClose]);

  // Keyboard handling
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape' || e.key === 'x' || e.key === 'X') {
        onClose();
        return;
      }

      if (!textComplete) {
        if (e.key === ' ' || e.key === 'Enter') {
          skipText();
        }
        return;
      }

      if (!showOptions) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setSelectedIndex((prev) => (prev - 1 + npc.options.length) % npc.options.length);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setSelectedIndex((prev) => (prev + 1) % npc.options.length);
      } else if (e.key === ' ' || e.key === 'Enter') {
        confirmSelection();
      }
    };

    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [textComplete, showOptions, npc.options.length, skipText, confirmSelection, onClose]);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-auto p-2">
      <div
        className="w-full max-w-[960px] border-4 border-[#202020] bg-[#f8f8f8] rounded-lg overflow-hidden"
        style={{ fontFamily: '"Press Start 2P", monospace', imageRendering: 'auto' }}
      >
        <div className="flex gap-3 p-3 min-h-[120px]">
          {/* NPC Portrait */}
          <div className="flex-shrink-0 w-16 h-16 rounded border-2 border-[#202020] flex items-center justify-center"
            style={{ backgroundColor: npc.color }}
          >
            <span className="text-white text-[8px] text-center leading-tight font-mono">
              {npc.name}
            </span>
          </div>

          {/* Text area */}
          <div className="flex-1 min-w-0">
            <p className="text-[#202020] text-[10px] leading-relaxed whitespace-pre-wrap font-mono">
              {displayedText}
              {!textComplete && (
                <span className="inline-block animate-pulse">_</span>
              )}
            </p>

            {/* Bouncing indicator when text is done but options not yet shown */}
            {textComplete && !showOptions && (
              <div className="text-right mt-1 animate-bounce text-xs text-[#202020]">
                ▼
              </div>
            )}

            {/* Options menu */}
            {showOptions && (
              <div className="mt-2 space-y-1">
                {npc.options.map((opt, i) => (
                  <button
                    key={i}
                    className={`block w-full text-left text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                      i === selectedIndex
                        ? 'bg-[#202020] text-white'
                        : 'text-[#202020] hover:bg-[#e0e0e0]'
                    }`}
                    onClick={() => {
                      setSelectedIndex(i);
                      if (opt.panelId === null) {
                        onClose();
                      } else {
                        onSelectOption(opt.panelId);
                      }
                    }}
                    onMouseEnter={() => setSelectedIndex(i)}
                  >
                    {i === selectedIndex ? '▶ ' : '  '}{opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom hint */}
        <div className="bg-[#e8e0d0] px-3 py-1 text-[8px] text-[#606060] font-mono flex justify-between">
          <span>↑↓ Navigate  SPACE Select</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  );
}
