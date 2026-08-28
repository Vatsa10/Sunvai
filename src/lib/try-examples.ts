/**
 * The six terminal strings behind the paste box's example chips.
 *
 * They used to live inside `TryTheAuditor.tsx`. They moved here because three places now need
 * the same six pairs and they must be the same six, character for character:
 *
 *   1. the component, which renders the chips;
 *   2. `scripts/precompute-chip-audits.ts`, which runs the real auditor over them once and
 *      commits the verdicts;
 *   3. `auditText`, which serves those committed verdicts when the submitted text is one of
 *      these pairs exactly, and calls the model when it is not.
 *
 * That last one is why `matchExample` exists and why it hashes nothing and normalises nothing. A
 * fixture is served only on an exact match of both fields after trimming. Change one character
 * of a chip's complaint or reply in the box and the match fails, which is the correct outcome:
 * the reader gets a live audit of the text they actually submitted, never a stale verdict about
 * text that is no longer on screen.
 *
 * Each string was observed on a different Indian public-service system and retyped here by
 * hand. We are integrated with none of them.
 */

export type TryExample = {
  /** Stable key for the fixture. Never derived from the text, so a text edit cannot collide. */
  id: string;
  /** The system the string was observed on. Shown on the chip. */
  system: string;
  /** The terminal string itself, verbatim. Shown on the chip. */
  string: string;
  /** Where it was observed. Shown under the chips when that chip is loaded. */
  attribution: string;
  complaint: string;
  reply: string;
};

export const TRY_EXAMPLES: TryExample[] = [
  {
    id: 'epfo-ok-ok',
    system: 'EPFO',
    string: 'Claim Rejected OK/OK',
    attribution: 'reported by members on hrcabin.com’s rejection threads, 2019–2025',
    complaint:
      'I applied to withdraw my PF after leaving my job in June. The claim was rejected and the reason printed on the status page is just "OK/OK". I have read it twenty times and I still do not know what is wrong with my claim or what I am supposed to fix. Please tell me what the defect is and what document you need from me.',
    reply: 'Claim Rejected OK/OK',
  },
  {
    id: 'epfo-warning-520461',
    system: 'EPFO',
    string: 'WARNING-520461 mismatch in member ledger',
    attribution: 'member reports, hrcabin.com / CiteHR',
    complaint:
      'My PF transfer request has been stuck for eleven weeks. The only thing shown against it is "WARNING-520461 there is a mismatch between summary and details transactions in member ledger". I did not create any ledger and I cannot edit one. Which year of contributions does not match, and who corrects it — me, or my former employer?',
    reply:
      'WARNING-520461 there is a mismatch between summary and details transactions in member ledger',
  },
  {
    id: 'itd-refund-others',
    system: 'Income Tax',
    string: 'Refund failure reason: Others',
    attribution: 'e-filing refund status, widely reported',
    complaint:
      'My income tax refund for AY 2025-26 has failed twice. The refund status on the e-filing portal gives the failure reason as "Others". My bank account is pre-validated and the name matches my PAN. Tell me what actually failed so I can correct it, and when the refund will be re-issued.',
    reply: 'Refund failure reason: Others',
  },
  {
    id: 'gst-cancellation-others',
    system: 'GST',
    string: 'Cancellation reason: Others',
    attribution: 'GST portal cancellation notices',
    complaint:
      'My GST registration was cancelled last week and the reason recorded in the order is "Others". I have filed every return on time and I have the acknowledgements. I run a two-person business and I cannot raise an invoice until this is sorted. What is the actual ground for cancellation, and what do I file to have it revoked?',
    reply: 'Cancellation reason: Others',
  },
  {
    id: 'uidai-technical-reasons',
    system: 'UIDAI',
    string: 'rejected due to technical reasons',
    attribution: 'Aadhaar update status',
    complaint:
      'I applied to correct the spelling of my name on my Aadhaar and submitted my passport as proof. The update status now says "rejected due to technical reasons". I paid the fee and travelled to the centre twice. Was the document not accepted, or did something fail at your end? Tell me whether I need to apply again and whether I pay again.',
    reply: 'Your update request has been rejected due to technical reasons.',
  },
  {
    id: 'forwarded-to-concerned-office',
    system: 'CPGRAMS',
    string: 'Forwarded to the concerned office.',
    attribution: 'pgportal.gov.in closure remarks',
    complaint:
      'My old-age pension has not been credited since May. I filed a grievance in July asking two things: why the payment stopped, and when the arrears will be paid. It has now been marked closed. Nobody has answered either question and no money has arrived.',
    reply: 'The matter has been forwarded to the concerned office.',
  },
];

/**
 * The id of the chip whose complaint AND reply both match, exactly, after trimming. Null for
 * anything else — including a chip with one character changed.
 */
export function matchExample(complaint: string, reply: string): string | null {
  const c = complaint.trim();
  const r = reply.trim();
  return TRY_EXAMPLES.find((e) => e.complaint.trim() === c && e.reply.trim() === r)?.id ?? null;
}
