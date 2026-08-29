/**
 * The demo video, as data: what is said, and what the browser does while it is said.
 *
 * One beat is one narrated sentence group plus the action performed under it. Timing is not
 * written down anywhere, because guessing it is how narration drifts out of sync with the
 * screen: the narration is synthesised first, its real duration is measured, and the browser
 * holds each beat for exactly that long. The video is therefore as long as the words are.
 *
 * Keep `say` in the register a person would actually speak. It is read aloud, not printed.
 */

import type { Page } from 'playwright';

export type Beat = {
  /** Spoken over this beat. Empty string means deliberate silence. */
  say: string;
  /** Extra seconds to hold after the narration ends — used to let something land. */
  hold?: number;
  /** What the browser does. Runs before the narration for this beat starts. */
  act?: (page: Page, base: string) => Promise<void>;
};

const REF = 'DEMO/2026/0000472';
const caseUrl = (base: string) => `${base}/case/${encodeURIComponent(REF)}?lang=en`;

/** Scroll a section into the middle of the frame and pause for the smooth scroll to settle. */
async function focus(page: Page, selector: string) {
  await page.locator(selector).first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
}

/** Open the "see how we judged this" disclosure, if it is not already open. */
async function openEvidence(page: Page) {
  const details = page.locator('[data-tour="audit"] details').first();
  if ((await details.count()) === 0) return;
  const open = await details.evaluate((el) => (el as HTMLDetailsElement).open);
  if (!open) await details.locator('summary').first().click();
  await page.waitForTimeout(600);
  await details.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
}

/**
 * A cursor the viewer can actually follow.
 *
 * A headless recording has no pointer, so a scroll-only video reads as a page turning by
 * itself. This injects a dot that glides to whatever the narration is talking about and
 * pulses when it clicks, which is the difference between a screen recording and a demo.
 * Installed via addInitScript so it survives every navigation.
 */
export const CURSOR_SCRIPT = `
  (() => {
    if (window.__demoCursorInstalled) return;
    window.__demoCursorInstalled = true;
    const add = () => {
      const c = document.createElement('div');
      c.id = '__demo-cursor';
      c.style.cssText = [
        'position:fixed','z-index:2147483647','width:22px','height:22px',
        'border-radius:50%','background:rgba(17,17,17,0.85)',
        'border:2px solid #fff','box-shadow:0 2px 10px rgba(0,0,0,0.45)',
        'left:-100px','top:-100px','pointer-events:none',
        'transition:left .55s cubic-bezier(.4,0,.2,1),top .55s cubic-bezier(.4,0,.2,1)',
      ].join(';');
      document.body.appendChild(c);
      window.__moveCursor = (x, y) => { c.style.left = (x - 11) + 'px'; c.style.top = (y - 11) + 'px'; };
      window.__pulseCursor = () => {
        const r = document.createElement('div');
        const rect = c.getBoundingClientRect();
        r.style.cssText = [
          'position:fixed','z-index:2147483646','left:' + rect.left + 'px','top:' + rect.top + 'px',
          'width:22px','height:22px','border-radius:50%','border:3px solid rgba(17,17,17,0.9)',
          'pointer-events:none','transition:transform .5s ease-out,opacity .5s ease-out',
        ].join(';');
        document.body.appendChild(r);
        requestAnimationFrame(() => { r.style.transform = 'scale(3)'; r.style.opacity = '0'; });
        setTimeout(() => r.remove(), 550);
      };
    };
    if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
  })();
`;

/** Glide the cursor onto an element, and optionally pulse as if clicking it. */
async function pointAt(page: Page, selector: string, click = false) {
  const el = page.locator(selector).first();
  if ((await el.count()) === 0) return;
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const box = await el.boundingBox();
  if (!box) return;
  const x = box.x + Math.min(box.width / 2, 220);
  const y = box.y + Math.min(box.height / 2, 60);
  await page.evaluate(([x, y]) => (window as any).__moveCursor?.(x, y), [x, y] as const);
  await page.waitForTimeout(650);
  if (click) {
    await page.evaluate(() => (window as any).__pulseCursor?.());
    await page.waitForTimeout(350);
  }
}

