import { useCallback, useEffect, useRef, useState } from "react";

const PHOTOS = [
  { src: "/__mockup/images/filmstrip3d-rider.png", artist: "Mara Venn", title: "Night Rider", album: "After the Last Train", year: "2019" },
  { src: "/__mockup/images/elektrosthal.png", artist: "Elektrosthal", title: "Borrowed Numbers", album: "Red Static", year: "2024" },
  { src: "/__mockup/images/filmstrip3d-shadows.png", artist: "The Soft Hours", title: "Half Past Four", album: "Rooms With No View", year: "2021" },
  { src: "/__mockup/images/fast.png", artist: "FAST", title: "No Slow Return", album: "Velocity Studies", year: "2025" },
  { src: "/__mockup/images/filmstrip3d-mist.png", artist: "Juniper Static", title: "Two in the Fog", album: "Still / Moving", year: "2020" },
  { src: "/__mockup/images/mizzsterious.png", artist: "Mizzsterious", title: "Color Theory", album: "Mizzterious Forms", year: "2024" },
  { src: "/__mockup/images/filmstrip3d-rain.png", artist: "Low Atlas", title: "Wet Glass", album: "Weather Systems", year: "2022" },
  { src: "/__mockup/images/filmstrip3d-dancer.png", artist: "Vera Bloom", title: "Ghost Step", album: "A Body in Light", year: "2018" },
  { src: "/__mockup/images/filmstrip3d-stairs.png", artist: "Northbound", title: "Descent", album: "The Long Way Home", year: "2023" },
];

const PANEL_W = 380;
const PANEL_H = 520;
const GAP = 28;
const STEP = PANEL_W + GAP;
const RING_RADIUS = 760;
const RING_ANGLE = 30;
const TRACK_SECONDS = 238;
const WAVE_COLORS = ["#fff04a", "#00f5ff", "#ff4f81", "#b6ff00", "#ff9e3d", "#f95dff", "#73ffbd", "#a78bfa", "#ff5f6d"];
const BACKGROUND_COLORS = ["#4e3027", "#86452f", "#35454e", "#895633", "#3d5360", "#e7c21f", "#3d514d", "#51405d", "#315c58"];
const TEXT_COLORS = [
  { muted: "#b7a69c", secondary: "#d5c6bb", primary: "#fff7ef", control: "#fff7ef", line: "rgba(255,247,239,0.22)", track: "rgba(255,247,239,0.18)" },
  { muted: "#f0c6ae", secondary: "#ffe0cc", primary: "#fff8ef", control: "#fff8ef", line: "rgba(255,248,239,0.24)", track: "rgba(255,248,239,0.18)" },
  { muted: "#b6c7d0", secondary: "#d6e4eb", primary: "#f5fbff", control: "#f5fbff", line: "rgba(245,251,255,0.24)", track: "rgba(245,251,255,0.18)" },
  { muted: "#efc4a9", secondary: "#ffdfc9", primary: "#fff8ee", control: "#fff8ee", line: "rgba(255,248,238,0.24)", track: "rgba(255,248,238,0.18)" },
  { muted: "#b8c9d1", secondary: "#d7e6ec", primary: "#f5fbff", control: "#f5fbff", line: "rgba(245,251,255,0.24)", track: "rgba(245,251,255,0.18)" },
  { muted: "#5a4609", secondary: "#3d2d03", primary: "#171108", control: "#171108", line: "rgba(23,17,8,0.28)", track: "rgba(23,17,8,0.22)" },
  { muted: "#b4c9be", secondary: "#d4e7dc", primary: "#f4fff8", control: "#f4fff8", line: "rgba(244,255,248,0.24)", track: "rgba(244,255,248,0.18)" },
  { muted: "#c8b9d4", secondary: "#e0d5e8", primary: "#fbf6ff", control: "#fbf6ff", line: "rgba(251,246,255,0.24)", track: "rgba(251,246,255,0.18)" },
  { muted: "#acd0ce", secondary: "#cfe9e5", primary: "#f0fffc", control: "#f0fffc", line: "rgba(240,255,252,0.24)", track: "rgba(240,255,252,0.18)" },
];
const WAVE_BARS = Array.from({ length: 72 }, (_, index) => {
  const beat = Math.abs(Math.sin((index + 1) * 2.15));
  const swell = Math.abs(Math.cos((index + 1) * 0.68));
  return Math.round(28 + beat * 58 + swell * 34);
});
const WAVE_PACES = [
  { duration: 0.54, delayStep: 0.04, direction: "alternate" as const },
  { duration: 1.12, delayStep: 0.1, direction: "alternate-reverse" as const },
  { duration: 0.68, delayStep: 0.055, direction: "alternate" as const },
  { duration: 1.38, delayStep: 0.12, direction: "alternate-reverse" as const },
  { duration: 0.46, delayStep: 0.032, direction: "alternate" as const },
  { duration: 0.92, delayStep: 0.075, direction: "alternate-reverse" as const },
  { duration: 0.6, delayStep: 0.045, direction: "alternate-reverse" as const },
  { duration: 1.26, delayStep: 0.11, direction: "alternate" as const },
  { duration: 0.76, delayStep: 0.062, direction: "alternate-reverse" as const },
];

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
};

