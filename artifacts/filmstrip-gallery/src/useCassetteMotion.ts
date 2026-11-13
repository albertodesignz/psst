import { useEffect, useRef, type RefObject } from "react";

// Decorative motion follows media time, never drives playback. Angles are
// deliberately unwrapped so reverse seeking cannot take the wrong short path.
export function useCassetteMotion(
  video: RefObject<HTMLVideoElement | null>,
  trackKey: number,
) {
  const reels = useRef<SVGGElement>(null);
  const commands = useRef({
    seek: (_from: number, _to: number) => {},
    stop: () => {},
  });

  useEffect(() => {
    const media = video.current;
    const node = reels.current;
    if (!media || !node) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let angle = 0;
    let remaining = 0;
    let lastFrame = 0;
    let lastTime = media.currentTime;
    let waiting = false;
    let notifiedAt = -Infinity;
    const paint = () => {
      node.querySelectorAll<SVGGElement>("[data-reel]").forEach((reel) => {
        reel.setAttribute(
          "transform",
          `rotate(${angle} ${reel.dataset.cx} 495)`,
        );
      });
      node.dataset.angle = String(angle);
    };
    const moving = () =>
      !media.paused &&
      !media.ended &&
      !media.seeking &&
      !waiting &&
      media.readyState >= 3;
    const wake = () => {
      if (!frame && !preference.matches && !document.hidden) {
        lastFrame = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    function tick(now: number) {
      frame = 0;
      const dt = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      const current = media!.currentTime;
      if (Math.abs(remaining) > 0.05) {
        const step =
          Math.sign(remaining) * Math.min(Math.abs(remaining), 720 * dt);
        angle += step;
        remaining -= step;
      } else if (moving()) {
        // A seek/load jump is not ordinary playback. Only positive, small media
        // deltas turn the reels; buffering therefore freezes them naturally.
        const delta = current - lastTime;
        if (delta > 0 && delta < 0.5) angle += delta * 72;
      }
      lastTime = current;
      paint();
      if (moving() || Math.abs(remaining) > 0.05) wake();
    }
    const stop = () => {
      remaining = 0;
      notifiedAt = performance.now();
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = media.currentTime;
    };
    const seek = (from: number, to: number) => {
      notifiedAt = performance.now();
      if (preference.matches || !Number.isFinite(from) || !Number.isFinite(to))
        return;
      const delta = to - from;
      if (!delta) return;
      // Reverse direction immediately, and cap long jumps instead of queuing
      // several minutes of decorative motion after a single seek.
      if (Math.sign(remaining) !== Math.sign(delta)) remaining = 0;
      remaining = Math.max(-240, Math.min(240, remaining + delta * 24));
      wake();
    };
    commands.current = { seek, stop };
    const play = () => {
      waiting = false;
      lastTime = media.currentTime;
      wake();
    };
    const buffer = () => {
      waiting = true;
    };
    const seeking = () => {
      if (performance.now() - notifiedAt > 250)
        seek(lastTime, media.currentTime);
      lastTime = media.currentTime;
      wake();
    };
    const seeked = () => {
      waiting = false;
      lastTime = media.currentTime;
      wake();
    };
    const pause = () => {
      if (!remaining) stop();
    };
    const visibility = () => {
      if (document.hidden) stop();
      else {
        lastTime = media.currentTime;
        if (moving()) wake();
      }
    };
    const preferenceChanged = () => {
      stop();
      if (!preference.matches && moving()) wake();
    };
    const listeners = {
      playing: play,
      waiting: buffer,
      seeking,
      seeked,
      pause,
      ended: stop,
      error: stop,
      emptied: stop,
    };
    for (const [event, handler] of Object.entries(listeners))
      media.addEventListener(event, handler);
    document.addEventListener("visibilitychange", visibility);
    preference.addEventListener("change", preferenceChanged);
    paint();
    if (moving()) wake();
    return () => {
      stop();
      commands.current = { seek: () => {}, stop: () => {} };
      for (const [event, handler] of Object.entries(listeners))
        media.removeEventListener(event, handler);
      document.removeEventListener("visibilitychange", visibility);
      preference.removeEventListener("change", preferenceChanged);
    };
  }, [video, trackKey]);

  return {
    reels,
    seekFeedback: (from: number, to: number) => commands.current.seek(from, to),
    stopMotion: () => commands.current.stop(),
  };
}