export const BEATS: Beat[] = [
  {
    say: 'In May, two point six lakh grievances were closed on India’s national portal. The feedback call centre reached seventy nine thousand people. Nearly everyone else was never asked whether anything changed.',
    act: async (page, base) => {
      await page.goto(`${base}/?lang=en`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
    },
  },
  {
    say: 'This is Sunvai. It starts the moment an office says your case is closed.',
    act: async (page) => { await focus(page, '[data-tour="problem"]'); await pointAt(page, '[data-tour="problem"] p'); },
  },
  {
    say: 'You do not need a login, or a reference number.',
    act: async (page) => { await focus(page, '[data-tour="cases"]'); await pointAt(page, '[data-tour="cases"] a', true); },
  },
  {
    say: 'Kamla Devi’s pension. Filed, and closed nineteen days later.',
    act: async (page, base) => {
      await page.goto(caseUrl(base), { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);
    },
  },
  {
    // The silence is the point. Nothing is said while the reply is read.
    say: '',
    hold: 3,
    act: async (page) => focus(page, '[data-tour="reply"]'),
  },
  {
    say: 'That is the entire reply.',
  },
  {
    say: 'Sunvai reads it against what she actually asked. Passed on, not answered — and every word of that is anchored to a quote from their own text.',
    // The quotes live behind a disclosure. Narrating "anchored to a quote" over a collapsed
    // section claims evidence the frame never shows, so open it and let the spans be read.
    act: async (page) => {
      await focus(page, '[data-tour="audit"]');
      await pointAt(page, '[data-tour="audit"] summary', true);
      await openEvidence(page);
      await pointAt(page, '[data-tour="audit"] blockquote');
    },
  },
  {
    say: 'Then the question that decides everything: did your problem actually get fixed?',
    act: async (page) => { await focus(page, '[data-tour="confirm"]'); await pointAt(page, '[data-tour="confirm"] h2', true); },
  },
  {
    say: 'She said no. The appeal is already written — and she reads all of it before anything is recorded.',
    // Targeted by its heading rather than a data-tour anchor so this beat needs no rebuild.
    act: async (page) => {
      await page.getByText('What to do next', { exact: false }).first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(700);
    },
  },
  {
    say: 'Three choices shaped this build. One. The auditor may never paraphrase. Every claim has to quote the reply word for word, and if it cannot, it says it is unsure. That is a guard in code — a hundred per cent citation pass rate across seventy four labelled replies.',
    act: async (page) => focus(page, '[data-tour="audit"]'),
  },
  {
    say: 'Two. The published resolution rate comes only from citizens’ own answers. Never from our verdict. Audit and metric stay separate, so departments cannot write for our model, and we cannot grade our own homework.',
    act: async (page, base) => {
      await page.goto(`${base}/numbers?lang=en`, { waitUntil: 'networkidle' });
      await focus(page, '[data-tour="ratecards"]');
      await pointAt(page, '[data-tour="ratecards"] > div:last-child');
    },
  },
  {
    say: 'Three. Seventy four replies, labelled before the prompt existed. Zero false accusations. And one gate still failing — published as failing, not quietly relabelled.',
    // Anchored rather than scrolled by a guessed distance: an earlier version wheeled 900px
    // and landed past the table, narrating gate results over a section about something else.
    act: async (page) => { await focus(page, '[data-tour="evals"]'); await pointAt(page, '[data-tour="evals"] > div:nth-child(5)'); },
  },
  {
    say: 'Every step lands in a record you can download and check in your own browser. Change one character in it, and this page goes red.',
    act: async (page, base) => {
      await page.goto(`${base}/verify`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(800);
    },
  },
  {
    say: 'Samadhan Didi files grievances in twenty two languages, and does it well. Sunvai begins where it stops.',
    hold: 1.5,
    act: async (page, base) => {
      await page.goto(`${base}/?lang=en`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
    },
  },
];

/** Rough word count, so the script can warn before spending API credit on an overlong cut. */
export function wordCount(): number {
  return BEATS.reduce((n, b) => n + (b.say ? b.say.trim().split(/\s+/).length : 0), 0);
}
