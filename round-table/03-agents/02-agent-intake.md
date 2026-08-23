# Agent — Intake

> Part of the [Sunvai Round Table](../README.md). Priority **P1**.
> Door B only. Table stakes — see the note at the bottom.

## Job

Turn free-form speech in the citizen's own language into a complete, actionable complaint —
without presenting a form.

## Contract

```ts
intake({
  transcript: string,        // what they said, their language
  lang: Lang,
  turns: Turn[],             // prior exchanges this session
}) => {
  narrative: string,         // cleaned, in THEIR language — never translated here
  facts: {
    what_happened?: string;
    when?: string;           // ISO where determinable, else the citizen's phrasing
    where?: string;          // state / district / office
    who_involved?: string;   // office or role, never a named individual
    already_tried?: string;
    outcome_sought?: string;
    reference_numbers?: string[];
  },
  missing: (keyof facts)[],  // what still blocks routing
  nextQuestion?: string,     // ONE question, their language, or null when done
  readyToRoute: boolean,
}
```

## Rules

**At most four follow-up questions. Then stop.** The failure mode of every "conversational
form" is that it becomes a longer form. Four is a ceiling, not a target — stop the moment
routing is possible.

**Never ask what was already said.** Re-asking a fact the citizen just gave is the fastest
way to signal that nothing is listening. `missing` is computed against everything said so
far, every turn.

**Only ask what genuinely blocks action.** `outcome_sought` and `when` usually matter.
Middle name and pin code do not. If a fact is not needed to route or to make the complaint
actionable, it is not asked.

**`narrative` stays in the citizen's language, always.** This becomes
[`narrative_original`](../02-architecture/02-data-model.md#grievances), which the
[Closure Auditor](05-agent-closure-auditor.md) judges against. It is the citizen's own
account, and it is never overwritten by anything we generate.

**Clean, do not rewrite.** Remove *um*, false starts and duplication. Preserve their words,
their register, their emphasis, their code-mixing. Hinglish is how people speak — never
"corrected".

**Never editorialise.** No sympathy performance, no *"that sounds frustrating"*. One warm
sentence of acknowledgement at most, then work. See
[`../01-product/04-content-and-voice.md`](../01-product/04-content-and-voice.md).

**Assisted filing.** When the citizen indicates they are filing for someone else
([`../01-product/02-india-nuances.md`](../01-product/02-india-nuances.md#3-the-person-filing-is-often-not-the-person-aggrieved)),
capture the aggrieved person's name and the relationship, and hand off to the consent flow.
This is the majority path in rural India, not an edge case.

## Model and settings

Conversational tier. `temperature: 0.3` — warmth is appropriate here and nowhere else in
the pipeline. Streaming, so the transcript appears as they speak.

## Honest positioning

Voice intake with AI follow-up questions in 22 languages is **shipped government
capability** — Samadhan Didi, 30 May 2026. This agent exists so our journey is genuinely
complete, not because it is our contribution.

**Never lead a demo, screen headline or the video with this agent.** See
[`../00-mission/03-competitive-landscape.md`](../00-mission/03-competitive-landscape.md).

**Next:** [`03-agent-router.md`](03-agent-router.md)
