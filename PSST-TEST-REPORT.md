# PSST first-preview test report

Date: 2026-11-09
Computer: CommandDoc-001
Result: Local preview implemented and verified.
Preview: http://127.0.0.1:5173/
Restart: Run ./Start-PSST.ps1 from the MusicPlayer folder.

## Build and startup: passed

- Official @videojs/react 10.3.0 installed and exact version locked.
- pnpm install --frozen-lockfile succeeds with the updated lockfile.
- Windows PowerShell launcher starts the gallery without Replit-only environment variables.
- Full workspace TypeScript checks passed, including shared libraries and all four application/script packages.
- Aggregate production build passed for the gallery, mockup sandbox, and API server.
- Original supply-chain minimum-release-age protection remains enabled. Existing build-script allowlist was migrated to pnpm 11 format.
- git diff --check and JavaScript/PowerShell syntax checks passed.

## Main Chrome browser suite: 11 passed

1. Local video metadata loads and exactly one media element exists.
2. Play advances real media time; Pause stops it.
3. Keyboard seeking changes video time without navigating covers.
4. Volume zero remains silent; one-click Unmute restores audio; volume slider and mute toggle work.
5. Enter/exit fullscreen retains the controls.
6. Changing covers stops and resets media, including 12 repeated navigation actions.
7. Information panel closes with Escape and returns keyboard focus.
8. Reduced-motion mode disables decorative animation; gallery keyboard controls work.
9. No uncaught browser errors during the tested desktop flow.
10. 390px mobile viewport plays and navigates without horizontal overflow.
11. A blocked media request shows an error; Retry restores working playback after the request is allowed.

## Additional browser checks: passed

- Mouse drag navigates the filmstrip and snaps to a cover.
- Emulated touch swipe navigates.
- End-of-video returns the Play state and replays successfully.
- 320x568 and 844x390 layouts have no horizontal overflow.
- Desktop 1440x900 and mobile 390x844 screenshots were visually inspected. Artwork, controls, labels, and transport have no visible overlap.

## Media

Original local H.264/AAC MP4 generated for this preview: 2,912,582 bytes, 640x880, 15.696767 seconds. Independent Chrome checks verified seek to 5 seconds, playback advancement, pause, and no media error. The soft synthetic test tone and animated graphics are original; no external music, movie, microphone capture, or user media is used.

All nine existing cover/artist concepts intentionally play the same sample. The waveform is decorative and playback-driven, not an audio analyzer.

## Reproduce

1. Start the app with ./Start-PSST.ps1.
2. Run node scripts/qa-psst.mjs.
3. Run node scripts/qa-psst-extra.mjs.

The QA scripts use installed Playwright or the Codex bundled Playwright runtime with Chrome. Main results are saved in .local/qa/results.json; desktop/mobile screenshots are saved alongside them.

## Remaining limits

Safari, Firefox, physical iOS/Android devices, production hosting, real licensed media, and assistive-technology sessions are not covered by this first local preview. Device-controlled volume is disabled when the browser reports it unavailable; mute remains available.

Independent code review completed. No outstanding startup or API blocker was found; the review's zero-volume toggle correction is included and tested.

This report records the first local-preview validation before publication. Subsequent publication uses the separate PSST Vercel project with videojs.avuxdesign.com; portfolio domains remain on their original project.
