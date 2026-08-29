/**
 * Write the on-screen text, timed to the narration that was actually synthesised.
 *
 *   pnpm tsx scripts/demo/subtitles.ts   # -> .demo/subs.srt
 *
 * Judges watch submission videos muted more often than anyone likes to admit, so the words
 * have to survive with the sound off. The timings come from `durations.json` rather than an
 * estimate, which means the captions are correct by construction: the same numbers drive how
 * long the browser holds each beat.
 *
 * Long beats are split into shorter cues. A caption is read, not skimmed — forty words on
 * screen at once is a wall, and the reader gives up on it rather than reading faster.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { BEATS } from './beats';

const OUT = join(process.cwd(), '.demo');
/** Roughly one line of comfortable reading at 1280px wide. */
const MAX_CHARS = 78;

function stamp(seconds: number): string {
  const ms = Math.max(0, Math.round(seconds * 1000));
  const h = String(Math.floor(ms / 3_600_000)).padStart(2, '0');
  const m = String(Math.floor((ms % 3_600_000) / 60_000)).padStart(2, '0');
  const s = String(Math.floor((ms % 60_000) / 1000)).padStart(2, '0');
  const f = String(ms % 1000).padStart(3, '0');
  return `${h}:${m}:${s},${f}`;
}

/** Break a beat into cues at sentence ends, then at length if a sentence is still too long. */
function cuesFor(text: string): string[] {
  const sentences = text.match(/[^.!?—]+[.!?]*\s*/g) ?? [text];
  const out: string[] = [];
  let cur = '';
  for (const piece of sentences) {
    if ((cur + piece).trim().length > MAX_CHARS && cur) {
      out.push(cur.trim());
      cur = piece;
    } else {
      cur += piece;
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const { durations } = JSON.parse(readFileSync(join(OUT, 'durations.json'), 'utf8')) as {
  durations: number[];
};

let t = 0;
let n = 0;
const blocks: string[] = [];

for (const [i, beat] of BEATS.entries()) {
  const spoken = durations[i] ?? 0;
  const hold = beat.hold ?? 0;

  if (!beat.say) {
    // Silence stays silent on screen too. The pause is the point; a caption would fill it.
    t += spoken + hold;
    continue;
  }

  const cues = cuesFor(beat.say);
  // Share the beat's real duration across its cues, weighted by length, so a long sentence
  // is not on screen for the same time as a short one.
  const total = cues.reduce((a, c) => a + c.length, 0) || 1;
  let start = t;
  for (const cue of cues) {
    const span = (cue.length / total) * spoken;
    blocks.push(`${++n}\n${stamp(start)} --> ${stamp(start + span)}\n${cue}\n`);
    start += span;
  }
  t += spoken + hold;
}

writeFileSync(join(OUT, 'subs.srt'), blocks.join('\n'));
console.log(`${n} cues across ${t.toFixed(1)}s -> .demo/subs.srt`);
