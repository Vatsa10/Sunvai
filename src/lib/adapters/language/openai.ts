/**
 * Speech and translation, behind an interface.
 *
 * In production this is Bhashini's job — it is the government's own language stack, it covers
 * twenty-two languages, and duplicating it would be both worse and rude. We use OpenAI here
 * because the brief requires an OpenAI model and because Bhashini access is not something a
 * prototype can assume. We make no claim that ours is better; we have run no benchmark.
 */

import { MODELS, openai } from '../../agents/openai';
import type { Lang } from '../types';

export interface LanguageProvider {
  readonly id: string;
  readonly isMock: boolean;
  transcribe(audio: Blob, hintLang?: Lang): Promise<{ text: string; lang: Lang }>;
  synthesize(text: string, lang: Lang): Promise<ArrayBuffer>;
  translate(text: string, from: Lang, to: Lang): Promise<string>;
}

export class OpenAILanguageProvider implements LanguageProvider {
  readonly id = 'openai';
  readonly isMock = false;

  async transcribe(audio: Blob, hintLang?: Lang): Promise<{ text: string; lang: Lang }> {
    const file = new File([audio], 'speech.webm', { type: audio.type || 'audio/webm' });
    const res = await openai().audio.transcriptions.create({
      file,
      model: MODELS.transcribe,
      ...(hintLang ? { language: hintLang } : {}),
    });
    return { text: res.text.trim(), lang: hintLang ?? 'hi' };
  }

  async synthesize(text: string, lang: Lang): Promise<ArrayBuffer> {
    const res = await openai().audio.speech.create({
      model: MODELS.tts,
      voice: 'alloy',
      input: text,
      // Read at the pace of someone explaining, not announcing.
      instructions: `Read this aloud in ${lang}, plainly and unhurriedly, as if explaining it to someone who is worried.`,
    });
    return res.arrayBuffer();
  }

  async translate(text: string, from: Lang, to: Lang): Promise<string> {
    if (from === to) return text;
    const res = await openai().chat.completions.create({
      model: MODELS.fast,
      messages: [
        {
          role: 'system',
          content:
            'Translate faithfully. Do not summarise, soften, explain or add anything. Return only the translation.',
        },
        { role: 'user', content: `Translate from ${from} to ${to}:\n\n${text}` },
      ],
    });
    return res.choices[0]?.message?.content?.trim() ?? text;
  }
}

export const language: LanguageProvider = new OpenAILanguageProvider();
