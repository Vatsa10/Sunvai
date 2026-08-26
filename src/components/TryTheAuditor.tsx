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
 * The six chips below answer a second, unspoken objection: does this only work on CPGRAMS?
 * They carry terminal strings observed on six different Indian public-service systems — an EPFO
 * claim rejected `OK/OK`, an Income Tax refund that failed for `Others`, a UIDAI update
 * `rejected due to technical reasons`. One engine reads all of them, and we integrated with
 * none of them: the strings are text we typed into this file, nothing more.
 *
 * Nothing here is stored. It is not a case; it is the auditor with its hands open.
 */

type Example = {
  /** The system the string was observed on. Shown on the chip. */
  system: string;
  /** The terminal string itself, verbatim. Shown on the chip. */
  string: string;
  /** Where it was observed. Shown under the chips when that chip is loaded. */
  attribution: string;
  complaint: string;
  reply: string;
};

const EXAMPLES: Example[] = [
  {
    system: 'EPFO',
    string: 'Claim Rejected OK/OK',
    attribution: 'reported by members on hrcabin.com’s rejection threads, 2019–2025',
    complaint:
      'I applied to withdraw my PF after leaving my job in June. The claim was rejected and the reason printed on the status page is just "OK/OK". I have read it twenty times and I still do not know what is wrong with my claim or what I am supposed to fix. Please tell me what the defect is and what document you need from me.',
    reply: 'Claim Rejected OK/OK',
  },
  {
    system: 'EPFO',
    string: 'WARNING-520461 mismatch in member ledger',
    attribution: 'member reports, hrcabin.com / CiteHR',
    complaint:
      'My PF transfer request has been stuck for eleven weeks. The only thing shown against it is "WARNING-520461 there is a mismatch between summary and details transactions in member ledger". I did not create any ledger and I cannot edit one. Which year of contributions does not match, and who corrects it — me, or my former employer?',
    reply:
      'WARNING-520461 there is a mismatch between summary and details transactions in member ledger',
  },
  {
    system: 'Income Tax',
    string: 'Refund failure reason: Others',
    attribution: 'e-filing refund status, widely reported',
    complaint:
      'My income tax refund for AY 2025-26 has failed twice. The refund status on the e-filing portal gives the failure reason as "Others". My bank account is pre-validated and the name matches my PAN. Tell me what actually failed so I can correct it, and when the refund will be re-issued.',
    reply: 'Refund failure reason: Others',
  },
  {
    system: 'GST',
    string: 'Cancellation reason: Others',
    attribution: 'GST portal cancellation notices',
    complaint:
      'My GST registration was cancelled last week and the reason recorded in the order is "Others". I have filed every return on time and I have the acknowledgements. I run a two-person business and I cannot raise an invoice until this is sorted. What is the actual ground for cancellation, and what do I file to have it revoked?',
    reply: 'Cancellation reason: Others',
  },
  {
    system: 'UIDAI',
    string: 'rejected due to technical reasons',
    attribution: 'Aadhaar update status',
    complaint:
      'I applied to correct the spelling of my name on my Aadhaar and submitted my passport as proof. The update status now says "rejected due to technical reasons". I paid the fee and travelled to the centre twice. Was the document not accepted, or did something fail at your end? Tell me whether I need to apply again and whether I pay again.',
    reply: 'Your update request has been rejected due to technical reasons.',
  },
  {
    system: 'CPGRAMS',
    string: 'Forwarded to the concerned office.',
    attribution: 'pgportal.gov.in closure remarks',
    complaint:
      'My old-age pension has not been credited since May. I filed a grievance in July asking two things: why the payment stopped, and when the arrears will be paid. It has now been marked closed. Nobody has answered either question and no money has arrived.',
    reply: 'The matter has been forwarded to the concerned office.',
  },
];

export function TryTheAuditor({ compact = false }: { compact?: boolean }) {
  const [complaint, setComplaint] = useState('');
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditPreview | null>(null);
  const [loaded, setLoaded] = useState<Example | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const outcome = await auditText({ complaint, reply });
      // A refusal — too long, too short, or the throttle — comes back as data rather than as a
      // thrown error, because a production build would replace a thrown message with a digest.
      if (!outcome.ok) setError(outcome.message);
      else setResult(outcome);
    } catch {
      // A genuine fault: the model call failed or the network went. There is no message worth
      // repeating from it, so we say the one true thing we know.
      setError('That did not work. Nothing was saved, and nothing was sent anywhere.');
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

      <div className="space-y-3">
        <div>
          <h3 className="font-semibold">The same dead end, on six different systems</h3>
          {/*
            This paragraph is the whole point of the chips, and it sits above them rather than
            below so nobody can read the six logos' worth of names and conclude we are wired
            into six portals. We are not. These are strings people have pasted into public
            forums, retyped here by hand.
          */}
          <p className="mt-1 text-muted">
            These are other people’s rejection letters, pasted in here as text. Nothing is stored, and no
            platform is contacted — we hold no connection to EPFO, the Income Tax portal, GST, UIDAI or
            CPGRAMS, and none of these buttons reaches one. The verdict vocabulary is generic: the auditor
            judges whether a reply answered the question, and knows nothing about any particular platform’s
            reason codes.
          </p>
        </div>

        <ul className="flex flex-wrap gap-2">
          {EXAMPLES.map((e) => {
            const isLoaded = loaded?.string === e.string;
            return (
              <li key={e.system + e.string}>
                <button
                  type="button"
                  aria-pressed={isLoaded}
                  onClick={() => {
                    setComplaint(e.complaint);
                    setReply(e.reply);
                    setLoaded(e);
                    setResult(null);
                    setError(null);
                  }}
                  className={`flex min-h-touch w-full flex-col items-start gap-0.5 rounded border px-4 py-2 text-left hover:border-ink ${
                    isLoaded ? 'border-ink border-2 bg-ink/5' : 'border-rule'
                  }`}
                >
                  <span className="text-sm font-semibold uppercase tracking-wide">
                    {e.system}
                    {isLoaded && <span className="ml-2 font-normal normal-case">· loaded</span>}
                  </span>
                  <span className="font-serif">“{e.string}”</span>
                </button>
              </li>
            );
          })}
        </ul>

        {loaded && (
          <p className="text-sm text-muted">
            <strong>{loaded.system}</strong> — {loaded.attribution}. Retyped from public reports; the
            complaint above it is written by us, not taken from anyone’s case.
          </p>
        )}
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
