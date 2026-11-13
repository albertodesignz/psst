import { useId, type RefObject } from "react";

export function CassetteArtwork({
  title,
  image,
  reels,
}: {
  title: string;
  image: string;
  reels: RefObject<SVGGElement | null>;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <div className="deck-tape" title={title}>
      <svg viewBox="0 0 1536 1024" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${id}-paper`} x2="0" y2="1">
            <stop stopColor="#cba87d" />
            <stop offset=".15" stopColor="#e3c6a0" />
            <stop offset=".8" stopColor="#e6cba8" />
            <stop offset="1" stopColor="#cfac83" />
          </linearGradient>
          <radialGradient id={`${id}-glass`} cx=".35" cy=".15" r=".9">
            <stop stopColor="#fff0cf" stopOpacity=".13" />
            <stop offset=".55" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity=".3" />
          </radialGradient>
          {[450, 1090].map((cx) => (
            <clipPath key={cx} id={`${id}-reel-${cx}`}>
              <circle cx={cx} cy="495" r="168" />
            </clipPath>
          ))}
          {[450, 1090].map((cx) => (
            <clipPath key={cx} id={`${id}-hub-${cx}`}>
              <circle cx={cx} cy="495" r="57" />
            </clipPath>
          ))}
        </defs>
        <image href={image} width="1536" height="1024" />
        {/* Rebuild just the paper face, retaining the photographed edge/shadow. */}
        <path
          d="M146 94 H1394 L1422 121 V277 Q1422 294 1400 296 H138 Q114 294 114 278 V124Z"
          fill={`url(#${id}-paper)`}
        />
        {[153, 196, 238].map((y) => (
          <path
            key={y}
            d={`M149 ${y} H1387`}
            stroke="#806c55"
            strokeOpacity=".38"
            strokeWidth="2"
          />
        ))}
        <g ref={reels}>
          {[450, 1090].map((cx) => (
            <g key={cx} clipPath={`url(#${id}-reel-${cx})`}>
              <circle cx={cx} cy="495" r="168" fill="#211a12" />
              <g data-reel data-cx={cx}>
                <image href={image} width="1536" height="1024" />
              </g>
            </g>
          ))}
        </g>
        {/* Axles and glass highlights stay fixed while the reels turn. */}
        {[450, 1090].map((cx) => (
          <g key={cx}>
            <image
              href={image}
              width="1536"
              height="1024"
              clipPath={`url(#${id}-hub-${cx})`}
            />
            <circle
              cx={cx}
              cy="495"
              r="168"
              fill={`url(#${id}-glass)`}
              pointerEvents="none"
            />
          </g>
        ))}
      </svg>
      <div className="deck-tape-label" aria-hidden="true">
        <span
          className={
            title.length > 55
              ? "long-title"
              : title.length > 28
                ? "medium-title"
                : ""
          }
        >
          {title}
        </span>
      </div>
    </div>
  );
}
