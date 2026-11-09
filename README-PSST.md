# PSST local preview

A working 3D filmstrip video player for AVUX Creative. The standalone frontend is configured for its own Vercel project, PSST, and the videojs.avuxdesign.com domain.

## Start on Windows

From PowerShell in this folder, run `./Start-PSST.ps1`. It uses an installed Node.js/pnpm or the existing Codex bundled runtime without changing system settings. The first install needs access to the npm registry. The app opens at **http://127.0.0.1:5173/**. No database, API server, account, or credentials are required for the player.

Standard Node.js 24 / pnpm 11 commands:

- `pnpm install --frozen-lockfile`
- `pnpm dev`
- `pnpm typecheck`
- `pnpm build`
- `pnpm --filter @workspace/filmstrip-gallery serve`

PORT defaults to 5173, BASE_PATH to `/`, and HOST to `127.0.0.1`. Existing Replit environment overrides still work. The pnpm package store is local to the ignored `.local` directory for Windows compatibility. Minimum package release age remains enabled.

## What is real

- Video.js **10.3.0**, using the current `@videojs/react` provider, media element, reactive state, and actions.
- Play/pause, seek, elapsed/duration, mute/volume, fullscreen, loading state, error/retry, and end-of-video behavior are media-driven.
- Nine existing artwork concepts remain in the 3D filmstrip. Selecting another cover pauses and resets playback. All nine intentionally play the same original sample, not the named artists' music.
- Desktop drag, mobile swipe, previous/next, horizontal scroll (or Shift+scroll), keyboard navigation, and reduced-motion preferences.
- The waveform is decorative and follows playback state. It is not an audio analyzer.

## Keyboard

Focus the gallery: Left/Right browse, Space or K play/pause, M mute, F fullscreen. Tab reaches buttons and sliders; native slider arrow keys work normally. Escape closes the information panel or leaves browser fullscreen.

## Media and rights

`public/media/psst-motion-study.mp4` is an original 16-second animated motion study and soft synthesized test tone created for this preview. It is served locally. No third-party movie, music, user media, remote video service, or microphone recording is used. The source generator is `scripts/generate-preview-media.mjs`, which uses Playwright and Chrome with canvas/MediaRecorder. Existing artwork and fictional track labels were preserved.

## Deployment

Vercel builds only the standalone gallery using the repository-root vercel.json. Node.js 24 and pnpm 11.25.0 are pinned in deployment settings. No database or secret environment variables are required. The portfolio at avuxdesign.com and www.avuxdesign.com remains a separate project.

Use PSST_URL to run either QA script against another host. The source repository is https://github.com/albertodesignz/psst.

## Before replacing demo media

Replace demo sources/labels with media you own or have licensed. Review browser/device support, performance, hosting, cache policy, domain setup, and security before deployment. The original backend/workspace scaffolding remains separate from this standalone player preview.

## Validation status (2026-11-09)

Passed: frozen-lockfile install, Windows launcher, full workspace TypeScript checks and aggregate production build. Chrome browser tests verified playback, pause, seeking, volume (including zero/unmute), mute, fullscreen, repeated navigation, drag/swipe, end/replay, keyboard behavior, reduced motion, media error/retry, and responsive 320px, 390px, desktop, and landscape layouts. No uncaught browser errors were observed. Desktop and mobile screenshots were visually inspected.

Run the app, then run `node scripts/qa-psst.mjs` and `node scripts/qa-psst-extra.mjs`. Tests require installed Playwright or the existing Codex bundled runtime, plus Chrome. The main suite saves results and screenshots under `.local/qa/`. See `PSST-TEST-REPORT.md` for detail. Safari, Firefox, physical mobile devices, and production hosting are not yet tested.
