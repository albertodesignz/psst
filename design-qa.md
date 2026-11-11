# PSST v2 design QA

## Evidence

- Source visual: approved final render `exec-c7fbb1bc-4892-4e28-8871-3bed3f5ba06c.png`, Library reference `libfile_f5481e7a2a3c8191aec4d030424dfd84`. Source pixels 1488 × 1058. The render was opened directly before implementation.
- Implementation: local `/v2` in Edge, `.local/qa/v2-desktop-final.png`, 1488 × 1058 pixels / CSS viewport, 1:1 density. Poster visible, stopped at zero. Source has illustrative nonzero time; the implementation correctly shows actual sample duration.
- Mobile: `.local/qa/v2-mobile-final.png`, 390 × 844 viewport, full-page capture. Also checked 320 × 700 with scrollWidth = clientWidth = 320.
- Full-view source and implementation images were displayed together in the same comparison input. Header, cassette/metadata and controls were inspected at readable full resolution; no additional crop was required.

## Comparison history

1. Initial implementation: caption availability did not become active, missing vent imagery, and small native orange range thumbs were less tactile than the target. Fixed caption load listener/state, added a generated vent raster, and replaced default range styling with textured circular seek and rectangular volume thumbs plus real progress elements.
2. Re-captured desktop and mobile after fixes. Final desktop image shows the physical thumb shapes, preserved layout, correct controls, and no clipping. Keyboard seek and volume inputs were rechecked after the styling changes.

## Required fidelity surfaces

- Typography: title and active play use the same orange accent. Uppercase artist follows the intended hierarchy. The user-supplied Adobe kit cbf4dfv now renders Unibody 8 Pro Bold in the title and Regular in the time display, verified with browser platform-font inspection. Quantico remains an availability fallback. Metadata uses readable ivory text. No NOW PLAYING header, rule, or triangle above metadata.
- Layout: large ~3:2 left video viewport; recognizable cassette above metadata on the right; top title and VIDEO/CC/HD; full-width seek strip and compact transport row. Mobile stacks the major regions and retains all controls without sideways scrolling. The supplemental demo/v1 links sit outside the physical deck.
- Colors: near-black inset panels, warm gray textured outer housing, ivory labels, orange title/play/progress. Disabled HD is deliberately unlit.
- Imagery: generated raster cassette, astronaut poster, brushed-metal texture, and vents share the warm gunmetal/orange art direction. Standard transport icons use Bootstrap Icons, not custom vector art. Poster and cassette differ in microdetail from the concept render but preserve subject, scale, and visual language.
- Copy: title, band, album/year reflect the approved example. Cassette label now says Video Mix v2. Actual time replaces mock duration; sample-media explanation is truthful. v1 link works.

## Functional/browser evidence

Verified real sample playback, pause, seeking, stop/reset, zero-volume and mute UI, live English captions, picture-off mode, keyboard K, error and retry, end and replay, fullscreen exit after observed fullscreen state, fallback notice when browser disallows fullscreen, and v1 playback/track navigation. Final clean console returned no warning/error entries. All temporary network blocking and viewport overrides were cleared.

## Follow-up polish (P3)

- Adobe Unibody 8 font integration completed on November 11, 2026.
- Additional bezel screws, tiny edge illumination and hardware wear can improve the physical detailing.
- Optimize generated PNG assets before publication; replace fictional metadata and the original test clip when real media is supplied.
- Run Safari, Firefox, physical mobile and screen-reader tests before production sign-off.

## Result

No outstanding P0/P1/P2 issues for this local prototype scope, with the documented sample-media substitution and P3 hardware-detail differences. Final aggregate build and typecheck passed.

final result: passed

## Adobe Fonts follow-up, November 11, 2026

Kit cbf4dfv is scoped to the mounted v2 component. Title sizing and the narrow header were adjusted for the wider pixel font. Desktop and narrow layouts were visually inspected after loading the real fonts; measured narrow CSS width and scrollWidth were both 338 px (browser zoom differed from the requested 320 px viewport). No horizontal overflow or clipped title was observed. Final browser warning/error logs were empty. Workspace typecheck and aggregate build passed; gallery build was rerun after final CSS changes. Screenshot: .local/qa/v2-adobe-font-desktop.png. No push or deployment.
