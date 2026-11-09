import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { Container } from "@videojs/react";
import { Video, VideoPlayer, usePlayer } from "@videojs/react/video";
import {
  ArrowLeft,
  ArrowRight,
  Expand,
  Minimize,
  Menu,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { TRACKS } from "./tracks";

const STEP = 408;
const BARS = Array.from(
  { length: 56 },
  (_, i) => 12 + Math.abs(Math.sin(i * 2.15)) * 28,
);
const asset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
const SAMPLE = asset("media/psst-motion-study.mp4");
const wrap = (index: number) =>
  ((index % TRACKS.length) + TRACKS.length) % TRACKS.length;
export const formatTime = (seconds: number) => {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
};

export default function App() {
  return (
    <VideoPlayer>
      <Filmstrip />
    </VideoPlayer>
  );
}

function Filmstrip() {
  const player = usePlayer();
  const paused = usePlayer((state) => state.paused);
  const currentTime = usePlayer((state) => state.currentTime);
  const mediaDuration = usePlayer((state) => state.duration);
  const volume = usePlayer((state) => state.volume);
  const muted = usePlayer((state) => state.muted);
  const volumeAvailability = usePlayer((state) => state.volumeAvailability);
  const isFullscreen = usePlayer((state) => state.isFullscreen);
  const fullscreenAvailability = usePlayer(
    (state) => state.fullscreenAvailability,
  );
  const duration = Number.isFinite(mediaDuration) ? mediaDuration : 0;
  const elapsed = Number.isFinite(currentTime) ? currentTime : 0;
  const [active, setActive] = useState(5);
  const [position, setPosition] = useState(5 * STEP);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [loadKey, setLoadKey] = useState(0);
  const video = useRef<HTMLVideoElement>(null);
  const stage = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const target = useRef(5 * STEP);
  const positionRef = useRef(5 * STEP);
  const frame = useRef<number | null>(null);
  const gesture = useRef<{
    x: number;
    y: number;
    target: number;
    moved: boolean;
  } | null>(null);
  const ignoreClick = useRef(false);
  const track = TRACKS[active];

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  const animateTo = useCallback(
    (next: number) => {
      target.current = next;
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      if (reducedMotion) {
        positionRef.current = next;
        setPosition(next);
        frame.current = null;
        return;
      }
      const tick = () => {
        const delta = target.current - positionRef.current;
        positionRef.current =
          Math.abs(delta) < 0.3
            ? target.current
            : positionRef.current + delta * 0.14;
        setPosition(positionRef.current);
        frame.current =
          Math.abs(delta) < 0.3 ? null : requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    },
    [reducedMotion],
  );

  const select = useCallback(
    (index: number) => {
      const next = wrap(index);
      let difference = next - wrap(Math.round(target.current / STEP));
      if (difference > TRACKS.length / 2) difference -= TRACKS.length;
      if (difference < -TRACKS.length / 2) difference += TRACKS.length;
      if (next !== active) {
        player.pause();
        setActive(next);
        setStarted(false);
        setError("");
        setNotice("");
        setLoading(true);
      }
      animateTo((Math.round(target.current / STEP) + difference) * STEP);
    },
    [active, animateTo, player],
  );

  const togglePlay = useCallback(async () => {
    setNotice("");
    if (!paused) {
      player.pause();
      return;
    }
    try {
      await player.play();
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      setNotice("Playback could not start. Please try Play again.");
    }
  }, [paused, player]);
  const fullscreen = useCallback(async () => {
    try {
      await (isFullscreen
        ? player.exitFullscreen()
        : player.requestFullscreen());
    } catch {
      setNotice("Fullscreen is unavailable in this browser window.");
    }
  }, [isFullscreen, player]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: globalThis.PointerEvent) => {
      if (!menu.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [menuOpen]);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    let last = 0;
    const wheel = (event: WheelEvent) => {
      // Leave ordinary vertical scrolling and browser zoom alone.
      if (
        event.ctrlKey ||
        (!event.shiftKey && Math.abs(event.deltaX) <= Math.abs(event.deltaY))
      )
        return;
      event.preventDefault();
      if (performance.now() - last < 300) return;
      const delta = event.deltaX || event.deltaY;
      if (Math.abs(delta) < 5) return;
      last = performance.now();
      select(active + Math.sign(delta));
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [active, select]);

  const pointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0 || (event.target as Element).closest(".stage-play"))
      return;
    ignoreClick.current = false;
    gesture.current = {
      x: event.clientX,
      y: event.clientY,
      target: target.current,
      moved: false,
    };
  };
  const pointerMove = (event: PointerEvent<HTMLElement>) => {
    const current = gesture.current;
    if (!current) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (!current.moved && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
      gesture.current = null;
      return;
    }
    if (Math.abs(dx) < 8 && !current.moved) return;
    current.moved = true;
    ignoreClick.current = true;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    animateTo(current.target - dx * 1.4);
  };
  const pointerEnd = () => {
    const current = gesture.current;
    gesture.current = null;
    setDragging(false);
    if (current?.moved) select(Math.round(target.current / STEP));
  };
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && menuOpen) {
      setMenuOpen(false);
      menuButton.current?.focus();
      return;
    }
    if (
      (event.target as HTMLElement).closest(
        "button, input, a, textarea, select",
      )
    )
      return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      select(active - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      select(active + 1);
    } else if (event.key === " " || event.key.toLowerCase() === "k") {
      event.preventDefault();
      void togglePlay();
    } else if (event.key.toLowerCase() === "m")
      player.setMuted(!(muted || volume === 0));
    else if (event.key.toLowerCase() === "f") void fullscreen();
  };
  const retry = () => {
    setError("");
    setNotice("");
    setLoading(true);
    setStarted(false);
    setLoadKey((value) => value + 1);
  };
  const progress = duration ? Math.min(100, (elapsed / duration) * 100) : 0;
  const css = {
    "--scene": track.scene,
    "--primary": track.text.primary,
    "--secondary": track.text.secondary,
    "--muted": track.text.muted,
    "--line": track.text.line,
    "--accent": track.wave,
  } as CSSProperties;

  return (
    <Container
      className={`filmstrip-app ${dragging ? "is-dragging" : ""}`}
      style={css}
      onKeyDown={keyboard}
      data-testid="gallery-canvas"
    >
      <header className="filmstrip-header">
        <div className="brand">
          <span>
            PSST<span className="brand-dot">.</span>
          </span>
          <small>A LITTLE LOUDER. A LITTLE CLOSER.</small>
        </div>
        <div className="header-controls" aria-label="Playback controls">
          <button
            className="icon-button"
            onClick={() => select(active - 1)}
            aria-label="Previous track"
            data-testid="button-header-previous-track"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            className="icon-button play-button"
            onClick={() => void togglePlay()}
            disabled={!!error}
            aria-label={paused ? "Play" : "Pause"}
            data-testid="button-header-play-toggle"
          >
            {paused ? (
              <Play size={18} fill="currentColor" />
            ) : (
              <Pause size={18} fill="currentColor" />
            )}
          </button>
          <button
            className="icon-button"
            onClick={() => select(active + 1)}
            aria-label="Next track"
            data-testid="button-header-next-track"
          >
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="menu-wrap" ref={menu}>
          <button
            className="icon-button"
            ref={menuButton}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="gallery-info"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          {menuOpen && (
            <div className="menu-popover" id="gallery-info">
              <p className="eyebrow">The local preview</p>
              <p>Nine covers. One continuous filmstrip.</p>
              <p>
                Drag or use left / right to browse. Space or K to play, M to
                mute, F for fullscreen. Tab to the sliders for precise control.
              </p>
              <p>
                All covers play the same original 16-second motion study with a
                soft test tone. Artist and album names are demo artwork, not
                licensed music.
              </p>
              <p>Powered by Video.js 10.3.0.</p>
            </div>
          )}
        </div>
      </header>

      <section
        ref={stage}
        className="carousel-stage"
        aria-label="3D filmstrip. Use left and right arrows to browse."
        tabIndex={0}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerEnd}
        onPointerCancel={pointerEnd}
      >
        <div className="carousel-ring">
          {TRACKS.map((item, index) => {
            const raw = index - position / STEP;
            const normalized =
              ((((raw + TRACKS.length / 2) % TRACKS.length) + TRACKS.length) %
                TRACKS.length) -
              TRACKS.length / 2;
            const angle = normalized * 30;
            const radians = (angle * Math.PI) / 180;
            const selected = index === active;
            const cardStyle = {
              transform: `translateX(${Math.sin(radians) * 760}px) translateZ(${(Math.cos(radians) - 1) * 760}px) rotateY(${angle}deg) rotateZ(${Math.max(-14, Math.min(14, normalized * 5))}deg) scale(${selected ? 1.13 : 1})`,
              opacity: Math.max(0.12, 1 - Math.abs(normalized) * 0.2),
            };
            return selected ? (
              <div
                key={index}
                className="album-card is-active"
                style={cardStyle}
              >
                <div className="album-card-inner">
                  <Video
                    key={`${active}-${loadKey}`}
                    ref={video}
                    className={`filmstrip-video ${started ? "has-started" : ""}`}
                    src={SAMPLE}
                    poster={asset(item.src)}
                    preload="auto"
                    playsInline
                    aria-label="PSST original motion study"
                    onLoadStart={() => setLoading(true)}
                    onLoadedMetadata={() => setLoading(false)}
                    onCanPlay={() => setLoading(false)}
                    onWaiting={() => setLoading(true)}
                    onPlaying={() => {
                      setStarted(true);
                      setLoading(false);
                      setError("");
                    }}
                    onEnded={() => setLoading(false)}
                    onError={() => {
                      setLoading(false);
                      setError(
                        "The demo video could not load. Check the local media file and retry.",
                      );
                    }}
                  />
                  <div className="card-label">
                    <span>0{index + 1} / 09</span>
                    <span>LOCAL MOTION STUDY</span>
                  </div>
                  {!started && !error && (
                    <button
                      className="stage-play"
                      onClick={() => void togglePlay()}
                      aria-label="Play motion study"
                    >
                      <Play size={24} fill="currentColor" />
                    </button>
                  )}
                  {loading && !error && (
                    <div className="media-status" role="status">
                      <span className="spinner" />
                      Loading video
                    </div>
                  )}
                  {error && (
                    <div className="media-error" role="alert">
                      <p>{error}</p>
                      <button className="retry-button" onClick={retry}>
                        <RotateCcw size={14} /> Retry video
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                key={index}
                type="button"
                className="album-card"
                style={cardStyle}
                onClick={() => {
                  if (!ignoreClick.current) select(index);
                }}
                aria-label={`Select ${item.artist}, ${item.title}`}
                tabIndex={-1}
                data-testid={`button-album-${index}`}
              >
                <span className="album-card-inner">
                  <img src={asset(item.src)} alt="" draggable={false} />
                  <span className="album-sheen" />
                </span>
              </button>
            );
          })}
        </div>
        <span className="browse-hint" aria-hidden="true">
          DRAG TO DISCOVER <span>↔</span> {String(active + 1).padStart(2, "0")}{" "}
          / 09
        </span>
      </section>

      <footer className="filmstrip-footer">
        <section
          className="caption"
          aria-live="polite"
          data-testid="dynamic-track-details"
        >
          <div className="caption-artist">{track.artist}</div>
          <h1 className="caption-title">{track.title}</h1>
          <div className="caption-meta">
            {track.album}
            <span aria-hidden="true">/</span>
            {track.year}
          </div>
          <p className="demo-note">Original demo video · artwork concept</p>
        </section>
        <div
          className={`wave ${!paused && !loading ? "is-playing" : ""}`}
          aria-hidden="true"
        >
          {BARS.map((height, i) => (
            <span key={i} style={{ height, animationDelay: `${i * -0.09}s` }} />
          ))}
        </div>
        <div className="transport">
          <div className="time-row">
            <span>
              {formatTime(elapsed)}{" "}
              <span className="time-divider">/ {formatTime(duration)}</span>
            </span>
            <span className="sample-label">MOTION STUDY</span>
          </div>
          <input
            type="range"
            className="filmstrip-scrubber"
            min={0}
            max={duration || 1}
            step={0.1}
            value={Math.min(elapsed, duration || 1)}
            disabled={!duration || !!error}
            onChange={(event) => player.seek(Number(event.currentTarget.value))}
            aria-label="Seek video"
            aria-valuetext={`${formatTime(elapsed)} of ${formatTime(duration)}`}
            style={{
              background: `linear-gradient(90deg, var(--accent) ${progress}%, var(--line) ${progress}%)`,
            }}
            data-testid="input-track-scrubber"
          />
          <div className="secondary-controls">
            <button
              className="icon-button"
              onClick={() => player.setMuted(!(muted || volume === 0))}
              aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
            >
              {muted || volume === 0 ? (
                <VolumeX size={17} />
              ) : (
                <Volume2 size={17} />
              )}
            </button>
            <input
              type="range"
              className="volume-slider"
              disabled={volumeAvailability !== "available"}
              title={
                volumeAvailability === "available"
                  ? "Volume"
                  : "Use your device volume controls"
              }
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(event) => {
                const next = Number(event.currentTarget.value);
                if (next > 0) player.setMuted(false);
                player.setVolume(next);
              }}
              aria-label="Volume"
              aria-valuetext={`${Math.round((muted ? 0 : volume) * 100)} percent`}
            />
            <button
              className="icon-button fullscreen-button"
              onClick={() => void fullscreen()}
              disabled={fullscreenAvailability !== "available"}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize size={17} /> : <Expand size={17} />}
            </button>
          </div>
        </div>
        {notice && (
          <div className="playback-notice" role="status">
            {notice}
          </div>
        )}
      </footer>
    </Container>
  );
}
