"use client";

import { useEffect } from "react";
import clsx from "clsx";

type InteractiveClipModalProps = {
  open: boolean;
  onClose: () => void;
};

export function InteractiveClipModal({ open, onClose }: InteractiveClipModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (evt: KeyboardEvent) => {
      if (evt.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="可交互片段說明"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={clsx(
          "glass-card card-grid max-w-lg w-[90%] text-oasis-text p-6 space-y-4",
          "pointer-events-auto"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-oasis-muted mb-1">OASIS 互動片段</p>
            <h3 className="text-lg">局部放大 + 解說</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="pixel-btn bg-oasis-bg/60 text-oasis-text px-3 py-2"
          >
            關閉
          </button>
        </div>
        <p className="text-sm text-oasis-muted">
          點擊背景右上「可交互片段」可放大焦點區域，並顯示 2-3 行說明文字；Esc 或點擊遮罩關閉。
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm text-oasis-text/90">
          <li>支援鍵盤 Esc 關閉，保持焦點序連續。</li>
          <li>過場 600-800ms，prefers-reduced-motion 時改為靜態切換。</li>
          <li>預載短片段（2-3s），背景影片保持 mute/loop。</li>
        </ul>
      </div>
    </div>
  );
}
