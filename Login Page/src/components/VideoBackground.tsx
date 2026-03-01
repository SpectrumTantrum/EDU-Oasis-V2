"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

type VideoBackgroundProps = {
  poster: string;
  lowResSrc: string;
  highResSrc: string;
  reducedMotion: boolean;
  paused?: boolean;
  onReady?: () => void;
};

export function VideoBackground({
  poster,
  lowResSrc,
  highResSrc,
  reducedMotion,
  paused = false,
  onReady
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [loadHd, setLoadHd] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (paused || reducedMotion) {
      video.pause();
    } else {
      void video.play().catch(() => {
        /* ignore autoplay errors */
      });
    }
  }, [paused, reducedMotion]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element || reducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setLoadHd(true);
          }
        });
      },
      { threshold: 0.35 }
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <div
        className="absolute inset-0 bg-gradient-to-br from-oasis-bg via-[#0b1a2e] to-[#09101e] opacity-90"
        aria-hidden
      />
    );
  }

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover opacity-80"
      poster={poster}
      preload="metadata"
      muted
      loop
      playsInline
      autoPlay
      onLoadedData={onReady}
      aria-label="OASIS 可交互背景影片"
    >
      <source src={lowResSrc} type="video/webm" />
      {loadHd && <source src={highResSrc} type="video/mp4" />}
      <track kind="captions" />
    </video>
  );
}

type BackgroundOverlayProps = {
  children: React.ReactNode;
  reducedMotion: boolean;
};

export function BackgroundOverlay({ children, reducedMotion }: BackgroundOverlayProps) {
  return (
    <div
      className={clsx(
        "absolute inset-0 pointer-events-none",
        reducedMotion ? "bg-oasis-bg/60" : "bg-gradient-to-b from-oasis-bg/30 to-oasis-bg/60"
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(94,240,255,0.14),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(125,247,198,0.16),transparent_32%)]" />
      {children}
    </div>
  );
}
