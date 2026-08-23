'use client';

import { useState } from 'react';
import { verifyReceipt, type Receipt, type VerifyResult } from '@/lib/ledger/verify';

/**
 * The verifier. Runs entirely in your browser — no network call, nothing sent back to us.
 *
 * It also has to fail. A verifier that always says "verified" is a decoration, so open a
 * receipt, change one character in a text editor, and drop it here again.
 */
export default function VerifyPage() {
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    setFilename(file.name);
    try {
      const receipt = JSON.parse(await file.text()) as Receipt;
      setResult(await verifyReceipt(receipt));
    } catch {
      setResult({ ok: false, brokenAtSeq: 0, reason: 'That file is not readable as a receipt.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Check a receipt</h1>
        <p className="text-muted">
          Drop the file you downloaded. This runs on your phone, not on our server — we are not asked, and we
          are not trusted.
        </p>
      </header>

      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) void handleFile(f);
        }}
        className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-rule p-8 text-center"
      >
        <span className="text-lg font-semibold">Drop your receipt here</span>
        <span className="mt-1 text-muted">or tap to choose the file</span>
        <input
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />
      </label>

      {busy && <p>Checking…</p>}

      {result && !busy && (
        <div
          className={`rounded border-2 p-5 ${result.ok ? 'border-good text-good' : 'border-bad text-bad'}`}
          role="status"
        >
          <p className="flex items-center gap-3 text-xl font-semibold">
            <span aria-hidden>{result.ok ? '✔' : '✖'}</span>
            {result.ok
              ? `Verified — ${result.count} steps, unaltered.`
              : `This record has been changed at step ${result.brokenAtSeq}.`}
          </p>
          {!result.ok && <p className="mt-2 text-ink">{result.reason}</p>}
          {filename && <p className="mt-2 text-sm text-muted">{filename}</p>}
        </div>
      )}

      <section className="space-y-2 border-t border-rule pt-6 text-muted">
        <h2 className="font-semibold text-ink">Try breaking it</h2>
        <p>
          Download a receipt from any case, open it in a text editor, change one date, and drop it here. It
          should go red. If it does not, this page is worthless and we would want to know.
        </p>
        <p className="text-sm">
          What this proves: the record was not edited after it was written. What it does not prove: that we
          never wrote something false in the first place. With one operator and no external anchoring, we are
          still the root of trust — and we say so on{' '}
          <a href="/how-this-works" className="underline">
            how this works
          </a>
          .
        </p>
      </section>
    </div>
  );
}
