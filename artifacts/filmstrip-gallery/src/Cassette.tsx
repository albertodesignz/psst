import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Container } from "@videojs/react";
import { Video, VideoPlayer, usePlayer } from "@videojs/react/video";
import {
  BsPlayFill,
  BsPauseFill,
  BsRewindFill,
  BsFastForwardFill,
  BsChevronLeft,
  BsChevronRight,
  BsStopFill,
  BsVolumeUpFill,
  BsVolumeMuteFill,
  BsBadgeCc,
  BsFullscreen,
  BsFullscreenExit,
  BsDiscFill,
} from "react-icons/bs";
import "./cassette.css";
import { randomArchiveTrack, type ArchiveTrack } from "./archive";

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const sample: ArchiveTrack = {
  id: "psst-sample",
  src: asset("media/psst-motion-study.mp4"),
  poster: asset("skins/v2/poster.png"),
  title: "Midnight Horizon",
  artist: "The Night Drivers",
  album: "Echoes in Transit",
  year: 2024,
};
const time = (value: number) => {
  const s = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  return `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export default function Cassette() {
  useEffect(() => {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "https://use.typekit.net/cbf4dfv.css";
    stylesheet.dataset.psstSkin = "v2";
    document.head.appendChild(stylesheet);
    return () => stylesheet.remove();
  }, []);
  return (
    <VideoPlayer>
      <CassetteDeck />
    </VideoPlayer>
  );
}

function CassetteDeck() {
  const player = usePlayer();
  const paused = usePlayer((s) => s.paused);
  const currentTime = usePlayer((s) => s.currentTime);
  const mediaDuration = usePlayer((s) => s.duration);
  const volume = usePlayer((s) => s.volume);
  const muted = usePlayer((s) => s.muted);
  const volumeAvailability = usePlayer((s) => s.volumeAvailability);
  const isFullscreen = usePlayer((s) => s.isFullscreen);
  const fullscreenAvailability = usePlayer((s) => s.fullscreenAvailability);
  const duration = Number.isFinite(mediaDuration) ? mediaDuration : 0;
  const elapsed = Number.isFinite(currentTime) ? currentTime : 0;
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [captions, setCaptions] = useState(false);
  const [captionReady, setCaptionReady] = useState(false);
  const [loadKey, setLoadKey] = useState(0);
  const [showVideo, setShowVideo] = useState(true);
  const [started, setStarted] = useState(false);
  const [history, setHistory] = useState<ArchiveTrack[]>([sample]);
  const [position, setPosition] = useState(0);
  const metadata = history[position];
  const [finding, setFinding] = useState(false);
  const request = useRef<AbortController | null>(null);
  const autoplay = useRef(false);
  useEffect(() => () => request.current?.abort(), []);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setLoading(false);
      setError("Video loading timed out. Retry, or choose Next or Back.");
    }, 25000);
    return () => clearTimeout(timer);
  }, [loading, loadKey]);

  function resetTrack() {
    player.pause();
    setError("");
    setNotice("");
    setLoading(true);
    setStarted(false);
    setCaptionReady(false);
    setCaptions(false);
    autoplay.current = true;
    setLoadKey((v) => v + 1);
  }
  function back() {
    request.current?.abort();
    request.current = null;
    setFinding(false);
    if (position === 0) return;
    resetTrack();
    setPosition((v) => v - 1);
  }
  async function next() {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setFinding(true);
    setNotice("");
    player.pause();
    try {
      const track = await randomArchiveTrack(
        new Set(history.map((item) => item.id)),
        controller.signal,
      );
      if (controller.signal.aborted) return;
      resetTrack();
      setHistory((items) => [...items.slice(0, position + 1), track]);
      setPosition(position + 1);
    } catch (cause) {
      if (!controller.signal.aborted)
        setNotice(
          cause instanceof TypeError
            ? "Could not reach Internet Archive. Check your connection or try Next again."
            : cause instanceof Error && cause.name !== "TimeoutError"
              ? cause.message
              : "Archive is taking too long. Try Next again.",
        );
    } finally {
      if (request.current === controller) {
        request.current = null;
        setFinding(false);
      }
    }
  }
  function readyToPlay() {
    setLoading(false);
    if (autoplay.current) {
      autoplay.current = false;
      void player
        .play()
        .catch(() => setNotice("Video ready. Press Play to start playback."));
    }
  }

  useEffect(() => {
    const media = video.current;
    const element = media?.querySelector("track");
    if (!media || !element) return;
    const ready = () => setCaptionReady(element.readyState === 2);
    const prepare = () => {
      element.track.mode = "hidden";
      ready();
    };
    element.addEventListener("load", ready);
    media.addEventListener("loadedmetadata", prepare);
    prepare();
    return () => {
      element.removeEventListener("load", ready);
      media.removeEventListener("loadedmetadata", prepare);
    };
  }, [loadKey]);

  async function togglePlay() {
    setNotice("");
    if (!paused) {
      player.pause();
      return;
    }
    try {
      await player.play();
    } catch {
      setNotice("Playback could not start. Try Play again.");
    }
  }
  async function fullscreen() {
    try {
      await (isFullscreen
        ? player.exitFullscreen()
        : player.requestFullscreen());
    } catch {
      setNotice("Fullscreen is unavailable in this browser.");
    }
  }
  function toggleCaptions() {
    const track = video.current?.textTracks[0];
    if (!track || !captionReady) return;
    const next = !captions;
    track.mode = next ? "showing" : "hidden";
    setCaptions(next);
  }
  function retry() {
    setError("");
    setNotice("");
    setLoading(true);
    setStarted(false);
    setCaptionReady(false);
    setCaptions(false);
    setLoadKey((v) => v + 1);
  }
  function keyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (
      (event.target as HTMLElement).closest("button, input, a") ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    const key = event.key.toLowerCase();
    if (key === " " || key === "k") {
      event.preventDefault();
      void togglePlay();
    } else if (key === "arrowleft" || key === "arrowright") {
      event.preventDefault();
      player.seek(
        Math.max(
          0,
          Math.min(duration, elapsed + (key === "arrowleft" ? -10 : 10)),
        ),
      );
    } else if (key === "m") player.setMuted(!muted);
    else if (key === "f") void fullscreen();
    else if (key === "c") toggleCaptions();
  }
  return (
    <main className="cassette-page">
      <Container
        className="cassette-deck"
        onKeyDown={keyboard}
        tabIndex={0}
        aria-label="PSST v2 cassette video player"
        data-testid="cassette-deck"
      >
        <header className="deck-display deck-inset">
          <div className="deck-title">
            <h1>{metadata.title}</h1>
            <p>{metadata.artist}</p>
          </div>
          <img
            className="deck-vents"
            src={asset("skins/v2/vents.png")}
            alt=""
          />
          <div className="deck-format-controls">
            <button
              className={`deck-indicator ${showVideo ? "active" : ""}`}
              aria-pressed={showVideo}
              onClick={() => setShowVideo(!showVideo)}
              title="Show or hide the video picture"
            >
              <span aria-hidden="true" />
              VIDEO
            </button>
            <button
              className={`deck-indicator ${captions ? "active" : ""}`}
              aria-pressed={captions}
              onClick={toggleCaptions}
              disabled={!captionReady}
              aria-label="Toggle closed captions"
            >
              <span aria-hidden="true" />
              CC
            </button>
            <button
              className="deck-indicator"
              aria-label="HD selection unavailable"
              disabled
              title="Automatic source selection. No manual HD rendition selector."
            >
              <span aria-hidden="true" />
              HD
            </button>
          </div>
        </header>
        <div className="deck-body">
          <section
            className="deck-screen deck-inset"
            aria-label="Video display"
          >
            <Video
              key={loadKey}
              ref={video}
              className={`deck-video ${!showVideo ? "picture-off" : ""} ${started ? "has-started" : ""}`}
              src={metadata.src}
              poster={metadata.poster}
              preload="metadata"
              playsInline
              aria-label={metadata.title}
              onLoadedMetadata={() => setLoading(false)}
              onCanPlay={readyToPlay}
              onWaiting={() => setLoading(true)}
              onPlaying={() => {
                setStarted(true);
                setLoading(false);
                setError("");
              }}
              onSeeked={() => setLoading(false)}
              onEnded={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError(
                  "This video could not load. Retry, or choose Next or Back.",
                );
              }}
            >
              {!metadata.sourceUrl && (
                <track
                  kind="captions"
                  src={asset("skins/v2/sample.en.vtt")}
                  srcLang="en"
                  label="English sample captions"
                  default
                  onLoad={() => {
                    const track = video.current?.textTracks[0];
                    if (track) track.mode = "hidden";
                    setCaptionReady(true);
                  }}
                  onError={() => setCaptionReady(false)}
                />
              )}
            </Video>
            {!showVideo && (
              <div className="deck-screen-message">
                PICTURE OFF
                <span>Audio and playback controls remain active</span>
              </div>
            )}
            {loading && !error && (
              <div className="deck-status" role="status">
                Loading video…
              </div>
            )}
            {error && (
              <div className="deck-screen-message" role="alert">
                {error}
                <button onClick={retry}>Retry video</button>
              </div>
            )}
            <div
              className="deck-timeline deck-inset deck-video-timeline"
              aria-label="Video timeline"
            >
              <div className="deck-range">
                <progress
                  aria-hidden="true"
                  max={duration || 1}
                  value={elapsed}
                />
                <input
                  aria-label="Seek video"
                  aria-valuetext={`${time(elapsed)} of ${time(duration)}`}
                  type="range"
                  min={0}
                  max={duration || 1}
                  step={0.1}
                  value={Math.min(elapsed, duration || 1)}
                  disabled={!duration || !!error}
                  onChange={(e) => player.seek(Number(e.currentTarget.value))}
                />
              </div>
              <output aria-label="Playback time">
                {time(elapsed)} <span>/ {time(duration)}</span>
              </output>
            </div>
          </section>
          <aside
            className="deck-side"
            aria-label="Cassette and track information"
          >
            <img
              className="deck-tape"
              src={asset("skins/v2/cassette.png")}
              alt="Black vintage cassette labeled Video Mix v2, with ivory reels and orange accents"
            />
            <section
              className="deck-metadata deck-inset"
              aria-label="Track information"
            >
              <img
                src={metadata.poster}
                alt=""
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                key={metadata.id}
              />
              <div>
                <nav
                  className="deck-track-navigation"
                  aria-label="Song and video navigation"
                >
                  <button
                    onClick={back}
                    disabled={position === 0 && !finding}
                    aria-label="Previous video"
                    title="Previous song or video"
                  >
                    <BsChevronLeft aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => void next()}
                    disabled={finding}
                    aria-label="Next random Archive video"
                    title="Play a random VHS Vault commercial"
                  >
                    <BsChevronRight aria-hidden="true" />
                  </button>
                </nav>
                <h2>{metadata.title}</h2>
                <p>{metadata.artist}</p>
                <p className="deck-album">
                  <BsDiscFill aria-hidden="true" />{" "}
                  <span>
                    {metadata.sourceUrl ? "Source: " : "Album: "}
                    {metadata.album}
                    {metadata.year && (
                      <span className="deck-year">
                        {" "}
                        · Year: {metadata.year}
                      </span>
                    )}
                  </span>
                </p>
                {metadata.sourceUrl && (
                  <p className="deck-rights">{metadata.rights}</p>
                )}
                {metadata.sourceUrl && (
                  <p className="deck-source-links">
                    <a
                      href={metadata.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Archive
                    </a>
                    {metadata.licenseUrl && (
                      <a
                        href={metadata.licenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        License
                      </a>
                    )}
                  </p>
                )}
              </div>
            </section>
          </aside>
        </div>
        <div
          className="deck-controls deck-inset"
          role="group"
          aria-label="Playback controls"
        >
          <div className="deck-transport">
            <label className="deck-key-group deck-play">
              <button
                className="deck-key"
                onClick={() => void togglePlay()}
                aria-label={paused ? "Play" : "Pause"}
                disabled={!!error}
              >
                {paused ? <BsPlayFill /> : <BsPauseFill />}
              </button>
              <span>PLAY / PAUSE</span>
            </label>
            <label className="deck-key-group">
              <button
                className="deck-key"
                onClick={() => player.seek(Math.max(0, elapsed - 10))}
                disabled={!duration || !!error}
                aria-label="Seek back 10 seconds"
              >
                <BsRewindFill />
              </button>
              <span>SEEK −10s</span>
            </label>
            <label className="deck-key-group">
              <button
                className="deck-key"
                onClick={() => player.seek(Math.min(duration, elapsed + 10))}
                disabled={!duration || !!error}
                aria-label="Seek forward 10 seconds"
              >
                <BsFastForwardFill />
              </button>
              <span>SEEK +10s</span>
            </label>
            <label className="deck-key-group">
              <button
                className="deck-key"
                onClick={() => {
                  request.current?.abort();
                  request.current = null;
                  setFinding(false);
                  autoplay.current = false;
                  player.pause();
                  player.seek(0);
                }}
                disabled={!finding && (!duration || !!error)}
                aria-label="Stop"
              >
                <BsStopFill />
              </button>
              <span>STOP</span>
            </label>
          </div>
          <div className="deck-volume">
            <label htmlFor="deck-volume-slider">VOLUME</label>
            <div>
              <button
                onClick={() => player.setMuted(!muted)}
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted || volume === 0 ? (
                  <BsVolumeMuteFill />
                ) : (
                  <BsVolumeUpFill />
                )}
              </button>
              <div className="deck-range">
                <progress
                  aria-hidden="true"
                  max={1}
                  value={muted ? 0 : volume}
                />
                <input
                  id="deck-volume-slider"
                  aria-label="Volume"
                  aria-valuetext={`${Math.round((muted ? 0 : volume) * 100)} percent`}
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  disabled={volumeAvailability !== "available"}
                  title={
                    volumeAvailability === "available"
                      ? "Volume"
                      : "Use device volume buttons"
                  }
                  onChange={(e) => {
                    const n = Number(e.currentTarget.value);
                    player.setVolume(n);
                    if (n > 0) player.setMuted(false);
                  }}
                />
              </div>
              <BsVolumeUpFill aria-hidden="true" />
            </div>
          </div>
          <div className="deck-options">
            <label className="deck-key-group">
              <button
                className="deck-key"
                onClick={toggleCaptions}
                aria-label="Captions"
                aria-pressed={captions}
                disabled={!captionReady}
              >
                <BsBadgeCc />
              </button>
              <span>CAPTIONS</span>
            </label>
            <label className="deck-key-group">
              <button
                className="deck-key"
                onClick={() => void fullscreen()}
                aria-label={
                  isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                }
                disabled={fullscreenAvailability !== "available"}
              >
                {isFullscreen ? <BsFullscreenExit /> : <BsFullscreen />}
              </button>
              <span>FULLSCREEN</span>
            </label>
          </div>
        </div>
        {finding && (
          <p className="deck-notice" role="status">
            Finding a playable VHS Vault commercial…{" "}
            <button
              onClick={() => {
                request.current?.abort();
                request.current = null;
                setFinding(false);
                setNotice(
                  "Search cancelled. Press Play to resume the current video.",
                );
              }}
            >
              Cancel
            </button>
          </p>
        )}
        {notice && (
          <p className="deck-notice" role="status">
            {notice}
          </p>
        )}
      </Container>
      <footer className="deck-footnote">
        <a href={import.meta.env.BASE_URL}>PSST v1</a>
        <span>
          {metadata.sourceUrl
            ? "PSST v2 · Internet Archive · VHS Vault commercials · Rights may be unspecified"
            : "PSST v2 · Original sample · Press > for VHS Vault commercials"}
        </span>
        <span>Video.js 10.3.0</span>
      </footer>
    </main>
  );
}
