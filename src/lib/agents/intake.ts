/**
 * The Intake agent. Door B.
 *
 * Worth being honest about what this is: voice-first multilingual complaint filing with AI
 * follow-ups is a capability DARPG already shipped — Samadhan Didi, 30 May 2026, twenty-two
 * languages, on Bhashini. We build it because a rebuild of the platform has to include the
 * front door, not because it is our contribution. We never lead a demo with this agent.
 */

import { IntakeResultSchema, type IntakeResult, type Lang } from './schemas';
import { MODELS, loadPrompt, structuredCall } from './openai';

export const INTAKE_PROMPT_VERSION = 'intake.v1';
export const MAX_FOLLOW_UPS = 4;

export type Turn = { question: string | null; answer: string };

export async function intake(args: {
  transcript: string;
  lang: Lang;
  turns: Turn[];
}): Promise<IntakeResult> {
  const asked = args.turns.filter((t) => t.question).length;

  const history = args.turns
    .map((t) => (t.question ? `We asked: ${t.question}\nThey said: ${t.answer}` : `They said: ${t.answer}`))
    .join('\n\n');

  const user = `The citizen is speaking ${args.lang}.

${history ? `Everything said so far:\n\n${history}\n\n` : ''}Their latest words:
<citizen_words>
${args.transcript}
</citizen_words>

You have asked ${asked} follow-up question(s) so far, out of at most ${MAX_FOLLOW_UPS}.
${asked >= MAX_FOLLOW_UPS ? 'You have used all your questions. Set nextQuestion to null and readyToRoute to true.' : ''}

Return JSON only:
{"narrative": "...", "facts": {...}, "missing": ["..."], "nextQuestion": "..." or null, "readyToRoute": true|false}`;

  const result = await structuredCall({
    model: MODELS.conversational,
    system: loadPrompt(INTAKE_PROMPT_VERSION),
    user,
    schema: IntakeResultSchema,
    // The only agent above zero. A form-reading voice is worse than a slightly varied one, and
    // nothing here is a judgement that has to be reproducible.
    temperature: 0.3,
  });

  // The question cap is enforced in code. A model that decides it needs one more question is
  // not the thing that gets to decide that.
  if (asked >= MAX_FOLLOW_UPS) {
    return { ...result, nextQuestion: null, readyToRoute: true };
  }
  return result;
}
