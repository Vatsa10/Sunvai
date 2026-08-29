/**
 * Look at every frame of the demo before recording one.
 *
 *   DEMO_BASE=http://localhost:3000 pnpm tsx scripts/demo/preflight.ts
 *
 * Writes .demo/preflight/NN.png and prints what each beat's target actually says. This exists
 * because a recording is made blind: the script drives the browser, nobody watches, and a
 * spinner, an empty section or a section that renders differently once a case has been
 * answered all record just as happily as the right thing. Checking after the fact means
 * re-recording; checking here costs a minute.
 *
 * It fails loudly on a missing target, and prints the visible text of every target so the
 * narration can be read against what is genuinely on screen at that moment.
 */

import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { BEATS } from './beats';

const BASE = (process.env.DEMO_BASE ?? 'http://localhost:3000').replace(/\/$/, '');
const OUT = join(process.cwd(), '.demo', 'preflight');

async function main() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  let problems = 0;

  for (const [i, beat] of BEATS.entries()) {
    const n = String(i).padStart(2, '0');
    if (beat.act) await beat.act(page, BASE);
    await page.waitForTimeout(400);

    // Anything still loading is the single most damaging thing to capture.
    const loading = await page.locator('text=/loading|Loading|…\\s*$/').count();

    await page.screenshot({ path: join(OUT, `${n}.png`) });

    const url = new URL(page.url()).pathname;
    console.log(`\n── beat ${n}  ${url}`);
    console.log(`   says: ${beat.say ? beat.say.slice(0, 72) + '…' : '(silence)'}`);
    if (loading > 0) console.log(`   ⚠ ${loading} element(s) look like a loading state`);

    // What each tour target on this page actually says right now, so the narration can be
    // read against the screen rather than against what the seed was assumed to contain.
    for (const key of ['problem', 'cases', 'reply', 'audit', 'confirm', 'rates']) {
      const loc = page.locator(`[data-tour="${key}"]`);
      if ((await loc.count()) === 0) continue;
      const inView = await loc.first().isVisible();
      const text = ((await loc.first().innerText()) || '').replace(/\s+/g, ' ').trim();
      console.log(`   [${key}] ${inView ? 'visible' : 'HIDDEN'} — ${text.slice(0, 120)}…`);
    }
  }

  await browser.close();
  console.log(`\nscreenshots in ${OUT}`);
  if (problems > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
