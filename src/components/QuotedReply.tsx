import { checkCitations } from '@/lib/agents/citation-guard';

/**
 * The department's reply, with the spans our auditor quoted marked in place.
 *
 * The highlighting is computed by the same guard that gates the verdict — so what you see
 * underlined is, by construction, text that exists verbatim in their reply. If a quote did not
 * match, no verdict was shown at all.
 */
export function QuotedReply({ body, citations }: { body: string; citations: { quote: string }[] }) {
  const guard = checkCitations(body, citations);
  const spans = guard.ok ? [...guard.spans].sort((a, b) => a.start - b.start) : [];

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (const [i, span] of spans.entries()) {
    if (span.start < cursor) continue; // overlapping quotes: keep the first, skip the rest
    if (span.start > cursor) parts.push(body.slice(cursor, span.start));
    parts.push(
      <mark key={i} className="bg-warn/15 px-0.5 underline decoration-warn decoration-2 underline-offset-4">
        {body.slice(span.start, span.end)}
      </mark>,
    );
    cursor = span.end;
  }
  if (cursor < body.length) parts.push(body.slice(cursor));

  return <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed">{parts}</p>;
}
