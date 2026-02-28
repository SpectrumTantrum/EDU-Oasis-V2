'use client';

import { useState, useEffect } from 'react';

export default function ControlsHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 6000);

    const dismiss = () => setVisible(false);
    window.addEventListener('keydown', dismiss, { once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', dismiss);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-pulse">
      <div className="bg-[#202020]/90 text-white text-[10px] font-mono px-4 py-2 rounded-lg border border-[#404040] text-center space-y-1">
        <div>Arrow keys / WASD to move</div>
        <div>SPACE to interact &middot; ESC to cancel</div>
        <div>M for menu</div>
      </div>
    </div>
  );
}
