/**
 * A schematic map of where the offices are.
 *
 * Deliberately not a tile map: no external requests, no map library, nothing to load on a 2G
 * connection, and no basemap detail implying a precision we do not have. It is an equirectangular
 * plot of office coordinates over India's bounding box, drawn as inline SVG — a few hundred bytes,
 * legible at any size, and it works with images disabled.
 */

type Point = {
  id: string;
  label: string;
  office: string;
  lat: number;
  lon: number;
  members: number;
  current: boolean;
};

// India's bounding box, with a little air around it.
const BOUNDS = { minLon: 67, maxLon: 98, minLat: 6, maxLat: 36 };
const W = 620;
const H = 600;

function project(lat: number, lon: number) {
  const x = ((lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)) * W;
  const y = H - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * H;
  return { x, y };
}

export function ClusterMap({ points }: { points: Point[] }) {
  const radius = (members: number) => 6 + Math.sqrt(members) * 2.2;

  return (
    <figure className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full min-w-[20rem] max-w-[38rem]"
        role="img"
        aria-label={`Schematic map of ${points.length} offices with public complaint patterns`}
      >
        <rect x={0} y={0} width={W} height={H} fill="none" stroke="#d9d9d9" />

        {/* Graticule, so the plot reads as coordinates rather than as a drawing of a country. */}
        {[70, 75, 80, 85, 90, 95].map((lon) => {
          const { x } = project(0, lon);
          return (
            <g key={`lon${lon}`}>
              <line x1={x} y1={0} x2={x} y2={H} stroke="#eeeeee" />
              <text x={x + 3} y={H - 6} fontSize="11" fill="#8a8a8a">{lon}°E</text>
            </g>
          );
        })}
        {[10, 15, 20, 25, 30, 35].map((lat) => {
          const { y } = project(lat, 0);
          return (
            <g key={`lat${lat}`}>
              <line x1={0} y1={y} x2={W} y2={y} stroke="#eeeeee" />
              <text x={4} y={y - 4} fontSize="11" fill="#8a8a8a">{lat}°N</text>
            </g>
          );
        })}

        {points.map((p) => {
          const { x, y } = project(p.lat, p.lon);
          const r = radius(p.members);
          return (
            <g key={p.id}>
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={p.current ? '#a4161a' : '#111111'}
                fillOpacity={p.current ? 0.85 : 0.25}
                stroke={p.current ? '#a4161a' : '#111111'}
                strokeWidth={p.current ? 2 : 1}
              />
              <text x={x + r + 6} y={y + 4} fontSize="13" fill="#111111" fontWeight={p.current ? 600 : 400}>
                {p.office}
              </text>
              <text x={x + r + 6} y={y + 20} fontSize="12" fill="#4a4a4a">
                {p.members} complaints
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 text-sm text-muted">
        Schematic. Circles are offices, sized by how many complaints share the pattern; the filled one is this
        cluster. Office coordinates only — no complainant is located on this map.
      </figcaption>
    </figure>
  );
}
