# PSST v2 cassette skin

Local prototype: http://127.0.0.1:5173/v2

Run `./Start-PSST.ps1` as before. The original v1 remains at `/`; its App.tsx and stylesheet are unchanged. A small entry-point selection mounts the separate cassette component at `/v2` (also `/v2/`). The v2 release preserves v1 at / and adds the separate cassette skin at /v2.

## Working behavior

Video.js 10.3.0 drives play/pause, seek, time, volume/mute, fullscreen and end/replay. Stop pauses and returns to zero. VIDEO toggles the picture while preserving audio. CC controls actual English WebVTT sample captions. HD is intentionally disabled because the original 640 × 880 sample has no alternate HD rendition. Errors show a retry action. Keyboard: Space/K play, arrows seek 10 seconds, M mute, C captions, F fullscreen. Buttons and native range inputs remain keyboard accessible.

The astronaut art is the poster, not the video. Playing uses the existing original ~16-second motion study with a soft synthesized test tone. Track names are fictional design metadata. The generated cassette, poster, vent image and metal material are separate raster assets, not a flattened player screenshot. Decorative cassette reels are static.

## Fonts and next refinement

The user-supplied Adobe Fonts kit https://use.typekit.net/cbf4dfv.css loads only when v2 is mounted. The title uses Unibody 8 Pro Bold (700), and the time display uses Unibody 8 Pro Regular (400). Browser font inspection confirmed both actual custom font faces, not fallbacks. Quantico remains a fallback if Adobe is unavailable. No proprietary font binaries are bundled.

Potential next refinements: licensed final media, HD renditions and manifest, actual artist metadata, smaller optimized asset encodings, more detailed hardware fasteners and edge lighting, and physical-device/Safari/Firefox checks. The current release remains a demo with sample media.

## Verification

Passed full workspace typecheck and aggregate production build after the final code edits. Scoped Edge browser QA passed media playback/pause, seeking, stop/reset, volume-zero and mute/unmute UI states, picture toggle, visible captions, failure/retry (temporary local media blocking, subsequently cleared), end/replay, keyboard playback, and v1 playback/next-track regression. Fullscreen worked in an observed browser session and exit was verified; its unavailable fallback was also observed under browser automation. No errors/warnings were returned in final clean browser logs.

Responsive checks: 1488 × 1058 desktop, 390 × 844 mobile, and 320 × 700 narrow layout (no horizontal overflow). Native mobile devices, Firefox, Safari, and a screen-reader audit were not run. Existing v1 automated suites were not rerun; v1 received the scoped regression checks above.

Screenshots: `.local/qa/v2-desktop-final.png`, `.local/qa/v2-mobile-final.png`. See `design-qa.md` for visual comparison notes.



Release: v2 playback fills its existing video panel edge to edge using centered cover cropping, as requested. Portrait footage is cropped; the cassette and metadata layout is unchanged. Vercel rewrites serve direct /v2 and /v2/ navigation.
