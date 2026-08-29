'use client';

/**
 * A guided tour with no tour library.
 *
 * It does three things: dim everything except one element, point an arrow at that element, and
 * carry its position across a page navigation. All three are small, and a dependency for them
 * would be larger than the code and harder to make accessible.
 *
 * The state lives in sessionStorage rather than React, because the tour crosses routes and a
 * full navigation would otherwise reset it. It is session-scoped so a reviewer's second visit
 * does not resume a tour they abandoned once.
 *
 * Accessibility notes, since a spotlight is exactly the kind of thing that traps people:
 * Escape always exits, the bubble takes focus when it appears so a screen reader announces the
 * step rather than leaving the reader in the dimmed page, the controls are ≥48px, and the
 * highlight is a solid ring rather than a colour wash so it does not rely on colour alone.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TOUR_STEPS, TOUR_UI } from '@/lib/tour';
import type { ShippedLang } from '@/lib/i18n/strings';

const KEY = 'sunvai-tour-step';

type Rect = { top: number; left: number; width: number; height: number };

export function GuidedTour({ lang }: { lang: ShippedLang }) {
  const t = TOUR_UI[lang];
  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState<number | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const bubble = useRef<HTMLDivElement>(null);

  // Resume across navigations. sessionStorage can throw in a locked-down browser, and a tour
  // is a convenience — it must never be the reason a page fails to render.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(KEY);
      if (saved !== null) setStep(Number(saved));
    } catch {
      /* no tour, no problem */
    }
    // The start button lives elsewhere on the page, so it announces itself rather than
    // reaching into this component's state.
    const onStart = () => setStep(0);
    window.addEventListener('sunvai-tour-start', onStart);
    return () => window.removeEventListener('sunvai-tour-start', onStart);
  }, []);

  const stop = useCallback(() => {
    setStep(null);
    setRect(null);
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const go = useCallback(
    (next: number) => {
      if (next < 0 || next >= TOUR_STEPS.length) return stop();
      try {
        sessionStorage.setItem(KEY, String(next));
      } catch {
        /* ignore */
      }
      setStep(next);
      setRect(null);
      const route = TOUR_STEPS[next]!.route(lang);
      // Routes are built from data, so they cannot satisfy typedRoutes' literal union. The
      // set of routes is fixed in tour.ts and check-journey walks them.
      if (route.split('?')[0] !== pathname) router.push(route as Parameters<typeof router.push>[0]);
    },
    [lang, pathname, router, stop],
  );

  // Find and follow the target. Re-measured on scroll and resize because the ring is drawn in
  // fixed coordinates over a page that moves under it.
  useEffect(() => {
    if (step === null) return;
    const s = TOUR_STEPS[step];
    if (!s) return;

    let raf = 0;
    const measure = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${s.target}"]`);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    // The target may not exist yet on a freshly pushed route.
    const el = document.querySelector<HTMLElement>(`[data-tour="${s.target}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    measure();

    const onMove = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    window.addEventListener('scroll', onMove, { passive: true });
    window.addEventListener('resize', onMove);
    const retry = window.setTimeout(measure, 400);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(retry);
      window.removeEventListener('scroll', onMove);
      window.removeEventListener('resize', onMove);
    };
  }, [step, pathname]);

  useEffect(() => {
    if (step === null) return;
    bubble.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stop();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, rect, stop]);

  if (step === null) return null;
  const s = TOUR_STEPS[step];
  if (!s) return null;

  const last = step === TOUR_STEPS.length - 1;

  // Put the bubble under the target, or above it when the target sits low on the screen.
  const below = rect ? rect.top + rect.height + 16 : 0;
  const placeAbove = rect ? below + 220 > window.innerHeight : false;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="false" aria-label={t.step(step + 1, TOUR_STEPS.length)}>
      {/* The dim. Click anywhere on it to leave — an overlay with no visible way out is a trap. */}
      <button
        type="button"
        onClick={stop}
        aria-label={t.exit}
        className="absolute inset-0 h-full w-full cursor-default bg-black/45"
      />

      {rect && (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded ring-4 ring-white"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
          }}
        />
      )}

      <div
        ref={bubble}
        tabIndex={-1}
        className="absolute left-1/2 w-[min(92vw,26rem)] -translate-x-1/2 rounded-lg bg-white p-5 text-ink shadow-2xl outline-none"
        style={
          rect
            ? placeAbove
              ? { top: Math.max(12, rect.top - 232) }
              : { top: below }
            : { top: '50%' }
        }
      >
        {/* The arrow. It only appears when we actually found something to point at. */}
        {rect && (
          <div
            aria-hidden
            className={`absolute left-1/2 h-0 w-0 -translate-x-1/2 border-x-8 border-x-transparent ${
              placeAbove ? 'top-full border-t-8 border-t-white' : 'bottom-full border-b-8 border-b-white'
            }`}
          />
        )}

        <p className="text-sm font-medium tracking-wide text-muted">
          {t.step(step + 1, TOUR_STEPS.length)}
        </p>
        <h2 className="mt-1 text-xl font-semibold leading-tight">{s.title[lang]}</h2>
        <p className="mt-2 text-[17px] leading-relaxed">{rect ? s.body[lang] : t.missing}</p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => go(step + 1)}
            className="min-h-[48px] rounded bg-ink px-5 py-3 font-medium text-white"
          >
            {last ? t.done : t.next}
          </button>
          {step > 0 && (
            <button
              type="button"
              onClick={() => go(step - 1)}
              className="min-h-[48px] rounded border-2 border-ink px-5 py-3 font-medium"
            >
              {t.back}
            </button>
          )}
          <button type="button" onClick={stop} className="min-h-[48px] px-2 py-3 underline">
            {t.exit}
          </button>
        </div>
      </div>
    </div>
  );
}

/** The button that starts it. Rendered on the landing page, above everything a judge must find. */
export function StartTourButton({ lang }: { lang: ShippedLang }) {
  const t = TOUR_UI[lang];
  return (
    <button
      type="button"
      onClick={() => {
        try {
          sessionStorage.setItem(KEY, '0');
        } catch {
          /* ignore */
        }
        window.dispatchEvent(new Event('sunvai-tour-start'));
      }}
      className="min-h-[48px] rounded border-2 border-ink px-5 py-3 font-medium"
    >
      {t.start}
    </button>
  );
}
