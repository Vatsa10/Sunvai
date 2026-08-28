/**
 * Said before anything else on a page that is not reading live data.
 *
 * The failure mode this exists to prevent is not an ugly page — it is a page that looks live
 * and is not. A fallback that does not announce itself is a lie with good uptime.
 */
export function FixtureBanner({ heading, body, writes }: { heading: string; body: string; writes?: string }) {
  return (
    <section
      role="status"
      className="rounded border-2 border-warn/50 bg-warn/5 p-4 text-warn"
    >
      <p className="font-semibold">{heading}</p>
      <p className="mt-1 text-ink">{body}</p>
      {writes && <p className="mt-1 text-ink">{writes}</p>}
    </section>
  );
}
