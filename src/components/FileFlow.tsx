'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { advanceIntake, routeAndDraft, fileGrievance, type RoutedDraft } from '@/actions/file-actions';
import type { Lang } from '@/lib/adapters/types';
import type { IntakeFacts } from '@/lib/agents/schemas';

type Turn = { question: string | null; answer: string };
type Stage = 'speaking' | 'routing' | 'consent' | 'filing';

/**
 * Door B, end to end: speak → at most four questions → routed with the reason shown → drafted →
 * consent gate → filed.
 *
 * Voice is the primary input and the transcript is always editable, because speech recognition
 * on Indian languages over a bad connection is not something to be quietly confident about. If
 * the microphone is unavailable, typing is not a fallback buried behind an error — it is right
 * there, always.
 */
export function FileFlow({ lang }: { lang: Lang }) {
  const router = useRouter();

  const [stage, setStage] = useState<Stage>('speaking');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [narrative, setNarrative] = useState('');
  const [facts, setFacts] = useState<IntakeFacts>({});
  const [drafted, setDrafted] = useState<RoutedDraft | null>(null);
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (e) => chunks.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks.current, { type: rec.mimeType });
        await transcribe(blob);
      };
      rec.start();
      recorder.current = rec;
      setRecording(true);
    } catch {
      setError('We cannot reach the microphone on this device. Type it instead — it works exactly the same.');
    }
  }

  function stopRecording() {
    recorder.current?.stop();
    setRecording(false);
  }

  async function transcribe(blob: Blob) {
    setBusy('Writing down what you said…');
    try {
      const form = new FormData();
      form.append('audio', blob);
      form.append('lang', lang);
      const res = await fetch('/api/transcribe', { method: 'POST', body: form });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || !data.text) throw new Error(data.error ?? 'transcription failed');
      // Appended, not replaced: a second recording adds to what is already there.
      setTranscript((t) => (t ? `${t} ${data.text}` : data.text!));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'We could not hear that. Try again, or type it instead.');
    } finally {
      setBusy(null);
    }
  }

  async function submitTurn() {
    if (!transcript.trim()) return;
    setBusy('Reading what you told us…');
    setError(null);
    try {
      const nextTurns = [...turns, { question, answer: transcript.trim() }];
      const step = await advanceIntake({ transcript: transcript.trim(), lang, turns: nextTurns });
      setTurns(nextTurns);
      setNarrative(step.narrative);
      setFacts(step.facts);
      setTranscript('');

      if (step.readyToRoute || !step.nextQuestion) {
        setQuestion(null);
        setStage('routing');
        await doRoute(step.narrative, step.facts);
      } else {
        setQuestion(step.nextQuestion);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Nothing has been sent.');
    } finally {
      setBusy(null);
    }
  }

  async function doRoute(n: string, f: IntakeFacts, forceDepartmentId?: string, forceOfficeId?: string | null) {
    setBusy('Working out who this goes to, and writing it up…');
    try {
      const result = await routeAndDraft({ narrative: n, facts: f, lang, forceDepartmentId, forceOfficeId });
      setDrafted(result);
      setStage('consent');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'We could not prepare this. Nothing has been sent.');
      setStage('speaking');
    } finally {
      setBusy(null);
    }
  }

  async function submitFiling() {
    if (!drafted || !consent) return;
    setBusy('Filing it…');
    setStage('filing');
    try {
      const { ref } = await fileGrievance({
        narrative,
        lang,
        name,
        departmentId: drafted.departmentId,
        officeId: drafted.officeId,
        formalText: drafted.formalText,
        citizenLangText: drafted.citizenLangText,
        subject: drafted.subject,
        consented: consent,
        routerReasoning: drafted.reasoning,
        routerOverridden: false,
      });
      router.push(`/case/${encodeURIComponent(ref)}?lang=${lang}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'We could not file this. Nothing has been sent.');
      setStage('consent');
      setBusy(null);
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <p role="alert" className="rounded border-2 border-bad p-4 text-bad">
          {error}
        </p>
      )}

      {stage === 'speaking' && (
        <section className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold">
              {question ?? 'Tell us what went wrong, in your own words.'}
            </h2>
            <p className="mt-1 text-muted">
              {question
                ? `One more thing — question ${turns.filter((t) => t.question).length + 1} of at most 4.`
                : 'Speak for as long as you like. We will ask at most four short questions after this.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={recording ? stopRecording : startRecording}
              disabled={Boolean(busy)}
              className={`flex min-h-[64px] items-center gap-3 rounded-full px-8 text-lg font-semibold ${
                recording ? 'bg-bad text-paper' : 'bg-ink text-paper'
              } disabled:opacity-40`}
            >
              <span aria-hidden className="text-2xl">{recording ? '■' : '●'}</span>
              {recording ? 'Stop' : 'Speak'}
            </button>
            {recording && <span className="text-bad">Listening… tap Stop when you are finished.</span>}
          </div>

          <div>
            <label htmlFor="transcript" className="block font-semibold">
              This is what we heard. Change anything that is wrong.
            </label>
            <textarea
              id="transcript"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={6}
              placeholder="…or just type it here."
              className="mt-2 w-full rounded border border-ink p-3 text-lg"
            />
          </div>

          <button
            type="button"
            onClick={submitTurn}
            disabled={Boolean(busy) || !transcript.trim()}
            className="min-h-touch rounded bg-ink px-6 py-3 font-semibold text-paper disabled:opacity-40"
          >
            Continue
          </button>

          {narrative && (
            <details className="rounded border border-rule p-4">
              <summary className="cursor-pointer font-semibold">What we have written down so far</summary>
              <p className="mt-2 whitespace-pre-wrap">{narrative}</p>
            </details>
          )}
        </section>
      )}

      {busy && (
        <p className="rounded border border-rule p-4 text-muted" role="status">
          {busy}
        </p>
      )}

      {stage === 'consent' && drafted && (
        <section className="space-y-6">
          <div className="rounded border border-rule p-5">
            <h2 className="text-lg font-semibold">Who this goes to</h2>
            <p className="mt-2 text-lg">
              {drafted.departmentName}
              {drafted.officeName ? ` — ${drafted.officeName}` : ''}
            </p>
            <p className="mt-1 text-muted">{drafted.reasoning}</p>

            {drafted.jurisdictionNote && (
              <p className="mt-3 rounded border border-warn bg-warn/5 p-3 text-warn">
                <strong>Before you send this:</strong> {drafted.jurisdictionNote}
              </p>
            )}

            {drafted.alternatives.length > 0 && (
              <details className="mt-3" open={drafted.needsChoice}>
                <summary className="cursor-pointer font-semibold">That’s not right — send it somewhere else</summary>
                <ul className="mt-3 space-y-2">
                  {drafted.alternatives.map((a) => (
                    <li key={`${a.departmentId}-${a.officeId}`}>
                      <button
                        type="button"
                        onClick={() => void doRoute(narrative, facts, a.departmentId, a.officeId)}
                        className="w-full rounded border border-rule p-3 text-left hover:border-ink"
                      >
                        <span className="font-semibold">
                          {a.departmentName}
                          {a.officeName ? ` — ${a.officeName}` : ''}
                        </span>
                        <span className="mt-1 block text-muted">{a.why}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>

          {/* The consent gate. Both languages at once, never one behind a toggle. */}
          <div className="rounded border-2 border-ink p-5">
            <h2 className="text-xl font-semibold">This is exactly what we will send. Nothing else.</h2>
            <p className="mt-1 text-muted">Subject: {drafted.subject}</p>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">What is sent (English)</h3>
                <p className="mt-1 whitespace-pre-wrap font-serif">{drafted.formalText}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
                  The same thing, in your language
                </h3>
                <p className="mt-1 whitespace-pre-wrap font-serif">{drafted.citizenLangText}</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="name" className="block font-semibold">
                  Your name, as it should appear
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Leave blank to file anonymously"
                  className="mt-1 w-full max-w-sm rounded border border-ink px-3 py-2 text-lg"
                />
                <p className="mt-1 text-sm text-muted">
                  We do not ask for a phone number, an Aadhaar number or an OTP. Not here, not later.
                </p>
              </div>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1.5 h-6 w-6"
                />
                <span>I have read this and I want it sent.</span>
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={submitFiling}
                  disabled={!consent || Boolean(busy)}
                  className="min-h-touch rounded bg-ink px-6 py-3 font-semibold text-paper disabled:opacity-40"
                >
                  File it
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStage('speaking');
                    setDrafted(null);
                    setConsent(false);
                  }}
                  className="min-h-touch rounded border border-ink px-6 py-3 font-semibold"
                >
                  Change something
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
