import { useCallback, useEffect, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react';

type Track = {
  src: string;
  artist: string;
  title: string;
  album: string;
  year: string;
  scene: string;
  wave: string;
  text: { muted: string; secondary: string; primary: string; line: string; track: string };
};

const TRACKS: Track[] = [
  { src: '/images/filmstrip3d-rider.png', artist: 'Mara Venn', title: 'Night Rider', album: 'After the Last Train', year: '2019', scene: '#4e3027', wave: '#fff04a', text: { muted: '#b7a69c', secondary: '#d5c6bb', primary: '#fff7ef', line: 'rgba(255,247,239,.22)', track: 'rgba(255,247,239,.18)' } },
  { src: '/images/elektrosthal.png', artist: 'Elektrosthal', title: 'Borrowed Numbers', album: 'Red Static', year: '2024', scene: '#86452f', wave: '#00f5ff', text: { muted: '#f0c6ae', secondary: '#ffe0cc', primary: '#fff8ef', line: 'rgba(255,248,239,.24)', track: 'rgba(255,248,239,.18)' } },
  { src: '/images/filmstrip3d-shadows.png', artist: 'The Soft Hours', title: 'Half Past Four', album: 'Rooms With No View', year: '2021', scene: '#35454e', wave: '#ff4f81', text: { muted: '#b6c7d0', secondary: '#d6e4eb', primary: '#f5fbff', line: 'rgba(245,251,255,.24)', track: 'rgba(245,251,255,.18)' } },
  { src: '/images/fast.png', artist: 'FAST', title: 'No Slow Return', album: 'Velocity Studies', year: '2025', scene: '#895633', wave: '#b6ff00', text: { muted: '#efc4a9', secondary: '#ffdfc9', primary: '#fff8ee', line: 'rgba(255,248,238,.24)', track: 'rgba(255,248,238,.18)' } },
  { src: '/images/filmstrip3d-mist.png', artist: 'Juniper Static', title: 'Two in the Fog', album: 'Still / Moving', year: '2020', scene: '#3d5360', wave: '#ff9e3d', text: { muted: '#b8c9d1', secondary: '#d7e6ec', primary: '#f5fbff', line: 'rgba(245,251,255,.24)', track: 'rgba(245,251,255,.18)' } },
  { src: '/images/mizzsterious.png', artist: 'Mizzsterious', title: 'Color Theory', album: 'Mizzterious Forms', year: '2024', scene: '#e7c21f', wave: '#f95dff', text: { muted: '#5a4609', secondary: '#3d2d03', primary: '#171108', line: 'rgba(23,17,8,.28)', track: 'rgba(23,17,8,.22)' } },
  { src: '/images/filmstrip3d-rain.png', artist: 'Low Atlas', title: 'Wet Glass', album: 'Weather Systems', year: '2022', scene: '#3d514d', wave: '#73ffbd', text: { muted: '#b4c9be', secondary: '#d4e7dc', primary: '#f4fff8', line: 'rgba(244,255,248,.24)', track: 'rgba(244,255,248,.18)' } },
  { src: '/images/filmstrip3d-dancer.png', artist: 'Vera Bloom', title: 'Ghost Step', album: 'A Body in Light', year: '2018', scene: '#51405d', wave: '#a78bfa', text: { muted: '#c8b9d4', secondary: '#e0d5e8', primary: '#fbf6ff', line: 'rgba(251,246,255,.24)', track: 'rgba(251,246,255,.18)' } },
  { src: '/images/filmstrip3d-stairs.png', artist: 'Northbound', title: 'Descent', album: 'The Long Way Home', year: '2023', scene: '#315c58', wave: '#ff5f6d', text: { muted: '#acd0ce', secondary: '#cfe9e5', primary: '#f0fffc', line: 'rgba(240,255,252,.24)', track: 'rgba(240,255,252,.18)' } },
];

const PANEL_WIDTH = 380;
const PANEL_HEIGHT = 520;
const STEP = 408;
const RING_RADIUS = 760;
const RING_ANGLE = 30;
const TRACK_SECONDS = 238;
const WAVE_BARS = Array.from({ length: 72 }, (_, index) => Math.round(28 + Math.abs(Math.sin((index + 1) * 2.15)) * 58 + Math.abs(Math.cos((index + 1) * 0.68)) * 34));
const WAVE_PACES = [
  { duration: 0.54, delayStep: 0.04, direction: 'alternate' as const },
  { duration: 1.12, delayStep: 0.1, direction: 'alternate-reverse' as const },
  { duration: 0.68, delayStep: 0.055, direction: 'alternate' as const },
  { duration: 1.38, delayStep: 0.12, direction: 'alternate-reverse' as const },
  { duration: 0.46, delayStep: 0.032, direction: 'alternate' as const },
  { duration: 0.92, delayStep: 0.075, direction: 'alternate-reverse' as const },
  { duration: 0.6, delayStep: 0.045, direction: 'alternate-reverse' as const },
  { duration: 1.26, delayStep: 0.11, direction: 'alternate' as const },
  { duration: 0.76, delayStep: 0.062, direction: 'alternate-reverse' as const },
];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function Arrow({ direction }: { direction: 'previous' | 'next' }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      {direction === 'previous' ? <path d="M5 12h14M10 7l-5 5 5 5M19 7v10" /> : <path d="M5 12h14M14 7l5 5-5 5M5 7v10" />}
    </svg>
  );
}

function PlayIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M7 5h3v14H7zM14 5h3v14h-3z" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="m8 5 11 7-11 7V5Z" /></svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
  );
}

export default function App() {
  const [scroll, setScroll] = useState(5 * STEP);
  const [active, setActive] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const target = useRef(5 * STEP);
  const raf = useRef<number | null>(null);
  const dragging = useRef(false);
  const lastX = useRef(0);

  const wrapIndex = useCallback((index: number) => ((index % TRACKS.length) + TRACKS.length) % TRACKS.length, []);
  const animate = useCallback(() => {
    setScroll((current) => {
      const next = current + (target.current - current) * 0.08;
      if (Math.abs(target.current - next) > 0.1) raf.current = requestAnimationFrame(animate);
      else raf.current = null;
      return next;
    });
  }, []);
  const kick = useCallback(() => {
    if (raf.current === null) raf.current = requestAnimationFrame(animate);
  }, [animate]);

  useEffect(() => {
    setActive(wrapIndex(Math.round(scroll / STEP)));
  }, [scroll, wrapIndex]);

  useEffect(() => () => {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
  }, []);

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

  const goTo = useCallback((index: number) => {
    const currentPosition = Math.round(target.current / STEP);
    const currentIndex = wrapIndex(currentPosition);
    const nextIndex = wrapIndex(index);
    let difference = nextIndex - currentIndex;

    if (difference > TRACKS.length / 2) difference -= TRACKS.length;
    if (difference < -TRACKS.length / 2) difference += TRACKS.length;

    target.current = (currentPosition + difference) * STEP;
    kick();
  }, [kick, wrapIndex]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    lastX.current = event.clientX;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const difference = event.clientX - lastX.current;
    lastX.current = event.clientX;
    target.current -= difference * 1.4;
    kick();
  };
  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    target.current = Math.round(target.current / STEP) * STEP;
    kick();
  };
  const onWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    target.current += delta * 1.2;
    kick();
  };
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); goTo((active - 1 + TRACKS.length) % TRACKS.length); }
    if (event.key === 'ArrowRight') { event.preventDefault(); goTo((active + 1) % TRACKS.length); }
    if (event.key === ' ') { event.preventDefault(); setIsPlaying((playing) => !playing); }
  };

  const track = TRACKS[active];
  const wavePace = WAVE_PACES[active];
  const progress = (elapsed / TRACK_SECONDS) * 100;

  return (
    <main
      className="filmstrip-app"
      style={{ backgroundColor: track.scene, color: track.text.primary, cursor: isDragging ? 'grabbing' : 'grab' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      onKeyDown={onKeyDown}
      tabIndex={0}
       aria-label="3D filmstrip music gallery. Swipe or drag to browse, use arrow keys, and press space to play."
      data-testid="gallery-canvas"
    >
      <header className="filmstrip-header">
        <div />
        <div
          className="header-controls"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerMove={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          aria-label="Playback controls"
        >
          <button type="button" className="icon-button" style={{ color: track.text.secondary }} onClick={() => goTo((active - 1 + TRACKS.length) % TRACKS.length)} aria-label="Previous track" data-testid="button-header-previous-track"><Arrow direction="previous" /></button>
          <button type="button" className="icon-button play-button" style={{ color: track.text.primary }} onClick={() => setIsPlaying((playing) => !playing)} aria-label={isPlaying ? 'Pause' : 'Play'} data-testid="button-header-play-toggle"><PlayIcon playing={isPlaying} /></button>
          <button type="button" className="icon-button" style={{ color: track.text.secondary }} onClick={() => goTo((active + 1) % TRACKS.length)} aria-label="Next track" data-testid="button-header-next-track"><Arrow direction="next" /></button>
        </div>
        <div className="menu-wrap">
          <button
            type="button"
            className="menu-button"
            style={{ color: track.text.primary }}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={(event) => { event.stopPropagation(); setMenuOpen((open) => !open); }}
            data-testid="button-menu"
          >
            <MenuIcon open={menuOpen} />
          </button>
          {menuOpen && (
            <div className="menu-popover" role="dialog" aria-label="Gallery information" onPointerDown={(event) => event.stopPropagation()} data-testid="menu-popover">
              <p className="eyebrow">Now browsing</p>
              <p className="menu-copy">Nine moving images, one continuous strip.<br />Drag, scroll, or use the keys.</p>
            </div>
          )}
        </div>
      </header>

      <section className="carousel-stage" aria-label="Album carousel">
        <div className="carousel-ring">
          {TRACKS.map((item, index) => {
            const rawIndex = index - scroll / STEP;
            const normalized = ((rawIndex + TRACKS.length / 2) % TRACKS.length + TRACKS.length) % TRACKS.length - TRACKS.length / 2;
            const angle = normalized * RING_ANGLE;
            const radians = angle * Math.PI / 180;
            const x = Math.sin(radians) * RING_RADIUS;
            const z = (Math.cos(radians) - 1) * RING_RADIUS;
            const twist = Math.max(-14, Math.min(14, normalized * 5));
            const isActive = index === active;
            return (
              <button
                type="button"
                className={`album-card ${isActive ? 'is-active' : ''}`}
                key={item.src}
                style={{
                  transform: `translateX(${x}px) translateZ(${z}px) rotateY(${angle}deg) rotateZ(${twist}deg) scale(${isActive ? 1.23 : 1})`,
                  opacity: Math.max(0.15, 1 - Math.abs(normalized) * 0.18),
                  transition: 'opacity .3s, transform .45s cubic-bezier(.2,.8,.2,1)',
                }}
                onClick={(event) => { event.stopPropagation(); goTo(index); }}
                aria-label={`Select ${item.artist}, ${item.title}`}
                data-testid={`button-album-${index}`}
              >
                <span className="album-card-inner">
                  <img src={item.src} alt={`${item.artist} — ${item.title} cover`} draggable={false} style={{ filter: isActive ? 'none' : 'brightness(.75) contrast(1.02)' }} />
                  <span className="album-sheen" style={{ background: `linear-gradient(${105 + normalized * 20}deg, rgba(255,255,255,${Math.min(.16, Math.abs(normalized) * .09)}) 0%, transparent 40%, rgba(0,0,0,${Math.min(.55, Math.abs(normalized) * .25)}) 100%)` }} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <footer className="filmstrip-footer">
        <section className="caption" aria-live="polite" data-testid="dynamic-track-details">
          <div className="caption-artist" style={{ color: track.text.secondary }} data-testid="text-track-artist">{track.artist}</div>
          <h1 className="caption-title" style={{ color: track.text.primary }} data-testid="text-track-title">{track.title}</h1>
          <div className="caption-meta" style={{ color: track.text.muted }} data-testid="text-track-meta">
            <span>{track.album}</span><span aria-hidden="true" style={{ color: track.text.line }}>—</span><span>{track.year}</span>
          </div>
        </section>

        <div className="wave-holder" onPointerDown={(event) => event.stopPropagation()} onPointerMove={(event) => event.stopPropagation()} onPointerUp={(event) => event.stopPropagation()}>
          <div className={`wave ${isPlaying ? 'is-playing' : ''}`} style={{ color: track.wave, width: isPlaying ? '100%' : '600px' }} role="img" aria-label={`${isPlaying ? 'Playing' : 'Paused'} waveform for ${track.album}`} data-testid="dynamic-waveform">
            <span className="wave-line" style={{ backgroundColor: 'currentColor', opacity: isPlaying ? 0 : .7 }} />
            {WAVE_BARS.map((height, index) => (
              <span
                key={index}
                className="wave-bar"
                style={{
                  backgroundColor: 'currentColor',
                  height,
                  opacity: isPlaying ? 1 : 0,
                  animationDelay: `${(index % 16) * -wavePace.delayStep}s`,
                  animationDuration: `${wavePace.duration + (index % 5) * 0.055}s`,
                  animationDirection: index % 4 === 0
                    ? wavePace.direction
                    : wavePace.direction === 'alternate'
                      ? 'alternate-reverse'
                      : 'alternate',
                }}
              />
            ))}
          </div>
        </div>

        <div className="transport">
          <div className="time-readout" style={{ color: track.text.primary }} aria-live="polite" data-testid="dynamic-time-left">
            <div className="time-label" style={{ color: track.text.muted }}>Time left</div>
            <div className="time-value">-{formatTime(Math.max(0, TRACK_SECONDS - elapsed))}</div>
          </div>
          <div className="scrubber-wrap" onPointerDown={(event) => event.stopPropagation()} onPointerMove={(event) => event.stopPropagation()} onPointerUp={(event) => event.stopPropagation()}>
            <input
              type="range"
              className="filmstrip-scrubber"
              min="0"
              max={TRACK_SECONDS}
              step="1"
              value={elapsed}
              onInput={(event: FormEvent<HTMLInputElement>) => setElapsed(Number(event.currentTarget.value))}
              onChange={(event: FormEvent<HTMLInputElement>) => setElapsed(Number(event.currentTarget.value))}
              aria-label={`Seek through ${track.title}`}
              style={{ color: track.wave, background: `linear-gradient(90deg, ${track.wave} ${progress}%, ${track.text.track} ${progress}%)` }}
              data-testid="input-track-scrubber"
            />
          </div>
        </div>
      </footer>
    </main>
  );
}