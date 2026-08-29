#!/usr/bin/env bash
#
# Join the per-beat narration into one track and lay it over the screen recording.
#
#   bash scripts/demo/mux.sh            # -> .demo/demo.mp4
#   SPEED=1.15 bash scripts/demo/mux.sh # -> same, 1.15x faster, pitch corrected
#
# Runs after narrate.ts and record.ts. Silent beats become real silence of the right length
# rather than a cut, because the pause where the reply is read is part of the argument.

set -euo pipefail
cd "$(dirname "$0")/../.."

OUT=.demo
SPEED="${SPEED:-1.0}"

[ -f "$OUT/durations.json" ] || { echo "run scripts/demo/narrate.ts first"; exit 1; }

VIDEO=$(find "$OUT/video" -name '*.webm' | head -1)
[ -n "$VIDEO" ] || { echo "no recording found — run scripts/demo/record.ts"; exit 1; }

# Build the audio timeline: each beat's mp3, or silence of its hold length when it has no words.
rm -f "$OUT/parts.txt"
node -e '
const {readFileSync, existsSync, writeFileSync} = require("fs");
const {execFileSync} = require("child_process");
const d = JSON.parse(readFileSync(".demo/durations.json","utf8"));
const lines = [];
d.durations.forEach((sec, i) => {
  const n = String(i).padStart(2,"0");
  const mp3 = `.demo/beat-${n}.mp3`;
  // Paths in a concat list resolve relative to the list file, which lives in .demo/ too.
  if (existsSync(mp3)) lines.push(`file beat-${n}.mp3`);
});
writeFileSync(".demo/parts.txt", lines.join("\n") + "\n");
'

ffmpeg -y -f concat -safe 0 -i "$OUT/parts.txt" -c:a libmp3lame "$OUT/narration.mp3"

if [ "$SPEED" = "1.0" ]; then
  ffmpeg -y -i "$VIDEO" -i "$OUT/narration.mp3" \
    -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -shortest "$OUT/demo.mp4"
else
  # setpts slows/speeds the picture; atempo keeps the voice at its natural pitch.
  ffmpeg -y -i "$VIDEO" -i "$OUT/narration.mp3" \
    -filter_complex "[0:v]setpts=PTS/${SPEED}[v];[1:a]atempo=${SPEED}[a]" \
    -map "[v]" -map "[a]" \
    -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -shortest "$OUT/demo.mp4"
fi

echo
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUT/demo.mp4" |
  awk '{printf "demo.mp4 is %.1f seconds\n", $1; if ($1 > 120) print "OVER TWO MINUTES — raise SPEED or cut words from beats.ts"}'
