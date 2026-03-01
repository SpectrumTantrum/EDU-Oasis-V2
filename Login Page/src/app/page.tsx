"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { VideoBackground, BackgroundOverlay } from "@/components/VideoBackground";
import { ScrollHint } from "@/components/ScrollHint";
import { LoginCard } from "@/components/LoginCard";
import { StatusState, StatusToast } from "@/components/StatusToast";
import { InteractiveClipModal } from "@/components/InteractiveClipModal";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import { mockAuthenticate } from "@/lib/mockAuth";

const POSTER =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60";
const VIDEO_LOW =
  "https://cdn.coverr.co/videos/coverr-the-metaverse-lobby-5371/1080p.mp4#t=0.1";
const VIDEO_HD =
  "https://cdn.coverr.co/videos/coverr-blue-digital-grid-7719/1080p.mp4#t=0.1";

export default function Home() {
  const reducedMotion = useReducedMotion();
  const { isIdle, resetTimer } = useIdleTimer();

  const [status, setStatus] = useState<StatusState>({
    type: "info",
    message: "Login for more"
  });
  const [attempts, setAttempts] = useState(0);
  const [clipOpen, setClipOpen] = useState(false);
  const [backgroundPaused, setBackgroundPaused] = useState(false);
  const [pausedByIdle, setPausedByIdle] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (isIdle) {
      setStatus({
        type: "info",
        message: "Idle for 60 seconds, background paused",
        lockHint: "Any action to resume"
      });
      setBackgroundPaused(true);
      setPausedByIdle(true);
    }
  }, [isIdle]);

  useEffect(() => {
    if (!isIdle && pausedByIdle) {
      setBackgroundPaused(false);
      setPausedByIdle(false);
    }
  }, [isIdle, pausedByIdle]);

  const handleLogin = async (payload: {
    email: string;
    password: string;
    remember: boolean;
  }) => {
    resetTimer();
    const result = await mockAuthenticate({ ...payload, attemptCount: attempts });
    if (result.ok) {
      setStatus({ type: "success", message: result.message });
      setAttempts(0);
      setTimeout(() => {
        setStatus({ type: "info", message: "Main Page coming soon" });
      }, 800);
    } else {
      setAttempts((prev) => Math.min(prev + 1, 3));
      setStatus({
        type: "error",
        message: result.message,
        lockHint: result.lockHint ?? "Check your account or reset password"
      });
    }
    return result;
  };

  const heroCopy = useMemo(
    () => ({
      title: "OASIS EDU"
    }),
    []
  );

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <VideoBackground
          poster={POSTER}
          lowResSrc={VIDEO_LOW}
          highResSrc={VIDEO_HD}
          reducedMotion={reducedMotion}
          paused={backgroundPaused}
          onReady={() => setVideoReady(true)}
        />
        <BackgroundOverlay reducedMotion={reducedMotion}>
          <div className="absolute inset-0 bg-black/20" />
        </BackgroundOverlay>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 pt-6 text-xs text-oasis-muted">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-pixel border border-oasis-border flex items-center justify-center text-oasis-accent text-lg shadow-glow">
              ◎
            </div>
            <div>
              <p className="text-oasis-text">OASIS ED</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="pixel-btn bg-oasis-bg/70 text-oasis-text px-3 py-2"
              onClick={() => {
                resetTimer();
                setBackgroundPaused((prev) => !prev);
                setPausedByIdle(false);
              }}
              aria-pressed={backgroundPaused}
            >
              {backgroundPaused ? "Play" : "Pause"}
            </button>
            <button
              type="button"
              className="pixel-btn bg-oasis-bg/70 text-oasis-text px-3 py-2"
              onClick={() => {
                resetTimer();
                setClipOpen(true);
              }}
            >
              可交互片段
            </button>
          </div>
        </header>

        <section className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
            <article className="glass-card card-grid p-8 space-y-6 text-oasis-text">
              <p className="text-xs text-oasis-muted">Scroll to enter</p>
              <h2 className="text-2xl leading-relaxed">{heroCopy.title}</h2>
              <ul className="space-y-2 text-sm text-oasis-text/90"></ul>
              <div className="text-xs text-oasis-muted space-y-1" aria-live="polite">
                <p>Video status：{videoReady ? "Ready (metadata)" : "Loading poster"}</p>
                <p>Animation preference：{reducedMotion ? "Reduced motion detected" : "Normal motion"}</p>
              </div>
            </article>

            <LoginCard
              onLogin={handleLogin}
              status={status}
              attempts={attempts}
              reducedMotion={reducedMotion}
            />
          </div>
        </section>
      </div>

      <ScrollHint reducedMotion={reducedMotion} />
      <StatusToast status={status} />
      <InteractiveClipModal
        open={clipOpen}
        onClose={() => {
          setClipOpen(false);
          resetTimer();
        }}
      />

      <div
        className={clsx(
          "fixed left-6 bottom-6 glass-card px-4 py-3 text-xs text-oasis-muted",
          isIdle ? "opacity-100" : "opacity-70"
        )}
        aria-live="polite"
      >
        {isIdle ? "" : ""}
      </div>
    </main>
  );
}
