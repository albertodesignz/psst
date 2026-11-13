# PSST v2 cassette skin

Local prototype: http://127.0.0.1:5173/v2

Run `./Start-PSST.ps1` as before. The original v1 remains at `/`; its App.tsx and stylesheet are unchanged. A small entry-point selection mounts the separate cassette component at `/v2` (also `/v2/`). The v2 release preserves v1 at / and adds the separate cassette skin at /v2.

## Working behavior

Video.js 10.3.0 drives play/pause, seek, time, volume/mute, fullscreen and end/replay. Stop pauses and returns to zero. VIDEO toggles the picture while preserving audio. CC controls actual English WebVTT sample captions. HD is intentionally disabled because the original 640 × 880 sample has no alternate HD rendition. Errors show a retry action. Keyboard: Space/K play, arrows seek 10 seconds, M mute, C captions, F fullscreen. Buttons and native range inputs remain keyboard accessible.

The astronaut art is the poster, not the video. Playing uses the existing original ~16-second motion study with a soft synthesized test tone. Track names are fictional design metadata. The generated cassette, poster, vent image and metal material are separate raster assets, not a flattened player screenshot. Decorative cassette reels are now layered and animated; see the local-review section below.

## Fonts and next refinement

The user-supplied Adobe Fonts kit https://use.typekit.net/cbf4dfv.css loads only when v2 is mounted. The title uses Unibody 8 Pro Bold (700), and the time display uses Unibody 8 Pro Regular (400). Browser font inspection confirmed both actual custom font faces, not fallbacks. Quantico remains a fallback if Adobe is unavailable. No proprietary font binaries are bundled.

Potential next refinements: licensed final media, HD renditions and manifest, actual artist metadata, smaller optimized asset encodings, more detailed hardware fasteners and edge lighting, and physical-device/Safari/Firefox checks. The current release remains a demo with sample media.

## Verification

Passed full workspace typecheck and aggregate production build after the final code edits. Scoped Edge browser QA passed media playback/pause, seeking, stop/reset, volume-zero and mute/unmute UI states, picture toggle, visible captions, failure/retry (temporary local media blocking, subsequently cleared), end/replay, keyboard playback, and v1 playback/next-track regression. Fullscreen worked in an observed browser session and exit was verified; its unavailable fallback was also observed under browser automation. No errors/warnings were returned in final clean browser logs.

Responsive checks: 1488 × 1058 desktop, 390 × 844 mobile, and 320 × 700 narrow layout (no horizontal overflow). Native mobile devices, Firefox, Safari, and a screen-reader audit were not run. Existing v1 automated suites were not rerun; v1 received the scoped regression checks above.

Screenshots: `.local/qa/v2-desktop-final.png`, `.local/qa/v2-mobile-final.png`. See `design-qa.md` for visual comparison notes.



Release: v2 playback fills its existing video panel edge to edge using centered cover cropping, as requested. Portrait footage is cropped; the cassette and metadata layout is unchanged. Vercel rewrites serve direct /v2 and /v2/ navigation.

## VHS Archive navigation and timeline release

The < and > buttons remain in the metadata panel. < returns through this tab's playback history. > chooses a new random publicly playable MP4 from the requested VHS Vault / commercials / vhscommercials filtered collection and attempts autoplay. Browsers may require Play to start. SEEK -10s/+10s remain unchanged. History resets on reload; Next after Back starts a new random branch. Stop cancels an in-flight selection. Cancel keeps the current video paused.

The seek slider and elapsed/total time now overlay the video. They appear on mouseover or keyboard focus; on touch/coarse-pointer devices they stay visible. The separate timeline row is removed, moving the main controls up. All original playback controls and metadata arrows remain available.

Search matches the supplied filters: collection:vhsvault AND subject:"commercials" AND mediatype:movies AND collection:vhscommercials, excluding restricted items. This returned 7,327 candidates when checked. Selection shuffles a random 25-item search page, validates metadata and probes publicly playable MP4s, with bounded cancellation/timeouts. It is not a fixed playlist or an exact uniform sample of every file. No license or file-size exclusion is silently added. Rights metadata and supported declared license links are displayed when present; otherwise the panel says rights are not specified and links to the Archive item. Availability does not establish reuse rights. Content is not curated or rehosted.

The approved edge-to-edge crop remains. Archive videos have no fabricated sample captions; CC is disabled for them. Long titles wrap. Source links retain attribution and context.

Verification: 14 parser checks (`node --experimental-strip-types artifacts/filmstrip-gallery/src/archive.test.ts`), full workspace typecheck/build, actual Archive playback, session history, restored seek controls, cancellation/Stop, search outage recovery, desktop hover/focus and narrow layout. This release preserves v1 at / and updates v2 at /v2.

## Dynamic label and reels (local review)

The cassette is now layered SVG artwork using the original shell and reel texture, stationary axles/glass shading, and a live handwritten-style label. The label shares the active history item's title and wraps/clamps within the paper face; full title remains in metadata. No new font service or raster payload was added.

Both reels turn clockwise from actual media time during playback. Pause/buffering/end/error stop ordinary rotation; seeking provides bounded directional feedback, including timeline, keyboard and +/-10-second controls. Stop cancels feedback without a rewind animation. New tracks reset decorative rotation. Reduced-motion preference stops the JavaScript animation, and hidden pages suspend it. Motion updates SVG transforms without per-frame React rendering.

Checked on Edge: playback and paused hold, forward/reverse seeking, timeline input changes, keyboard seeking, Stop during motion, simulated waiting/playing events, reduced-motion emulation, real VHS playback (KIMA/CBS and CMT), title synchronization and previous history. Layouts inspected at desktop and 390px touch emulation; 320px overflow check passed. Scoped v1 playback regression passed. Independent static review found a two-line sizing issue, corrected before final checks. Full workspace typecheck/build and 14 Archive parser tests passed. Physical mobile, Safari/Firefox and screen-reader checks remain unrun. No push/deployment.
