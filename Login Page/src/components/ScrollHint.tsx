"use client";

type ScrollHintProps = {
  reducedMotion: boolean;
};

export function ScrollHint({ reducedMotion }: ScrollHintProps) {
  return (
    <div className="absolute inset-x-0 bottom-6 flex justify-center pointer-events-none">
      <div className="flex flex-col items-center text-oasis-muted text-xs tracking-wide">
        <span className={reducedMotion ? "" : "animate-float"} aria-hidden>
          ↓
        </span>
        <span className="mt-1">向下滾動進入 OASIS</span>
      </div>
    </div>
  );
}
