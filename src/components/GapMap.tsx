/**
 * A national view of the gap, drawn as inline SVG.
 *
 * Same deliberate constraints as `ClusterMap`: no tile server, no map library, no external
 * request, no basemap detail implying a precision we do not have. An equirectangular plot of
 * office coordinates over India's bounding box.
 *
 * What each office carries is the gap this whole site is about: every case counted here was
 * *disposed* — the department marked it finished — and the figure is the share of the citizens
 * who were then asked and said the thing was still not fixed. It comes from `confirmations`,
 * the citizen's own yes/no, never from a model verdict.
 *
 * Nothing is encoded by colour alone. The circle's size, the rank numeral printed inside it,
 * and the ranked list underneath all carry the same ordering, and the list — not the map — is
 * the authoritative reading on a narrow phone. Office names are deliberately not drawn on the
 * plot: at twenty offices they collide at any width that fits a phone.
 */

export type GapOffice = {
  office_name: string;
  department: string;
  state: string;
  disposed: string;
  citizens_asked: string;
  true_resolution_pct: string | null;
  lat: string | number | null;
  lon: string | number | null;
};

const BOUNDS = { minLon: 67, maxLon: 98, minLat: 6, maxLat: 36 };
const W = 620;
const H = 600;

function project(lat: number, lon: number) {
  const x = ((lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)) * W;
  const y = H - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * H;
  return { x, y };
}

export function GapMap({ offices }: { offices: GapOffice[] }) {
  const rows = offices
    .filter((o) => o.true_resolution_pct !== null && o.lat !== null && o.lon !== null)
    .map((o) => ({
      name: o.office_name,
      department: o.department,
      state: o.state,
      asked: Number(o.citizens_asked),
      lat: Number(o.lat),
      lon: Number(o.lon),
      gap: 100 - Number(o.true_resolution_pct),
    }))
    .sort((a, b) => b.gap - a.gap)
    .map((o, i) => ({ ...o, rank: i + 1 }));

  if (rows.length === 0) return null;

  const worst = rows[0];
  const best = rows[rows.length - 1];
  const lo = best.gap;
  const hi = worst.gap;
  // Radius by area, so a bigger circle means proportionally more people, not a flattering square.
  const radius = (gap: number) => 10 + 13 * Math.sqrt(hi === lo ? 1 : (gap - lo) / (hi - lo));

  // Two of these offices sit close enough together on a national plot that their circles would
  // cover each other's numeral — Patna and Muzaffarpur, Pune and Bandra. Rather than shrink
  // everything until the whole map is unreadable, the circle is nudged off its coordinate and a
  // hairline drawn back to the true point, which is marked. Deterministic: same input, same plot.
  const placed = rows.map((o) => {
    const { x, y } = project(o.lat, o.lon);
    return { ...o, x0: x, y0: y, x, y, r: radius(o.gap) };
  });
  for (let pass = 0; pass < 80; pass += 1) {
    for (let i = 0; i < placed.length; i += 1) {
      for (let j = i + 1; j < placed.length; j += 1) {
        const a = placed[i];
        const b = placed[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.01;
        const want = a.r + b.r + 2;
        if (d >= want) continue;
        const push = (want - d) / 2;
        const ux = dx / d;
        const uy = dy / d;
        a.x -= ux * push; a.y -= uy * push;
        b.x += ux * push; b.y += uy * push;
      }
    }
  }
  for (const p of placed) {
    p.x = Math.min(W - p.r - 1, Math.max(p.r + 1, p.x));
    p.y = Math.min(H - p.r - 1, Math.max(p.r + 1, p.y));
  }

  return (
    <div className="space-y-4">
      <figure className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full min-w-[21rem] max-w-[38rem]"
          role="img"
          aria-label={
            `Schematic map of ${rows.length} simulated offices. Each is ranked by the share of ` +
            `citizens who were asked after their case was closed and said it was still not fixed, ` +
            `from ${worst.name} at ${Math.round(hi)} in 100 down to ${best.name} at ${Math.round(lo)} in 100. ` +
            `The same ranking is listed in full below the map.`
          }
        >
          <rect x={0} y={0} width={W} height={H} fill="none" stroke="#d9d9d9" />

          {/* Graticule, so this reads as coordinates rather than as a drawing of a country. */}
          {[70, 75, 80, 85, 90, 95].map((lon) => {
            const { x } = project(0, lon);
            return (
              <g key={`lon${lon}`}>
                <line x1={x} y1={0} x2={x} y2={H} stroke="#eeeeee" />
                <text x={x + 3} y={H - 6} fontSize="13" fill="#4a4a4a">{lon}°E</text>
              </g>
            );
          })}
          {[10, 15, 20, 25, 30, 35].map((lat) => {
            const { y } = project(lat, 0);
            return (
              <g key={`lat${lat}`}>
                <line x1={0} y1={y} x2={W} y2={y} stroke="#eeeeee" />
                <text x={4} y={y - 5} fontSize="13" fill="#4a4a4a">{lat}°N</text>
              </g>
            );
          })}

          {placed.map((o) => {
            return (
              <g key={o.name}>
                <title>
                  {`${o.rank}. ${o.name} — ${Math.round(o.gap)} of every 100 citizens asked said their closed case was not fixed`}
                </title>
                <line x1={o.x0} y1={o.y0} x2={o.x} y2={o.y} stroke="#8a8a8a" strokeWidth={1} />
                <circle cx={o.x0} cy={o.y0} r={2} fill="#4a4a4a" />
                <circle cx={o.x} cy={o.y} r={o.r} fill="#111111" fillOpacity={0.86} />
                <text
                  x={o.x}
                  y={o.y}
                  fontSize="22"
                  fontWeight={600}
                  fill="#ffffff"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {o.rank}
                </text>
              </g>
            );
          })}
        </svg>
        <figcaption className="mt-2 text-base text-muted">
          Schematic, and simulated. Circles are office locations, sized and numbered by the gap — biggest and
          number 1 is the office whose closures were least often confirmed fixed. Office coordinates only —
          no complainant is located on this map, and every office name is invented. Where two offices are too close to draw apart, the circle is nudged aside and a hairline points back to its true coordinate.
        </figcaption>
      </figure>

      <ol className="divide-y divide-rule border-y border-rule">
        {rows.map((o) => (
          <li key={o.name} className="grid gap-1 py-3 sm:grid-cols-[2.5rem_1fr_9rem] sm:items-baseline sm:gap-4">
            <span className="font-semibold tabular-nums text-muted">{o.rank}.</span>
            <span>
              {o.name}
              <span className="block text-base text-muted">
                {o.department} · {o.state} · {o.asked} citizens asked
              </span>
            </span>
            <span className="tabular-nums font-semibold">
              {Math.round(o.gap)} in 100 not fixed
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
