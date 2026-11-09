import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import "./FilmstripGallery.css";

const frames = [
  {
    src: "/__mockup/images/filmstrip-gallery-cyclist.jpg",
    label: "Night passage",
  },
  {
    src: "/__mockup/images/filmstrip-gallery-shadow.jpg",
    label: "Light study",
  },
  {
    src: "/__mockup/images/filmstrip-gallery-glasshouse.jpg",
    label: "Glass house",
  },
];

export function FilmstripGallery() {
  const [activeFrame, setActiveFrame] = useState(1);

  const move = (direction: -1 | 1) => {
    setActiveFrame((current) => (current + direction + frames.length) % frames.length);
  };

  return (
    <main className="filmstrip-gallery">
      <header className="gallery-header">
        <span className="gallery-mark" />
        <span className="gallery-kicker">Archive / Movement studies</span>
      </header>

      <div className="gallery-count" aria-live="polite">
        <strong>0{activeFrame + 1}</strong>
        <span>/ 03</span>
      </div>

      <section className="gallery-stage" aria-label="Three dimensional film gallery">
        <div className="film-ribbon">
          <div className="film-body" />
          <div className="film-tail-left" aria-hidden="true" />
          <div className="film-curl-right" aria-hidden="true" />

          <div className="film-frames">
            {frames.map((frame, index) => (
              <button
                className={`film-frame ${activeFrame === index ? "is-active" : ""}`}
                key={frame.label}
                onClick={() => setActiveFrame(index)}
                type="button"
                aria-label={`View ${frame.label}`}
              >
                <img src={frame.src} alt={frame.label} />
                <span className="frame-label">Frame 0{index + 1} — {frame.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer className="gallery-footer">
        <span className="gallery-caption">Select a frame to bring it forward</span>
        <div className="gallery-controls">
          <button
            className="gallery-button"
            onClick={() => move(-1)}
            type="button"
            aria-label="Previous image"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
          </button>
          <button
            className="gallery-button"
            onClick={() => move(1)}
            type="button"
            aria-label="Next image"
          >
            <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </footer>
    </main>
  );
}