/**
 * Drive the site and record it, holding each beat for exactly as long as its narration.
 *
 *   pnpm tsx scripts/demo/narrate.ts     # first — writes .demo/durations.json
 *   pnpm tsx scripts/demo/record.ts      # then — writes .demo/video/*.webm
 *   bash scripts/demo/mux.sh             # last — muxes audio and video into demo.mp4
 *
 * Point it at a running server with DEMO_BASE (default http://localhost:3000). Recording
 * against the deployment works too and is more honest — it is the thing a judge will open —
 * but every navigation then costs a real round trip to Singapore, so the pauses look longer
 * than they will in the cut.
 *
 * The window is 1280x720 rather than a full desktop: the video is watched in a small embedded
 * player, and text that is comfortable at 1280 is legible there.
 */

import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { BEATS, CURSOR_SCRIPT } from './beats';

const BASE = (process.env.DEMO_BASE ?? 'http://localhost:3000').replace(/\/$/, '');
const OUT = join(process.cwd(), '.demo');
const VIDEO = join(OUT, 'video');

async function main() {
  const durationsFile = join(OUT, 'durations.json');
  if (!existsSync(durationsFile)) {
    console.error('Run scripts/demo/narrate.ts first — the hold times come from the narration.');
    process.exit(1);
  }
  const { durations } = JSON.parse(readFileSync(durationsFile, 'utf8')) as { durations: number[] };

  // A stale recording silently muxing against fresh audio is the worst failure here, because
  // it looks like it worked.
  rmSync(VIDEO, { recursive: true, force: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: VIDEO, size: { width: 1280, height: 720 } },
    deviceScaleFactor: 2,
    reducedMotion: 'no-preference',
  });
  await context.addInitScript(CURSOR_SCRIPT);
  const page = await context.newPage();

  console.log(`recording against ${BASE}`);

  // When each beat's narration should actually begin, in video time.
  //
  // The acts are not free: a navigation, a smooth scroll and a disclosure click cost real
  // seconds, and they happen between one beat's narration ending and the next one's starting.
  // An audio track laid out as if they cost nothing drifts a little further behind the picture
  // at every beat — by the end of this script, far enough that the closing line lands over the
  // wrong section. So the real offsets are measured here and the audio is padded to match.
  const t0 = Date.now();
  const offsets: number[] = [];

  for (const [i, beat] of BEATS.entries()) {
    const spoken = durations[i] ?? 0;
    const hold = beat.hold ?? 0;
    if (beat.act) await beat.act(page, BASE);

    const offset = (Date.now() - t0) / 1000;
    offsets.push(offset);

    const ms = Math.round((spoken + hold) * 1000);
    console.log(
      `${i}: @${offset.toFixed(1)}s holding ${(ms / 1000).toFixed(1)}s  ` +
        `${beat.say.slice(0, 44) || '(silence)'}`,
    );
    await page.waitForTimeout(ms);
  }

  writeFileSync(
    join(OUT, 'timeline.json'),
    JSON.stringify({ offsets, recorded: (Date.now() - t0) / 1000 }, null, 2),
  );

  // The video is only flushed to disk when the context closes.
  await context.close();
  await browser.close();
  console.log(`\nvideo written under ${VIDEO}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
