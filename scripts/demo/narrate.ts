/**
 * Synthesise the narration with Murf, one file per beat, and write down how long each one is.
 *
 *   pnpm tsx scripts/demo/narrate.ts            # synthesise
 *   pnpm tsx scripts/demo/narrate.ts --voices   # list voices and exit
 *
 * The durations are the whole reason this runs as a separate step: the recorder holds each
 * beat for exactly as long as its narration, so the audio and the screen cannot drift. Nothing
 * here takes a key as an argument — MURF_API_KEY is read from the environment, so the key
 * never lands in a shell history or a process list.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import 'dotenv/config';
import { BEATS, wordCount } from './beats';

const KEY = process.env.MURF_API_KEY?.trim();
const OUT = join(process.cwd(), '.demo');
const API = 'https://api.murf.ai/v1/speech';

/**
 * An Indian English voice, because the narration is about Indian public services and a US
 * voice reading "lakh" is its own small credibility problem. Override with MURF_VOICE.
 */
const PREFERRED = process.env.MURF_VOICE?.trim();

type Voice = { voiceId: string; displayName?: string; locale?: string; accent?: string };

async function listVoices(): Promise<Voice[]> {
  const res = await fetch(`${API}/voices`, { headers: { 'api-key': KEY! } });
  if (!res.ok) throw new Error(`Murf voices ${res.status}: ${await res.text()}`);
  return (await res.json()) as Voice[];
}

async function synth(text: string, voiceId: string): Promise<{ url: string; seconds: number }> {
  const res = await fetch(`${API}/generate`, {
    method: 'POST',
    headers: { 'api-key': KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceId, format: 'MP3', channelType: 'MONO', sampleRate: 44100 }),
  });
  if (!res.ok) throw new Error(`Murf generate ${res.status}: ${await res.text()}`);
  const body = (await res.json()) as { audioFile?: string; audioLengthInSeconds?: number };
  if (!body.audioFile) throw new Error(`Murf returned no audio: ${JSON.stringify(body)}`);
  return { url: body.audioFile, seconds: body.audioLengthInSeconds ?? 0 };
}

async function main() {
  if (!KEY) {
    console.error('MURF_API_KEY is not set. Add it to .env — never pass it as an argument.');
    process.exit(1);
  }

  const voices = await listVoices();
  if (process.argv.includes('--voices')) {
    for (const v of voices) console.log(`${v.voiceId}\t${v.locale ?? ''}\t${v.displayName ?? ''}`);
    return;
  }

  const chosen =
    (PREFERRED && voices.find((v) => v.voiceId === PREFERRED)) ??
    voices.find((v) => v.locale?.startsWith('en-IN')) ??
    voices.find((v) => v.locale?.startsWith('en-'));
  if (!chosen) throw new Error('No English voice available on this Murf account.');
  console.log(`voice: ${chosen.voiceId} (${chosen.locale ?? '?'})`);

  const words = wordCount();
  console.log(`${words} spoken words across ${BEATS.length} beats`);

  mkdirSync(OUT, { recursive: true });
  const durations: number[] = [];

  for (const [i, beat] of BEATS.entries()) {
    if (!beat.say) {
      durations.push(0);
      console.log(`${i}: (silence)`);
      continue;
    }
    const { url, seconds } = await synth(beat.say, chosen.voiceId);
    const audio = Buffer.from(await (await fetch(url)).arrayBuffer());
    writeFileSync(join(OUT, `beat-${String(i).padStart(2, '0')}.mp3`), audio);
    durations.push(seconds);
    console.log(`${i}: ${seconds.toFixed(1)}s  ${beat.say.slice(0, 56)}…`);
  }

  const spoken = durations.reduce((a, b) => a + b, 0);
  const holds = BEATS.reduce((n, b) => n + (b.hold ?? 0), 0);
  const total = spoken + holds;
  writeFileSync(join(OUT, 'durations.json'), JSON.stringify({ durations, total }, null, 2));

  console.log(`\ntotal ${total.toFixed(1)}s (${(total / 60).toFixed(2)} min)`);
  if (total > 120) {
    console.log(
      `OVER TWO MINUTES by ${(total - 120).toFixed(1)}s. Cut words from beats.ts, or speed the\n` +
        `final cut by ${(total / 120).toFixed(2)}x in the editor.`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
