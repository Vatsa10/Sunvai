/**
 * The Router.
 *
 * Classification into a department is also already shipped by CPGRAMS. What is ours is the
 * part around it: the reasoning is shown in one sentence the citizen can read, "that's not
 * right" is always available and the override is a ledger event, and a jurisdiction mismatch
 * is flagged BEFORE filing — because filing a municipal matter centrally is how a case gets
 * forwarded and closed, which is the failure this product exists to catch.
 */

import { RouteResultSchema, type RouteResult, type IntakeFacts, type Lang } from './schemas';
import { MODELS, loadPrompt, structuredCall } from './openai';
import type { DepartmentNode } from '../adapters/types';

export const ROUTER_PROMPT_VERSION = 'router.v1';
export const CONFIDENCE_FLOOR = 0.7;

export async function route(args: {
  narrative: string;
  facts: IntakeFacts;
  taxonomy: DepartmentNode[];
  lang: Lang;
}): Promise<RouteResult> {
  const taxonomy = args.taxonomy
    .map(
      (d) =>
        `- ${d.shortName} (id: ${d.id}) — ${d.name} [${d.categoryPath.join(' / ')}]\n` +
        d.offices.map((o) => `    · ${o.name} (id: ${o.id}) — ${o.state}`).join('\n'),
    )
    .join('\n');

  const user = `Taxonomy — choose only from this list, never invent a department or office:

${taxonomy}

The citizen's complaint, in their own words (${args.lang}):
<citizen_complaint>
${args.narrative}
</citizen_complaint>

What we understood:
${JSON.stringify(args.facts, null, 2)}

Write \`reasoning\` in ${args.lang}, as one sentence naming the detail that decided it.

Return JSON only:
{"departmentId": "...", "officeId": "..." or null, "reasoning": "...", "confidence": 0.0,
 "alternatives": [{"departmentId": "...", "officeId": "..." or null, "why": "..."}],
 "jurisdiction_note": "..." }`;

  const result = await structuredCall({
    model: MODELS.fast,
    system: loadPrompt(ROUTER_PROMPT_VERSION),
    user,
    schema: RouteResultSchema,
  });

  // Taxonomy membership is checked by us, not trusted from the model.
  const dept = args.taxonomy.find((d) => d.id === result.departmentId);
  if (!dept) throw new Error('router chose a department that does not exist');
  if (result.officeId && !dept.offices.some((o) => o.id === result.officeId)) {
    return { ...result, officeId: null };
  }
  return result;
}

/** Below the floor we present a choice instead of guessing. */
export function needsCitizenChoice(result: RouteResult): boolean {
  return result.confidence < CONFIDENCE_FLOOR && result.alternatives.length > 0;
}