export function Filmstrip() {
  const [scroll, setScroll] = useState(5 * STEP);
  const target = useRef(5 * STEP);
  const raf = useRef<number | null>(null);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const [active, setActive] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const pace = WAVE_PACES[active];
  const text = TEXT_COLORS[active];

  const animate = useCallback(() => {
    setScroll((s) => {
      const next = s + (target.current - s) * 0.08;
      if (Math.abs(target.current - next) > 0.1) {
        raf.current = requestAnimationFrame(animate);
      } else {
        raf.current = null;
      }
      return next;
    });
  }, []);

  const kick = useCallback(() => {
    if (raf.current == null) raf.current = requestAnimationFrame(animate);
  }, [animate]);

  const clamp = (v: number) => Math.max(0, Math.min(v, (PHOTOS.length - 1) * STEP));

  useEffect(() => {
    setActive(Math.round(clamp(scroll) / STEP));
  }, [scroll]);

  useEffect(() => () => { if (raf.current != null) cancelAnimationFrame(raf.current); }, []);

  useEffect(() => {
    setElapsed(0);
  }, [active]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setElapsed((current) => {
        if (current >= TRACK_SECONDS) {
          setIsPlaying(false);
          return TRACK_SECONDS;
        }
        return current + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    lastX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    target.current = clamp(target.current - dx * 1.4);
    kick();
  };
  const onPointerUp = () => {
    dragging.current = false;
    target.current = clamp(Math.round(target.current / STEP) * STEP);
    kick();
  };
  const onWheel = (e: React.WheelEvent) => {
    target.current = clamp(target.current + (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * 1.2);
    kick();
  };
  const goTo = (i: number) => {
    target.current = clamp(i * STEP);
    kick();
  };
  const seekTo = (value: number) => {
    setElapsed(Math.max(0, Math.min(TRACK_SECONDS, value)));
  };
  const onScrubberInput = (e: React.FormEvent<HTMLInputElement>) => {
    seekTo(Number(e.currentTarget.value));
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden select-none"
        style={{ background: BACKGROUND_COLORS[active], fontFamily: "'Quantico', sans-serif", cursor: dragging.current ? "grabbing" : "grab", transition: "background 0.5s ease" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Monda:wght@400..700&family=Quantico:ital,wght@0,400;0,700;1,400;1,700&display=swap"
      />
      <style>{`
        @keyframes filmstrip-soundwave {
          0% { transform: scaleY(0.16); opacity: 0.45; }
          22% { transform: scaleY(0.82); opacity: 0.92; }
          48% { transform: scaleY(0.38); opacity: 0.68; }
          72% { transform: scaleY(1); opacity: 1; }
          100% { transform: scaleY(0.28); opacity: 0.56; }
        }
        .filmstrip-scrubber {
          appearance: none;
          height: 3px;
          border-radius: 999px;
          outline: none;
        }
        .filmstrip-scrubber::-webkit-slider-thumb {
          appearance: none;
          width: 10px;
          height: 10px;
          border: 1px solid currentColor;
          border-radius: 999px;
          background: currentColor;
          cursor: ew-resize;
        }
        .filmstrip-scrubber::-moz-range-thumb {
          width: 10px;
          height: 10px;
          border: 1px solid currentColor;
          border-radius: 999px;
          background: currentColor;
          cursor: ew-resize;
        }
        .filmstrip-scrubber:focus-visible {
          box-shadow: 0 0 0 3px rgba(232, 225, 212, 0.18);
        }
      `}</style>
      {/* header */}
      <header className="absolute left-0 right-0 top-0 z-40 grid grid-cols-3 items-start px-10 pt-8">
        <div />
        <div className="flex items-center justify-center gap-2" aria-label="Playback controls">
          <button
            type="button"
            onClick={() => goTo((active - 1 + PHOTOS.length) % PHOTOS.length)}
            className="flex h-8 w-8 items-center justify-center border transition-colors hover:bg-white/10"
            style={{ borderColor: text.line, color: text.secondary }}
            aria-label="Previous track"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 12h14M10 7l-5 5 5 5M19 7v10" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying((playing) => !playing)}
            className="flex h-10 w-10 items-center justify-center border transition-colors hover:bg-white/10"
            style={{ borderColor: text.control, color: text.control }}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M7 5h3v14H7zM14 5h3v14h-3z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4 translate-x-px" fill="currentColor" aria-hidden="true">
                <path d="m8 5 11 7-11 7V5Z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={() => goTo((active + 1) % PHOTOS.length)}
            className="flex h-8 w-8 items-center justify-center border transition-colors hover:bg-white/10"
            style={{ borderColor: text.line, color: text.secondary }}
            aria-label="Next track"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 12h14M14 7l5 5-5 5M5 7v10" />
            </svg>
          </button>
        </div>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center border transition-colors hover:bg-white/10"
          aria-label="Open menu"
          style={{ color: text.control, borderColor: text.line, justifySelf: "end" }}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </header>
      {/* 3D strip */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: "1400px" }}>
        <div style={{ transformStyle: "preserve-3d", position: "relative", height: PANEL_H }}>
          {PHOTOS.map((p, i) => {
            const rawIndex = i - scroll / STEP;
            const n = ((rawIndex + PHOTOS.length / 2) % PHOTOS.length + PHOTOS.length) % PHOTOS.length - PHOTOS.length / 2;
             const ringAngle = n * RING_ANGLE;
             const angleRadians = ringAngle * Math.PI / 180;
             const ringX = Math.sin(angleRadians) * RING_RADIUS;
             const ringZ = (Math.cos(angleRadians) - 1) * RING_RADIUS;
            const twist = Math.max(-14, Math.min(14, n * 5)); // rotateZ for ribbon curl
             const opacity = Math.max(0.15, 1 - Math.abs(n) * 0.18);
            const isActive = i === active;
            return (
              <div
                key={p.src}
                className="absolute top-0"
                style={{
                  width: PANEL_W,
                  height: PANEL_H,
                  left: -PANEL_W / 2,
                    transform: `translateX(${ringX}px) translateZ(${ringZ}px) rotateY(${ringAngle}deg) rotateZ(${twist}deg) scale(${isActive ? 1.23 : 1})`,
                    transformOrigin: "center center",
                  transformStyle: "preserve-3d",
                   transition: "opacity 0.3s, transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  opacity,
                }}
                onClick={() => goTo(i)}
              >
                <div
                  className="relative h-full w-full overflow-hidden"
                  style={{
                    boxShadow: isActive
                      ? "0 40px 90px rgba(0,0,0,0.7), 0 0 0 1px rgba(232,225,212,0.12)"
                      : "0 30px 60px rgba(0,0,0,0.6)",
                    background: "#0c0b0a",
                  }}
                >
                  <img src={p.src} alt={p.title} draggable={false} className="h-full w-full object-cover" style={{ filter: isActive ? "none" : "brightness(0.75) contrast(1.02)", transition: "filter 0.4s" }} />
                  {/* film sheen */}
                  <div className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(${105 + n * 20}deg, rgba(255,255,255,${Math.min(0.16, Math.abs(n) * 0.09)}) 0%, transparent 40%, rgba(0,0,0,${Math.min(0.55, Math.abs(n) * 0.25)}) 100%)` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* caption + centered waveform + stacked controls */}
      <footer className="absolute inset-x-0 bottom-0 z-40 grid grid-cols-[auto_minmax(0,1fr)_auto] items-end gap-5 px-10 pb-8">
        <div className="shrink-0">
          <p className="text-[11px] uppercase tracking-[0.28em]" style={{ color: text.secondary }}>
            {PHOTOS[active].artist}
          </p>
          <p className="mt-2 text-2xl font-bold" style={{ color: text.primary }}>
            {PHOTOS[active].title}
          </p>
          <p className="mt-1 flex items-center gap-3 text-[11px]" style={{ color: text.muted }}>
            <span>{PHOTOS[active].album}</span>
            <span aria-hidden="true" style={{ color: text.line }}>—</span>
            <span>{PHOTOS[active].year}</span>
          </p>
        </div>

        <div className="flex min-w-0 items-center justify-center px-5">
          <div
            className="pointer-events-auto flex min-w-0 flex-1 items-center justify-center"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
          >
            <div
              className={`${isPlaying ? "relative w-full" : "absolute left-1/2 top-1/2 w-[600px] -translate-x-1/2 -translate-y-1/2"} flex h-12 items-center transition-[width] duration-500 ease-out`}
              style={{ color: WAVE_COLORS[active], transition: "color 0.5s ease, width 0.5s ease" }}
              role="img"
              aria-label={`Soundwave for ${PHOTOS[active].album}`}
            >
              <span
                className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 rounded-full"
                style={{ background: "currentColor", opacity: isPlaying ? 0 : 0.7, transition: "opacity 0.25s ease" }}
              />
              <div className="absolute inset-0 flex items-center justify-between gap-[2px] px-1">
                {WAVE_BARS.map((height, i) => (
                  <span
                    key={i}
                    className="block w-[2px] rounded-full"
                    style={{
                      height,
                      background: "currentColor",
                      opacity: isPlaying ? 1 : 0,
                      animationName: isPlaying ? "filmstrip-soundwave" : "none",
                      animationDelay: `${(i % 16) * -pace.delayStep}s`,
                      animationDuration: `${pace.duration + (i % 5) * 0.055}s`,
                      animationTimingFunction: i % 3 === 0 ? "cubic-bezier(0.32, 0, 0.67, 0)" : "ease-in-out",
                      animationIterationCount: "infinite",
                      animationDirection: i % 4 === 0 ? pace.direction : pace.direction === "alternate" ? "alternate-reverse" : "alternate",
                      transformOrigin: "center",
                      transition: "opacity 0.25s ease",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-end gap-5">
          <div className="flex flex-col items-start gap-2">
            <div className="min-w-[170px] text-center">
              <p className="text-[9px] uppercase tracking-[0.28em]" style={{ color: text.muted }}>Time left</p>
              <p className="mt-1 text-xl font-bold tabular-nums tracking-[0.08em]" style={{ color: text.primary }}>
                -{formatTime(Math.max(0, TRACK_SECONDS - elapsed))}
              </p>
            </div>
          </div>
          <div
            className="flex w-[210px] items-center pb-1"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
          >
            <input
              type="range"
              min="0"
              max={TRACK_SECONDS}
              step="1"
              value={elapsed}
              onInput={onScrubberInput}
              onChange={onScrubberInput}
              className="filmstrip-scrubber w-full"
              style={{
                color: WAVE_COLORS[active],
                background: `linear-gradient(90deg, ${WAVE_COLORS[active]} ${TRACK_SECONDS ? (elapsed / TRACK_SECONDS) * 100 : 0}%, ${text.track} ${TRACK_SECONDS ? (elapsed / TRACK_SECONDS) * 100 : 0}%)`,
              }}
              aria-label={`Seek through ${PHOTOS[active].title}`}
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
