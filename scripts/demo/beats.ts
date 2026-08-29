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
    act: async (page) => focus(page, '[data-tour="problem"]'),
  },
  {
    say: 'You do not need a login, or a reference number.',
    act: async (page) => focus(page, '[data-tour="cases"]'),
  },
  {
    say: 'Kamla Devi’s pension. Nineteen days. Then: disposed.',
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
    act: async (page) => focus(page, '[data-tour="audit"]'),
  },
  {
    say: 'Then the question that decides everything: did your problem actually get fixed?',
    act: async (page) => focus(page, '[data-tour="confirm"]'),
  },
  {
    say: 'Three choices shaped this build. One. The auditor may never paraphrase. Every claim has to quote the reply word for word, and if it cannot, it says it is unsure. That is a guard in code — a hundred per cent citation pass rate across seventy four labelled replies.',
    act: async (page) => focus(page, '[data-tour="audit"]'),
  },
  {
    say: 'Two. The published resolution rate comes only from citizens’ own answers. Never from our verdict. Audit and metric stay separate, so departments cannot write for our model, and we cannot grade our own homework.',
    act: async (page, base) => {
      await page.goto(`${base}/numbers?lang=en`, { waitUntil: 'networkidle' });
      await focus(page, '[data-tour="rates"]');
    },
  },
  {
    say: 'Three. Seventy four replies, labelled before the prompt existed. Zero false accusations. And one gate still failing — published as failing, not quietly relabelled.',
    act: async (page) => {
      // The eval table sits below the measured half.
      await page.mouse.wheel(0, 900);
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
