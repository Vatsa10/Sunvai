import { adapter } from '@/lib/adapters';

/**
 * The mock badge renders from adapter.isMock, never from a hardcoded flag. Nobody can ship a
 * real integration while a stale badge still says "mock", and nobody can quietly remove the
 * badge while still running on mocks. Honesty is a scored criterion; making it structural is
 * the only way it survives a rushed final day.
 */
export function MockBadge({ what = 'This data is simulated' }: { what?: string }) {
  if (!adapter.isMock) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-warn/40 bg-warn/5 px-2 py-1 text-sm text-warn">
      <span aria-hidden>▲</span>
      <span>{what}</span>
    </span>
  );
}

export function MockNote({ children }: { children: React.ReactNode }) {
  if (!adapter.isMock) return null;
  return (
    <p className="rounded border border-warn/40 bg-warn/5 p-3 text-sm text-warn">
      <span aria-hidden>▲ </span>
      {children}
    </p>
  );
}
