/**
 * The Document agent.
 *
 * Its real job is not extraction — it is telling someone their photo is unusable BEFORE they
 * file, not three weeks later when the case is rejected for it. A specific instruction ("the
 * number at the bottom is cut off") saves a second trip to the office. "Image quality is poor"
 * does not.
 *
 * It never extracts an Aadhaar or PAN number. Not into the database, not into a prompt
 * response, not into a log. The field is skipped and the citizen is told we skipped it.
 */

import { DocumentResultSchema, type DocumentResult, type Lang } from './schemas';
import { MODELS, loadPrompt, openai } from './openai';

export const DOCUMENT_PROMPT_VERSION = 'document.v1';

export async function readDocument(args: {
  imageBase64: string;
  mimeType: string;
  citizenLang: Lang;
  expectedKind?: string;
}): Promise<DocumentResult> {
  const completion = await openai().chat.completions.create({
    model: MODELS.vision,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: loadPrompt(DOCUMENT_PROMPT_VERSION) },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text:
              `Write retakeInstruction in ${args.citizenLang}.` +
              (args.expectedKind ? ` This should be a ${args.expectedKind}.` : '') +
              `\n\nReturn JSON only:\n` +
              `{"readable": true|false, "kind": "..." or null, "extracted": {...},` +
              ` "missingRegions": ["..."], "retakeInstruction": "..." or null}`,
          },
          { type: 'image_url', image_url: { url: `data:${args.mimeType};base64,${args.imageBase64}` } },
        ],
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '';
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }

  const result = DocumentResultSchema.safeParse(parsed);
  if (!result.success) {
    // We could not read the reader. Say so plainly rather than passing a blank through.
    return {
      readable: false,
      kind: null,
      extracted: {},
      missingRegions: [],
      retakeInstruction: 'We could not read that photo at all. Take it again in better light, with the whole page in frame.',
    };
  }

  return stripIdentityNumbers(result.data);
}

/**
 * A second line of defence. The prompt says never to return an Aadhaar or PAN; this makes sure
 * that a model which does it anyway cannot get one into our database.
 */
function stripIdentityNumbers(doc: DocumentResult): DocumentResult {
  const AADHAAR = /\b\d{4}\s?\d{4}\s?\d{4}\b/;
  const PAN = /\b[A-Z]{5}\d{4}[A-Z]\b/;

  const extracted: Record<string, string> = {};
  let dropped = false;

  for (const [k, v] of Object.entries(doc.extracted)) {
    if (AADHAAR.test(v) || PAN.test(v) || /aadhaar|aadhar|\bpan\b/i.test(k)) {
      dropped = true;
      continue;
    }
    extracted[k] = v;
  }

  if (dropped) extracted['_note'] = 'An identity number was on this document. We deliberately did not read it.';
  return { ...doc, extracted };
}
