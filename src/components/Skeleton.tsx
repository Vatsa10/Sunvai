/**
 * The shape of the page while it is being fetched, and a line saying what is being fetched.
 *
 * A spinner tells a person nothing except that they are waiting. This tells them what for —
 * which matters here, because the first request of the day wakes a sleeping database and can
 * take a few seconds.
 */
export function Skeleton({ what, bars = 5 }: { what: string; bars?: number }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <p className="text-muted">{what}</p>
      <div className="space-y-3" aria-hidden>
        {Array.from({ length: bars }).map((_, i) => (
          <div
            key={i}
            className="h-4 animate-pulse rounded bg-black/[0.06]"
            style={{ width: `${100 - (i % 3) * 18}%` }}
          />
        ))}
      </div>
    </div>
  );
}
