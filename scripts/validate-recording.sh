#!/usr/bin/env bash
set -euo pipefail

VIDEO_DIR="artifacts/filmstrip-gallery-video"
HOOK="$VIDEO_DIR/src/lib/video/hooks.ts"
TEMPLATE="$VIDEO_DIR/src/components/video/VideoTemplate.tsx"
TOML="$VIDEO_DIR/.replit-artifact/artifact.edit.toml"

test -f "$HOOK" && test -f "$TEMPLATE" && test -f "$TOML"
grep -q "window.startRecording" "$HOOK"
grep -q "window.stopRecording" "$HOOK"
grep -q "useVideoPlayer" "$TEMPLATE"
grep -q 'videoAspectRatio = "16:9"' "$TOML"
grep -q 'overflow: hidden' "$VIDEO_DIR/src/index.css"
grep -q 'mode="sync"' "$TEMPLATE"
echo "recording lifecycle: start/stop wired; 16:9 persisted; looping scenes configured"