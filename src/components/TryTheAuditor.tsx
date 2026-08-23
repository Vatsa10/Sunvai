'use client';

import { useState } from 'react';
import { auditText, type AuditPreview } from '@/actions/audit-actions';
import { verdictCopy } from '@/lib/verdicts';

/**
 * Audit a reply we did not choose.
 *
 * Three demo cases invite one fair objection: of course it works, you picked them. So this
 * takes any closure reply — a real one somebody received, or one written specifically to fool
 * us — and judges it on the spot, quoting from the text the reader supplied rather than ours.
 *
 * Nothing here is stored. It is not a case; it is the auditor with its hands open.
 */

const EXAMPLES: { label: string; complaint: string; reply: string }[] = [
  {
    label: 'A reply written to sound thorough',
    complaint:
      'My scholarship for the 2025-26 year has not been credited. I applied in June and the portal still shows "under process". I want to know why it has not been paid and when it will be.',
    reply:
      'With reference to your grievance dated 12 August 2026 regarding non-receipt of scholarship, the matter has been examined in detail by this office and appropriate action has been initiated with the concerned authority. The grievance is accordingly closed.',
  },
  {
    label: 'A reply that genuinely answers',
    complaint:
      'My water connection application has been pending for two months with no update. I want to know the status and when the connection will be given.',
    reply:
      'Your application no. WC/2026/4471 was held up because the plot verification report was pending from the ward office. That report was received on 14 August 2026 and your connection has been sanctioned. Work is scheduled for 29 August 2026.',
  },
];

export function TryTheAuditor({ compact = false }: { compact?: boolean }) {
  const [complaint, setComplaint] = useState('');
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditPreview | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await auditText({ complaint, reply }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That did not work. Nothing was saved.');
    } finally {
      setBusy(false);
    }
  }

  const v = result ? verdictCopy(result.result.verdict, 'en') : null;

  return (
    <div className="space-y-4">
      {!compact && (
        <div>
          <h2 className="text-xl font-semibold">Try it on a reply we did not choose</h2>
          <p className="mt-1 text-muted">
            Paste a closure you actually received, or write one designed to fool us. Nothing is saved.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((e) => (
          <button
            key={e.label}
            type="button"
            onClick={() => {
              setComplaint(e.complaint);
              setReply(e.reply);
              setResult(null);
              setError(null);
            }}
            className="min-h-touch rounded border border-rule px-4 py-2 text-sm hover:border-ink"
          >
            {e.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="ta-complaint" className="block font-semibold">
            What the citizen asked for
          </label>
          <textarea
            id="ta-complaint"
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            rows={5}
            placeholder="My pension stopped in May and nobody has told me why…"
            className="mt-1 w-full rounded border border-ink p-3"
          />
        </div>
        <div>
          <label htmlFor="ta-reply" className="block font-semibold">
            What the department wrote back
          </label>
          <textarea
            id="ta-reply"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={5}
            placeholder="The matter has been forwarded to the concerned department…"
            className="mt-1 w-full rounded border border-ink p-3"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={run}
        disabled={busy || !complaint.trim() || !reply.trim()}
        className="min-h-touch rounded bg-ink px-6 py-3 font-semibold text-paper disabled:opacity-40"
      >
        {busy ? 'Reading it…' : 'Judge this reply'}
      </button>

      {error && (
        <p role="alert" className="rounded border-2 border-bad p-4 text-bad">
          {error}
        </p>
      )}

      {result && v && (
        <div className={`space-y-3 rounded border-2 p-5 ${v.className}`}>
          <p className="flex items-center gap-3">
            <span aria-hidden className="text-2xl">{v.icon}</span>
            <span className="text-lg font-semibold uppercase tracking-wide">{v.label}</span>
          </p>
          <p className="text-lg font-semibold text-ink">{v.headline}</p>
          <p className="text-ink">{result.result.reasoning}</p>

          {result.result.citations.length > 0 && (
            <div className="text-ink">
              <h3 className="font-semibold">Quoted from what you pasted</h3>
              <ul className="mt-1 space-y-1">
                {result.result.citations.map((c, i) => (
                  <li key={i} className="border-l-2 border-current/40 pl-3 font-serif">
                    “{c.quote}”
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm">
                Each of those was checked character-by-character against your text before you were shown a
                verdict. Verified: <strong>{result.citationsVerified ? 'yes' : 'no'}</strong>
                {result.guardFailures > 0 && ` · the model had to be sent back ${result.guardFailures} time(s)`}
              </p>
            </div>
          )}

          {result.result.unaddressed.length > 0 && (
            <div className="text-ink">
              <h3 className="font-semibold">What it did not answer</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {result.result.unaddressed.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </div>
          )}

          {result.result.injection_suspected && (
            <p className="rounded border border-bad p-3 text-bad">
              That text tried to give our auditor instructions. We treated it as evidence and judged it on its
              substance — but you should know it tried.
            </p>
          )}

          <p className="text-sm text-ink">
            This verdict is not a score. In a real case the number that counts is the citizen’s own answer to
            “did your problem actually get fixed?” — never ours.
          </p>
        </div>
      )}
    </div>
  );
}
